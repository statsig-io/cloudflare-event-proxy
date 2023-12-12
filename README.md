# cloudflare-event-proxy
Example Cloudflare Worker that serves as an event proxy for detecting and redacting PII

### How this works
1. Configure a Cloudflare Worker using this source code
2. Point any Statsig SDK (client or server) at this proxy by overriding using `Initialize Options` ([docs](https://docs.statsig.com/client/jsClientSDK#statsig-options))
3. All requests (initialize, download_config_specs, get_id_lists, exposure events & custom events) will be transmitted through proxy to Statsig
4. Proxy will deserialize payload, detect & redact any sensitive data, and then forward requests to Statsig
   
### Customizing
- Enhance the sensitive data detection in source [here](src/sensitive.js)
- Detec
