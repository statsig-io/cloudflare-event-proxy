# cloudflare-event-proxy
Example Cloudflare Worker that serves as an event proxy for detecting and redacting sensitive data
> Disclaimer: This is a proof-of-concept, and not intended to be deployed into a production environment as is.

![data flow diagram](https://private-user-images.githubusercontent.com/2018204/290591169-64cefb66-28b0-4f9e-adb6-d4d4cc31f36f.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MDI1Nzg2NTEsIm5iZiI6MTcwMjU3ODM1MSwicGF0aCI6Ii8yMDE4MjA0LzI5MDU5MTE2OS02NGNlZmI2Ni0yOGIwLTRmOWUtYWRiNi1kNGQ0Y2MzMWYzNmYucG5nP1gtQW16LUFsZ29yaXRobT1BV1M0LUhNQUMtU0hBMjU2JlgtQW16LUNyZWRlbnRpYWw9QUtJQUlXTkpZQVg0Q1NWRUg1M0ElMkYyMDIzMTIxNCUyRnVzLWVhc3QtMSUyRnMzJTJGYXdzNF9yZXF1ZXN0JlgtQW16LURhdGU9MjAyMzEyMTRUMTgyNTUxWiZYLUFtei1FeHBpcmVzPTMwMCZYLUFtei1TaWduYXR1cmU9ZDk1YzZkNDgzMmJiZWE3NTEyMjMxZDMyYzM0NWYxMzAxNTIxZGE4MjhhMDQzMWIyNTdjMjU0Y2RjMTg1N2ZlZiZYLUFtei1TaWduZWRIZWFkZXJzPWhvc3QmYWN0b3JfaWQ9MCZrZXlfaWQ9MCZyZXBvX2lkPTAifQ.uXlGVLjwyKy6v5yNKJqZSq73csskeq3I79T3LyAHhZk)

### How this works
1. Configure a Cloudflare Worker using this source code
2. Point any Statsig SDK (client or server) at this proxy by overriding `api` within `Initialize Options` ([docs](https://docs.statsig.com/client/jsClientSDK#statsig-options))
3. All SDK requests will be transmitted through proxy to Statsig (route handlers [here](src/index.js#L140))
4. Proxy will deserialize payload, detect & redact any sensitive data, and then forward requests to Statsig

### Demo
Test this locally by running `wrangler dev` and visiting `http://localhost:8787/`
![page](https://private-user-images.githubusercontent.com/2018204/290621247-506adb7b-6755-4f90-b587-41c8d606a55d.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MDI1NzkwMDIsIm5iZiI6MTcwMjU3ODcwMiwicGF0aCI6Ii8yMDE4MjA0LzI5MDYyMTI0Ny01MDZhZGI3Yi02NzU1LTRmOTAtYjU4Ny00MWM4ZDYwNmE1NWQucG5nP1gtQW16LUFsZ29yaXRobT1BV1M0LUhNQUMtU0hBMjU2JlgtQW16LUNyZWRlbnRpYWw9QUtJQUlXTkpZQVg0Q1NWRUg1M0ElMkYyMDIzMTIxNCUyRnVzLWVhc3QtMSUyRnMzJTJGYXdzNF9yZXF1ZXN0JlgtQW16LURhdGU9MjAyMzEyMTRUMTgzMTQyWiZYLUFtei1FeHBpcmVzPTMwMCZYLUFtei1TaWduYXR1cmU9Y2ZmN2Y0M2MwOGVhNTZjNzlmN2Y3ZjZkYjAzNzFiYjc2OGRjY2UyOTU4ODRhM2RmOGExYzNlNGI5NmU5ODM0NiZYLUFtei1TaWduZWRIZWFkZXJzPWhvc3QmYWN0b3JfaWQ9MCZrZXlfaWQ9MCZyZXBvX2lkPTAifQ.m7oRV9uAl-kTwdpNRDyldaQj6Ks4LyBPA9yH47u3ARw)

Here is what you can expect to see in [Statsig livestream](https://docs.statsig.com/guides/logging-events#where-do-these-events-end-up)
![livestream](https://private-user-images.githubusercontent.com/2018204/290621652-626b9eb3-7ae5-412c-8d00-914582f812f3.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MDI1NzkxMDQsIm5iZiI6MTcwMjU3ODgwNCwicGF0aCI6Ii8yMDE4MjA0LzI5MDYyMTY1Mi02MjZiOWViMy03YWU1LTQxMmMtOGQwMC05MTQ1ODJmODEyZjMucG5nP1gtQW16LUFsZ29yaXRobT1BV1M0LUhNQUMtU0hBMjU2JlgtQW16LUNyZWRlbnRpYWw9QUtJQUlXTkpZQVg0Q1NWRUg1M0ElMkYyMDIzMTIxNCUyRnVzLWVhc3QtMSUyRnMzJTJGYXdzNF9yZXF1ZXN0JlgtQW16LURhdGU9MjAyMzEyMTRUMTgzMzI0WiZYLUFtei1FeHBpcmVzPTMwMCZYLUFtei1TaWduYXR1cmU9MDMwOWY0ZGMwMTEwNzQ4ZThlNjNkNmU1ZDRiMzQ4NDY4YmM1ZDk0MjRiMjVkMmM5ZTYzMDI4YjU5MTE1NmRhYyZYLUFtei1TaWduZWRIZWFkZXJzPWhvc3QmYWN0b3JfaWQ9MCZrZXlfaWQ9MCZyZXBvX2lkPTAifQ.E4pNy0gAsQbRthXSF_mozv5SPNOUbFASdffkvvJ2o3U)
   
### Customizing
- Enhance the sensitive data detection in source [here](src/sensitive.js)
- Determine if you want to _only_ override events endpoints 
