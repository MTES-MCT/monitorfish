# Workers

## Service worker

The service worker is working for all paths of the application (the registration scope is defined as `/` in `registerServiceWorker.ts`).

### Usage

The caching is done under the hood when a request is done (see `Caching` below).

A precache page can be found at `load_offline` to precache:
- Light map tiles
- Whitelisted URLs (regulations and infractions referential)

This pae is used to monitor the number and size of the tiles downloaded.

### Caching

#### SPA routes

If the fetch URL ends with in `APPLICATION_ROUTES`, the cache will be bypassed, so we cann handle the routes defined in `router.ts`.

#### Map tiles

All paths included in `WHITELISTED_BASE_MAPS_PATHS` will be cached when doing a `fetch()`

#### Caching of other assets

The cache of the URLs included in `WHITELISTED_AND_READ_ONLY_PATHS` will be served if found, if not they won't update the cache entry (the cache is read-only).

To update the cache, a `message` of type `UPDATE_CACHE` must be sent to the service worker.

### Bundle

The service worker is bundled with `npm run bundle-sw` and copied to the `public/` folder.
> /!\ Take care of re-bundling it when doing modification to `serviceWorker.ts`. 

### Upgrade

1. Do not modify the service worker filename (stored in `public/` as `service-worker.js`)
2. When the service worker code is modified, the upgrade will be installed under the hood,
   but all tabs/windows of MonitorFish must be closed for the new SW to be "active".
   
### Erase cache

To delete existing cache, increment `CACHE_VERSION` of `serviceWorker.ts`, the old cache will be deleted.

## Web worker

Web workers are instantiated and used by use-cases.
