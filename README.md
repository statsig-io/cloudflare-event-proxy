# cloudflare-event-proxy
Example Cloudflare Worker that serves as an event proxy for detecting and redacting sensitive data

### How this works
1. Configure a Cloudflare Worker using this source code
2. Point any Statsig SDK (client or server) at this proxy by overriding using `Initialize Options` ([docs](https://docs.statsig.com/client/jsClientSDK#statsig-options))
3. All SDK requests will be transmitted through proxy to Statsig (route handlers [here](src/index.js#L140))
4. Proxy will deserialize payload, detect & redact any sensitive data, and then forward requests to Statsig

![flow](https://private-user-images.githubusercontent.com/2018204/290584887-65f1004a-81c1-4fa6-995b-9314cf40e488.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MDI1NzE2MjEsIm5iZiI6MTcwMjU3MTMyMSwicGF0aCI6Ii8yMDE4MjA0LzI5MDU4NDg4Ny02NWYxMDA0YS04MWMxLTRmYTYtOTk1Yi05MzE0Y2Y0MGU0ODgucG5nP1gtQW16LUFsZ29yaXRobT1BV1M0LUhNQUMtU0hBMjU2JlgtQW16LUNyZWRlbnRpYWw9QUtJQUlXTkpZQVg0Q1NWRUg1M0ElMkYyMDIzMTIxNCUyRnVzLWVhc3QtMSUyRnMzJTJGYXdzNF9yZXF1ZXN0JlgtQW16LURhdGU9MjAyMzEyMTRUMTYyODQxWiZYLUFtei1FeHBpcmVzPTMwMCZYLUFtei1TaWduYXR1cmU9Y2UyMmY3NDdjOGY4NGNmZWM5MTk1ZjEyNjM4MWZhM2U3OWJkODFkZjQyZjRkN2Y4YjVkZTIzODQ4N2E3OGZhZiZYLUFtei1TaWduZWRIZWFkZXJzPWhvc3QmYWN0b3JfaWQ9MCZrZXlfaWQ9MCZyZXBvX2lkPTAifQ.5QR7m6mQrr2GhlVDF019RDKNxvjgfJ3T1bVcyOnDNag)
   
### Customizing
- Enhance the sensitive data detection in source [here](src/sensitive.js)
- Determine if you want to _only_ override events endpoints 
