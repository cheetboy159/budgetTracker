const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/index.js",
    "/styles.css",
    "/db.js",
    // "/assets/css/style.css",
    // "/assets/js/loadPosts.js",
    // "/assets/images/Angular-icon.png",
    // "/assets/images/React-icon.png",
    // "/assets/images/Vue.js-icon.png",
    "/manifest.webmanifest",
    // "/favicon.ico",
    // "/assets/images/icons/icon-72x72.png",
    // "/assets/images/icons/icon-96x96.png",
    // "/assets/images/icons/icon-128x128.png",
    // "/assets/images/icons/icon-144x144.png",
    // "/assets/images/icons/icon-152x152.png",
    "/icons/icon-192x192.png",
    // "/assets/images/icons/icon-384x384.png",
    "/icons/icon-512x512.png",
];
const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";
// const TRANSACTION_CACHE = "transaction-v1";
// install
self.addEventListener("install", function (evt) {
    evt.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("Your files were pre-cached successfully!");
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});
self.addEventListener("activate", function (evt) {
    evt.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log("Removing old cache data", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});
// fetch
self.addEventListener("fetch", function (evt) {
    // cache successful requests to the API
    // if (evt.request.url.includes("/api/")) {
    //     evt.respondWith(
    //         caches.open(TRANSACTION_CACHE).then(cache => {
    //             return Promise.all(
    //                 //fetch each thing inside the cache,
    //                 // then clear it if we are online
    //             );
    //         })
    //     )
    // }
    if (evt.request.url.includes("/api/")) {
        evt.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(evt.request)
                    .then(response => {
                        // If the response was good, clone it and store it in the cache.
                        if (response.status === 200) {
                            // we are online
                            //
                            cache.put(evt.request.url, response.clone());
                        }
                        return response;
                    })
                    .catch(err => {
                        // Network request failed, try to get it from the cache.
                        // we are offline
                        // console.log(evt.request.url);
                        // console.log(evt.request);
                        // cache.put(evt.request.url, evt.request.clone());
                        return cache.match(evt.request);
                    });
            }).catch(err => console.log(err))
        );
        return;
    }
    // if the request is not for the API, serve static assets using "offline-first" approach.
    // see https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook#cache-falling-back-to-network
    evt.respondWith(
        caches.match(evt.request).then(function (response) {
            return response || fetch(evt.request);
        })
    );
});