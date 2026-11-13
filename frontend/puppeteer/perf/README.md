# Performance budgets

Specs measuring what makes MonitorFish slow on low-bandwidth (patrol vessels on satellite links) and low-CPU (office
computers) environments. They run in a real Chrome (`channel: 'chrome'`), to use the DevTools protocol: network
requests, CPU throttling and long animation frames.

They run against a **production build** (bundle sizes and runtime costs differ from the dev server), logged in as the
local **non-super-user** of Keycloak (`user` in `infra/dev/keycloak/realm-monitor-dev.json`).

## Run

```sh
# Terminal 1: database, Keycloak, GeoServer stubs and backend (OIDC enabled)
make run-back

# Terminal 2: production build with the local `.env`, served on port 3000
./frontend/puppeteer/perf/build-for-perf.sh
cd frontend && ./node_modules/.bin/vite preview --port 3000 --strictPort

# Terminal 3
cd frontend && npm run test:perf
```

`IS_HEADLESS=false npm run test:perf` shows the browser.

## Budgets

| Spec                        | Budget                                                                         |
| --------------------------- | ------------------------------------------------------------------------------ |
| `bundle.spec.ts`            | Web worker < 150 KB gzipped                                                    |
| `startup.spec.ts`           | Each referential fetched once, no login background downloaded on the map       |
| `startup_order.spec.ts`     | Referentials downloaded after the vessels, regulatory catalog with the species |
| `vessels_rendering.spec.ts` | < 1.8 s of long animation frames to process the vessels, with a CPU slowed ×6  |
| `vessel_sidebar.spec.ts`    | The logbook is fetched in parallel of the vessel                               |
| `regulatory_layers.spec.ts` | The zones of a regulatory layer are fetched in a single request                |
| `polling.spec.ts`           | Super-user: the side window lists are polled only while displayed              |

Local data is smaller than production: absolute durations and sizes must also be checked on production.
