const CARTOCDN_BASEMAP = "basemaps."
const MAPBOX_BASEMAP = "mapbox."
const OPENSTREETMAP_BASEMAP = "tile."
const SHOM_BASEMAP = "data.shom."

const whitelistedBaseMaps = [
  CARTOCDN_BASEMAP,
  MAPBOX_BASEMAP,
  OPENSTREETMAP_BASEMAP,
  SHOM_BASEMAP
]

const staticAssets = [
  "/landing_background.png"
]

const getImageCacheKey = (src) => {
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

let cacheVersion = 0
let cacheName = `cache-v${cacheVersion}`

function increment() {
  cacheVersion ++
  cacheName = `cache-v${cacheVersion}`
}

// Add cache while installing Sw
self.addEventListener("install", (event) => {
  console.log("Attempting to install service worker")

  event.waitUntil(
    caches
      .open(cacheName)
      .then(cache => {
        // Update version
        increment()

        // add static files to the cache
        return cache.addAll(staticAssets)
      })
      .catch((err) => console.log(err))
  )
})

self.addEventListener("activate", (event) => {
  console.log("Activating new service worker...")

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      // Use fetch event handling right away
      self.clients.claim()

      return Promise.all(
        // @ts-ignore
        cacheNames.map((storedCacheName) => {
          if (storedCacheName !== cacheName) {
            return caches.delete(storedCacheName)
          }
        })
      )
    })
  )
})

self.addEventListener("fetch", event => {
  event.respondWith((async function() {
    const url = event.request.url.toString()

    const cacheKey = getImageCacheKey(event.request.url.toString())
    const cacheKeyRequest = new Request(cacheKey)

    return await getResponse(cacheKeyRequest, url)
  })())
})

async function getResponse (cacheRequest, url) {
  if (!whitelistedBaseMaps.find(baseMap => url.includes(baseMap))) {

    return fetch(url)
  }

  const responseFromCache = await caches.match(cacheRequest)
  if (responseFromCache) {
    return responseFromCache
  }

  const responseFromFetch = await fetch(url)
  if (responseFromFetch.status !== 200) {
    console.log(`Error: ${url} URL could not be fetched (${responseFromFetch.status} - ${responseFromFetch.statusText})`)

    return
  }

  // Caching and returning the response if it doesn't exist in the cache
  const cache = await caches.open(cacheName)
  await cache.put(cacheRequest, responseFromFetch.clone())

  return responseFromFetch
}
