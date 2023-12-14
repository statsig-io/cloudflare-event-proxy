# cloudflare-event-proxy
Example Cloudflare Worker that serves as an event proxy for detecting and redacting sensitive data

![data flow diagram](https://private-user-images.githubusercontent.com/2018204/290591169-64cefb66-28b0-4f9e-adb6-d4d4cc31f36f.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MDI1NzI5MjEsIm5iZiI6MTcwMjU3MjYyMSwicGF0aCI6Ii8yMDE4MjA0LzI5MDU5MTE2OS02NGNlZmI2Ni0yOGIwLTRmOWUtYWRiNi1kNGQ0Y2MzMWYzNmYucG5nP1gtQW16LUFsZ29yaXRobT1BV1M0LUhNQUMtU0hBMjU2JlgtQW16LUNyZWRlbnRpYWw9QUtJQUlXTkpZQVg0Q1NWRUg1M0ElMkYyMDIzMTIxNCUyRnVzLWVhc3QtMSUyRnMzJTJGYXdzNF9yZXF1ZXN0JlgtQW16LURhdGU9MjAyMzEyMTRUMTY1MDIxWiZYLUFtei1FeHBpcmVzPTMwMCZYLUFtei1TaWduYXR1cmU9ODg0NTJlMmVhZTM5NWIwYmIzYzY1NDU5MGFhZDM1MGJiNzE0NzJiMDY0NGMwZDBjMTgwNzBkNzlhYmVhNTA5NSZYLUFtei1TaWduZWRIZWFkZXJzPWhvc3QmYWN0b3JfaWQ9MCZrZXlfaWQ9MCZyZXBvX2lkPTAifQ.JXN8LbGrpvbSa2_N3B8m2I5DzxHlSdVjfQlUyrxynZg)

### How this works
1. Configure a Cloudflare Worker using this source code
2. Point any Statsig SDK (client or server) at this proxy by overriding using `Initialize Options` ([docs](https://docs.statsig.com/client/jsClientSDK#statsig-options))
3. All SDK requests will be transmitted through proxy to Statsig (route handlers [here](src/index.js#L140))
4. Proxy will deserialize payload, detect & redact any sensitive data, and then forward requests to Statsig
   
### Customizing
- Enhance the sensitive data detection in source [here](src/sensitive.js)
- Determine if you want to _only_ override events endpoints 
