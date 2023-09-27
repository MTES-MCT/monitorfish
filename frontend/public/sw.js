/// <reference lib="webworker" />

const CARTOCDN_BASEMAP = 'basemaps.'
const MAPBOX_BASEMAP = 'mapbox.'
const OPENSTREETMAP_BASEMAP = 'tile.'
const SHOM_BASEMAP = 'data.shom.'

const whitelistedBaseMaps = [CARTOCDN_BASEMAP, MAPBOX_BASEMAP, OPENSTREETMAP_BASEMAP, SHOM_BASEMAP]

const staticAssets = ['/landing_background.png']

const getImageCacheKey = src => {
  if (src.includes(CARTOCDN_BASEMAP)) {
    return src.split(CARTOCDN_BASEMAP)[1] || ''
  }

  if (src.includes(MAPBOX_BASEMAP)) {
    return src.split(MAPBOX_BASEMAP)[1] || ''
  }

  if (src.includes(OPENSTREETMAP_BASEMAP)) {
    return src.split(OPENSTREETMAP_BASEMAP)[1] || ''
  }

  if (src.includes(SHOM_BASEMAP)) {
    return src.split(SHOM_BASEMAP)[1] || ''
  }

  return ''
}

const routes = [
  '/nav',
  '/load_offline',
  '/backoffice',
  'regulation',
  'regulation/new',
  'regulation/edit',
  'control_objectives',
  'fleet_segments',
  '/ext',
  '/side_window'
]

/**
 * /!\ NOTICE :
 *
 * When upgrading this Service Worker, increment `CACHE_VERSION` so the browser will re-install the new version
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
        cache.addAll(staticAssets)
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
       * If a new service worker in activated, it will delete the old cache entries
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
  if (event.data === 'cached') {
    const cache = await caches.open(CACHE_NAME)
    const requests = await cache.keys()

    console.log(event.source, 'source')
    // @ts-ignore
    event.source?.postMessage({ cachedLength: requests.length})
    return
  }
})

/**
 * Entrypoint - when fetching an asset or an API
 */
self.addEventListener('fetch', event => {
  event.respondWith(
    (async () => {
      const url = event.request.url.toString()

      const cacheKey = getImageCacheKey(event.request.url.toString())
      const cacheKeyRequest = new Request(cacheKey)

      return getResponse(cacheKeyRequest, url)
    })()
  )
})

async function getResponse(cacheRequest, url) {
  /**
   * If the request is not a base map whitelisted request, it will fetch the content and NOT cache it.
   */
  if (!whitelistedBaseMaps.find(baseMap => url.includes(baseMap))) {
    /**
     * If the route is part of React's router, redirect to index.html as it is a SPA
     */
    if (routes.find(route => url.includes(route))) {
      return false
    }

    return fetch(url)
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
  const responseFromFetch = await fetch(url)
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
