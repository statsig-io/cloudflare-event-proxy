# cloudflare-event-proxy
Example Cloudflare Worker that serves as an event proxy for detecting and redacting sensitive data
> Disclaimer: This is a proof-of-concept, and not intended to be deployed into a production environment as is.

![data flow diagram](/assets/flow.png)

### How this works
1. Configure a Cloudflare Worker using this source code
2. Point any Statsig SDK (client or server) at this proxy by overriding `api` within `Initialize Options` ([docs](https://docs.statsig.com/client/jsClientSDK#statsig-options))
3. All SDK requests will be transmitted through proxy to Statsig (route handlers [here](src/index.js#L140))
4. Proxy will deserialize payload, detect & redact any sensitive data, and then forward requests to Statsig

### Demo
Test this locally by running `wrangler dev` and visiting `http://localhost:8787/`
![page](/assets/demo.png)

Here is what you can expect to see in [Statsig livestream](https://docs.statsig.com/guides/logging-events#where-do-these-events-end-up)
![livestream](/assets/stream.png)
   
### Customizing
- Enhance the sensitive data detection in source [here](src/sensitive.js)
- Determine if you want to _only_ override events endpoints 
