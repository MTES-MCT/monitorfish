/// <reference lib="webworker" />

import {
  APPLICATION_ROUTES,
  CACHED_REQUEST_SIZE,
  INFRACTIONS,
  REGULATIONS,
  STATIC_ASSETS,
  UPDATE_CACHE,
  WHITELISTED_API_PATHS,
  WHITELISTED_BASE_MAPS_PATHS
} from './constants'
import { getCacheKey } from './utils'

declare let self: ServiceWorkerGlobalScope

/**
 * /!\ NOTICE
 *
 * UPGRADE:
 * 1. Do not modify the service worker filename (stored in public/ as `service-worker.js`)
 * 2. When the service worker code is modified, the upgrade will be installed under the hood,
 *    but all tabs/windows of MonitorFish must be closed for the new SW to be "active".
 *
 * ERASE CACHE:
 * To delete existing cache, increment `CACHE_VERSION`, the old cache will be deleted.
 *
 */
const CACHE_VERSION = 0
const CACHE_NAME = `cache-v${CACHE_VERSION}`

/**
 * At first, the SW is installed.
 * Note that the SW is not yet running, as it needs to be activated before.
 */
self.addEventListener('install', event => {
  // eslint-disable-next-line no-console
  console.log('Attempting to install service worker')

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache =>
        /**
         * Add all static files to the cache
         */
        cache.addAll(STATIC_ASSETS)
      )
      // eslint-disable-next-line no-console
      .catch(err => console.log(err))
  )
})

/**
 * After being installed and on page reload, the SW is activated
 */
self.addEventListener('activate', event => {
  // eslint-disable-next-line no-console
  console.log('Activating new service worker...')

  event.waitUntil(
    caches.keys().then(cacheNames => {
      /**
       * The claim() method causes those pages to be controlled immediately - Use fetch event handling right away.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Clients/claim
       */
      // @ts-ignore
      self.clients.claim()

      /**
       * If a new service worker is activated, it will delete the old cache entries
       */
      return Promise.all(
        cacheNames.map(storedCacheName => {
          if (storedCacheName !== CACHE_NAME) {
            return caches.delete(storedCacheName)
          }

          return Promise.reject()
        })
      )
    })
  )
})

/**
 * Custom message
 */
self.addEventListener('message', async event => {
  if (event.data === CACHED_REQUEST_SIZE) {
    const cache = await caches.open(CACHE_NAME)
    const requests = await cache.keys()

    // @ts-ignore
    event.source?.postMessage({
      data: requests.length,
      type: CACHED_REQUEST_SIZE
    })
  }

  if (event.data === UPDATE_CACHE) {
    const cache = await caches.open(CACHE_NAME)
    await cache.delete(new Request(REGULATIONS))
    await cache.delete(new Request(INFRACTIONS))

    // @ts-ignore
    event.source?.postMessage({
      type: UPDATE_CACHE
    })
  }
})

/**
 * Entrypoint - when fetching an asset or an API
 */
self.addEventListener('fetch', event => {
  event.respondWith(
    (async () => {
      const url = event.request.url.toString()

      const cacheKey = getCacheKey(url)
      const cacheKeyRequest = new Request(cacheKey)

      return getResponse(cacheKeyRequest, event.request)
    })()
  )
})

async function getResponse(cacheRequest, request) {
  const url = request.url.toString()
  /**
   * If the request is not a base map whitelisted request, it will fetch the content and NOT cache it.
   */
  if (
    !WHITELISTED_BASE_MAPS_PATHS.find(path => url.includes(path)) &&
    !WHITELISTED_API_PATHS.find(path => url.includes(path))
  ) {
    /**
     * If the route is part of React's router, redirect to index.html as it is a SPA
     */
    if (APPLICATION_ROUTES.find(route => url.includes(route))) {
      return fetch('/')
    }

    return fetch(request)
  }

  /**
   * Else, we check if a cached version of the map is stored
   */
  const responseFromCache = await caches.match(cacheRequest)
  if (responseFromCache) {
    return responseFromCache
  }

  /**
   * If not, we fetch the assert
   */
  const responseFromFetch = await fetch(request)
  if (responseFromFetch.status !== 200) {
    // eslint-disable-next-line no-console
    console.log(
      `Error: ${url} URL could not be fetched (${responseFromFetch.status} - ${responseFromFetch.statusText})`
    )

    return responseFromFetch
  }

  const cache = await caches.open(CACHE_NAME)
  /**
   * We store the new cache entry
   */
  await cache.put(cacheRequest, responseFromFetch.clone())

  return responseFromFetch
}
