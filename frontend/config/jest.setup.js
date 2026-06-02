// To fix `Warning: `fetch` is not available. Please supply a custom `fetchFn` property to use `fetchBaseQuery` on SSR environments.`.
import 'whatwg-fetch'

// Polyfill for TextEncoder/TextDecoder which are required by ky library
import { TextEncoder, TextDecoder } from 'util'

Object.assign(global, { TextDecoder, TextEncoder })

// Polyfill for structuredClone which is required by MonitorFishWebWorker
global.structuredClone = function structuredClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

// Force the e-ISR feature flag on for unit tests so behaviour is deterministic and independent of
// any local `.env` (CI has none, so it would otherwise default to `false`). This must live in
// `setupFiles` so it is set before the `MissionForm/constants` module — which reads
// `import.meta.env.FRONTEND_E_ISR_ENABLED` at load time — is first imported.
// Tests that need the flag off should mock the constants module locally (see useIsEISREnabled.test.ts).
process.env.FRONTEND_E_ISR_ENABLED = 'true'
