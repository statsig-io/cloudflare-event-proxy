/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

const {Hono} = require('hono');
const {cors} = require('hono/cors');
const staticPageHTML = require('./page.js');
const hasSensitiveData = require('./sensitive.js');

const app = new Hono();
app.use('/v1/*', cors());

app.get('/', async c => {
  const requestUrl = new URL(c.req.url),
        fullHost = `${requestUrl.protocol}//${requestUrl.hostname}${requestUrl.port ? `:${requestUrl.port}` : ''}`;
  return c.html(staticPageHTML(fullHost));
});

// proxy initialize
app.post('/v1/initialize', async c => {
  const statsigResponse = await fetch(new Request('https://featuregates.org/v1/initialize', c.req.raw));
  return c.newResponse(statsigResponse.body, statsigResponse);
});

// server-sdk endpoints
app.on('POST', ['/v1/get_id_lists', '/v1/download_config_specs'], async c => {
  const statsigResponse = await fetch(new Request(`https://statsigapi.net/${c.req.path}`, c.req.raw));
  return c.newResponse(statsigResponse.body, statsigResponse);
});

// all event endpoints
app.on('POST', ['/v1/rgstr', '/v1/events', '/v1/log_event'], async c => {
  let proxyToUrl;
  if (c.req.path === '/v1/events' || c.req.path === '/v1/log_event') proxyToUrl = 'https://events.statsigapi.net/v1/log_event'; // for http api and server sdks		
  else if (c.req.path === '/v1/rgstr') proxyToUrl = 'https://events.statsigapi.net/v1/rgstr'; // for sdks
  const body = await c.req.json();
  const headersCopy = Object.fromEntries(c.req.raw.headers);

  const newBatch = [];
  const redactions = [];
  for (let event of body.events) {      
    // Look at User Attributes
    if (event.user && event.user.custom) { // diagnostics events dont have all props        
      const userIds = [event.user.userID].concat(Object.values(event.user.customIDs || {})).filter(v => v);
      for (let [key, val] of Object.entries(event.user.custom)) {
        const detectedSensitiveData = hasSensitiveData(val);
        if (detectedSensitiveData) {
          // scrub sensitive data from user attributes
          event.user.custom[key] = `REDACTED:${detectedSensitiveData}`;
          console.log(`Redaction <Event: ${event.eventName}>.User{${userIds.join(',')}}.Custom{${key}: ${detectedSensitiveData}}`);
          !event.eventName.includes('statsig::') && redactions.push({
            type: detectedSensitiveData, 
            location: 'user_attributes',
            event: event.eventName,             
            // copy the object because we're going modify it
            user: Object.assign({}, event.user) 
          });
        }
      }
    }
    // Look at Event Metadata, except for statsig reserved/telemetry events
    if (event.metadata && !event.eventName.includes('statsig::')) { 
      for (let [key, val] of Object.entries(event.metadata)) {
        const detectedSensitiveData = hasSensitiveData(val);
        if (detectedSensitiveData) {
          // scrub sensitive data from event metadata
          event.metadata[key] = `REDACTED:${detectedSensitiveData}`;
          console.log(`Redaction <Event: ${event.eventName}>.Metadata{${key}: ${detectedSensitiveData}}`);
          redactions.push({
            type: detectedSensitiveData, 
            location: 'event_metadata',
            event: event.eventName,             
            // copy the object because we're going modify it
            user: Object.assign({}, event.user) 
          });
        }
      }
    }
    newBatch.push(event);
  }

  body.events = newBatch;  
  const newRequestInit = {
    method: "POST",
    body: JSON.stringify(body),
    headers: headersCopy,
  };
  const statsigResponse = await fetch(proxyToUrl, newRequestInit); 
  const statsigResponseBody = await statsigResponse.json();
  const statsigResponseHeaders = Object.fromEntries(statsigResponse.headers);
  return c.newResponse(JSON.stringify(statsigResponseBody), {
    status: statsigResponse.status,
    headers: statsigResponseHeaders,
  });
});

export default app;