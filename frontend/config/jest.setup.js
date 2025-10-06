// To fix `Warning: `fetch` is not available. Please supply a custom `fetchFn` property to use `fetchBaseQuery` on SSR environments.`.
import 'whatwg-fetch'

// Polyfill for TextEncoder/TextDecoder which are required by ky library
import { TextEncoder, TextDecoder } from 'util'

Object.assign(global, { TextDecoder, TextEncoder })
