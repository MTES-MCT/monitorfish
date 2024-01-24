# Multi-windows tests

These E2E tests are meant to **only** test multi-windows interactions (see ADR @adrs/0002-mission-form-sync-e2e-tests.md).

### Run

Multi-windows tests will run MonitorEnv (app and db) as docker containers. MonitorEnv APIs will allow us to create new Missions, listen to Mission events (with SSE), etc.

> The `monitorenv-app` docker image version used in `docker-compose.yml` and `docker-compose.dev.yml` is the version with stabilized Mission APIs.

To run `puppeteer` multi-windows tests:
1. In a first terminal, execute `make run-backend-for-puppeteer`.
2. In a second terminal, execute `make run-frontend-for-puppeteer`.
3. In a third terminal, execute `cd frontend && npm run test:multi-windows:open` to execute tests.

