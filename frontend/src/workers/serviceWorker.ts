/// <reference lib="webworker" />

import {
  APPLICATION_ROUTES,
  CACHED_REQUEST_SIZE,
  DELETE_CACHE,
  STATIC_ASSETS,
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
 * Custom message used by the application.
 *
 * Types are:
 * - CACHED_REQUEST_SIZE:
 *      Get the size of all cached requests
 * - DELETE_CACHE:
 *      Delete all caches
 * - UPDATE_CACHE:
 *      This message us used to write and update the WHITELISTED_AND_READ_ONLY_PATHS.
 *      These paths caches can't be updated by the `fetch()` method.
 *      /!\ Note that this update of cache is no more used by the application.
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

  if (event.data === DELETE_CACHE) {
    try {
      const cachesNames = await caches.keys()

      cachesNames.forEach(storedCacheName => {
        // eslint-disable-next-line no-console
        console.log(`Deleting cache ${storedCacheName}...`)

        caches.delete(storedCacheName)
      })
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(`Error: The cache could not be deleted: ${e}`)
    }
  }
})

/**
 * Entrypoint - when fetching an asset or an API
 */
self.addEventListener('fetch', event => {
  const url = event.request.url.toString()
  const urlObj = new URL(url)

  // Only intercept same-origin requests or whitelisted external basemap requests
  if (urlObj.origin !== self.location.origin && !WHITELISTED_BASE_MAPS_PATHS.find(path => url.includes(path))) {
    return // Let browser handle external requests naturally
  }

  event.respondWith(
    (async () => {
      const cacheKey = getCacheKey(url)
      const cacheKeyRequest = new Request(cacheKey)

      return getResponse(cacheKeyRequest, event.request)
    })()
  )
})

async function getResponse(cacheRequest: Request, request: Request) {
  const url = request.url.toString()

  /**
   * If the request is not a whitelisted request, it will fetch the content and NOT cache it.
   */
  if (!WHITELISTED_BASE_MAPS_PATHS.find(path => url.includes(path))) {
    /**
     * If the route is part of React's router, redirect to index.html as it is a SPA
     */
    if (APPLICATION_ROUTES.find(route => url.endsWith(route))) {
      return fetch('/')
    }

    return fetch(request)
  }

  /**
   * We check if a cached version of the request is stored
   */
  const responseFromCache = await caches.match(cacheRequest)
  if (responseFromCache) {
    return responseFromCache
  }

  /**
   * If not, we fetch the request
   */
  const responseFromFetch = await fetch(request)
  // eslint-disable-next-line no-console
  console.log(`Fetching ${request.url.toString()}...`)
  if (responseFromFetch.status !== 200) {
    // eslint-disable-next-line no-console
    console.log(
      `Error: ${url} URL could not be fetched (${responseFromFetch.status} - ${responseFromFetch.statusText})`
    )

    return responseFromFetch
  }

  try {
    const cache = await caches.open(CACHE_NAME)
    await cache.put(cacheRequest, responseFromFetch.clone())
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(`Error: The cache could not be updated: ${e}`)
  }

  return responseFromFetch
}
