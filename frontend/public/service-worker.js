"use strict";
(() => {
  // src/workers/constants.ts
  var CARTOCDN_BASEMAP = "basemaps.";
  var MAPBOX_BASEMAP = "mapbox.";
  var OPENSTREETMAP_BASEMAP = "tile.";
  var SHOM_BASEMAP = "data.shom.";
  var REGULATIONS = "/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=monitorfish:regulations&outputFormat=application/json&propertyName=id,law_type,topic,gears,species,regulatory_references,zone,region,next_id";
  var INFRACTIONS = "/api/v1/infractions";
  var WHITELISTED_BASE_MAPS_PATHS = [CARTOCDN_BASEMAP, MAPBOX_BASEMAP, OPENSTREETMAP_BASEMAP, SHOM_BASEMAP];
  var WHITELISTED_AND_READ_ONLY_PATHS = [REGULATIONS, INFRACTIONS];
  var STATIC_ASSETS = ["/landing_background.png"];
  var APPLICATION_ROUTES = [
    "/light",
    "/load_light",
    "/backoffice",
    "/regulation",
    "/regulation/new",
    "/regulation/edit",
    "/control_objectives",
    "/fleet_segments",
    "/ext",
    "/side_window"
  ];
  var CACHED_REQUEST_SIZE = "CACHED_REQUEST_SIZE";
  var UPDATE_CACHE = "UPDATE_CACHE";

  // src/workers/utils.ts
  var getCacheKey = (url) => {
    if (url.includes(CARTOCDN_BASEMAP)) {
      return url.split(CARTOCDN_BASEMAP)[1] || "";
    }
    if (url.includes(MAPBOX_BASEMAP)) {
      return url.split(MAPBOX_BASEMAP)[1] || "";
    }
    if (url.includes(OPENSTREETMAP_BASEMAP)) {
      return url.split(OPENSTREETMAP_BASEMAP)[1] || "";
    }
    if (url.includes(SHOM_BASEMAP)) {
      return url.split(SHOM_BASEMAP)[1] || "";
    }
    if (url.includes(REGULATIONS)) {
      return REGULATIONS;
    }
    return url;
  };

  // src/workers/serviceWorker.ts
  var CACHE_VERSION = 0;
  var CACHE_NAME = `cache-v${CACHE_VERSION}`;
  self.addEventListener("install", (event) => {
    console.log("Attempting to install service worker");
    event.waitUntil(
      caches.open(CACHE_NAME).then(
        (cache) => (
          /**
           * Add all static files to the cache
           */
          cache.addAll(STATIC_ASSETS)
        )
      ).catch((err) => console.log(err))
    );
  });
  self.addEventListener("activate", (event) => {
    console.log("Activating new service worker...");
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        self.clients.claim();
        return Promise.all(
          cacheNames.map((storedCacheName) => {
            if (storedCacheName !== CACHE_NAME) {
              return caches.delete(storedCacheName);
            }
            return Promise.reject();
          })
        );
      })
    );
  });
  self.addEventListener("message", async (event) => {
    if (event.data === CACHED_REQUEST_SIZE) {
      const cache = await caches.open(CACHE_NAME);
      const requests = await cache.keys();
      event.source?.postMessage({
        data: requests.length,
        type: CACHED_REQUEST_SIZE
      });
    }
    if (event.data === UPDATE_CACHE) {
      const cache = await caches.open(CACHE_NAME);
      try {
        await cache.delete(new Request(INFRACTIONS));
        await cache.add(INFRACTIONS);
      } catch (e) {
        event.source?.postMessage({
          data: e,
          type: UPDATE_CACHE
        });
        return;
      }
      try {
        await cache.delete(new Request(REGULATIONS));
        await cache.add(REGULATIONS);
      } catch (e) {
        event.source?.postMessage({
          data: e,
          type: UPDATE_CACHE
        });
        return;
      }
      event.source?.postMessage({
        type: UPDATE_CACHE
      });
    }
  });
  self.addEventListener("fetch", (event) => {
    event.respondWith(
      (async () => {
        const url = event.request.url.toString();
        const cacheKey = getCacheKey(url);
        const cacheKeyRequest = new Request(cacheKey);
        return getResponse(cacheKeyRequest, event.request);
      })()
    );
  });
  async function getResponse(cacheRequest, request) {
    const url = request.url.toString();
    const isReadOnlyWhitelisted = WHITELISTED_AND_READ_ONLY_PATHS.find((path) => url.endsWith(path));
    if (!WHITELISTED_BASE_MAPS_PATHS.find((path) => url.includes(path)) && !isReadOnlyWhitelisted) {
      if (APPLICATION_ROUTES.find((route) => url.endsWith(route))) {
        return fetch("/");
      }
      return fetch(request);
    }
    const responseFromCache = await caches.match(cacheRequest);
    if (responseFromCache) {
      return responseFromCache;
    }
    const responseFromFetch = await fetch(request);
    if (responseFromFetch.status !== 200) {
      console.log(
        `Error: ${url} URL could not be fetched (${responseFromFetch.status} - ${responseFromFetch.statusText})`
      );
      return responseFromFetch;
    }
    const cache = await caches.open(CACHE_NAME);
    if (!isReadOnlyWhitelisted) {
      await cache.put(cacheRequest, responseFromFetch.clone());
    }
    return responseFromFetch;
  }
})();
