# cloudflare-event-proxy
Example proxy for detecting and redacting PII

### How this works
1. Configure a Cloudflare Worker using this source code
2. Point any Statsig SDK at this proxy by overriding using `initOption`
3. All requests (initialize, exposure events, and custom events) will be transmitted through proxy to Statsig
4. Proxy will deserialize payload, detect & redact any sensitive data, and then forward requests to Statsig
   
