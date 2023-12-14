/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

const staticPageHTML = require('./page.js');
const hasSensitiveData = require('./sensitive.js');

/**
 * Reponses for web route handlers need CORs headers 
 * @returns <Response>
 * Arg 1 = Response Body
 * Arg 2 = <Object> with request options
 */
const corsResponse = function () {
  const response = new Response(...arguments);
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET,HEAD,POST,OPTIONS");
  response.headers.set("Access-Control-Max-Age", "86400");
  response.headers.set("Access-Control-Allow-Headers", "*");
  return response;
}

async function logRedactions(redactions=[], apiKey = '') {    // POST request using fetch with async/await
  const response = await fetch('https://events.statsigapi.net/v1/log_event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'statsig-api-key': apiKey },
    body: JSON.stringify({
      "events": redactions.map(entry => {
        if(entry.user.custom) delete entry.user.custom;
        return {
           "eventName": 'redaction',
           "time": Math.round((new Date).getTime() / 1000),
           "user": entry.user,
           "value": entry.type,
           "metadata": {'event': entry.event, 'location': entry.location}
         };
     })
    })
  });
  if(!response.ok) {
    const data = await response.json();
    console.error(`Bad redaction event request`, data);
  }  
}

async function scrubAndProxyEvents(request, env, path) {
  request.jsonBody = await request.json();
  request.parsedHeaders = Object.fromEntries(request.headers);  

  try {
    let proxyToUrl;
    if (path === '/events' || path === '/log_event') proxyToUrl = 'https://events.statsigapi.net/v1/log_event'; // for http api and server sdks		
    else if (path === '/rgstr') proxyToUrl = 'https://events.statsigapi.net/v1/rgstr'; // for sdks
    else throw Error('Uh oh, unknown url detected');

    const batch = request.jsonBody.events;
    const newBatch = [];
    const redactions = [];
    // console.log(`Before: \n ${JSON.stringify(batch, null, 2)}`);
    for (let event of batch) {      
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

    /**
     * send these detections back to statsig to monitor [optional, gets noisy]
     * uses the same STATSIG-API-KEY included on the event request headers
     * logRedactions(redactions, request.parsedHeaders['statsig-api-key'])
     */

    // console.log(`After: \n ${JSON.stringify(newBatch, null, 2)}`);
    request.jsonBody.events = newBatch;

    // Request object cannot be mutated, so unfortunately you have to create a new one
    const newRequestInit = {
      method: "POST",
      body: JSON.stringify(request.jsonBody),
      headers: request.parsedHeaders,
    };
    const statsigResponse = await fetch(proxyToUrl, newRequestInit);
    return corsResponse(statsigResponse.body, statsigResponse);
  } catch (err) {
    console.log('Error', err);
    return corsResponse("Error processing", { status: 404 });
  }
}

export default {
  async fetch(request, env, ctx) {
    const requestUrl = new URL(request.url),
          fullHost = `${requestUrl.protocol}//${requestUrl.hostname}${requestUrl.port ? `:${requestUrl.port}` : ''}`;
            
    // serves the demo webpage
    if (requestUrl.pathname === '/' && request.method === "GET") {
      return new Response(staticPageHTML(fullHost), {
        headers: { "content-type": 'text/html; charset="UTF-8"' }
      });
    }
    // client SDK endpoints
    else if (['/rgstr', '/events'].includes(requestUrl.pathname) && request.method === "POST") {
      return await scrubAndProxyEvents(request, env, requestUrl.pathname);
    }
    else if (['/initialize'].includes(requestUrl.pathname) && request.method === "POST") {
      const statsigResponse = await fetch(new Request('https://featuregates.org/v1/initialize', request));
      return corsResponse(statsigResponse.body, statsigResponse);
    }
    else if (request.method === 'OPTIONS') {
      return corsResponse("Ok", { status: 200 });
    }
    // server SDK endpoints
    else if (['/log_event'].includes(requestUrl.pathname) && request.method === "POST") {
      return await scrubAndProxyEvents(request, env, requestUrl.pathname);
    }    
    else if (['/get_id_lists', '/download_config_specs'].includes(requestUrl.pathname) && request.method === "POST") {
      return await fetch(new Request(`https://statsigapi.net/v1${requestUrl.pathname}`, request));
    }    
    else {
      return corsResponse("Bad request", { status: 400 });
    }
  }
};
