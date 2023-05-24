// Define constants
const CORE_CACHE = 1
const CORE_CACHE_NAME = `core-v${CORE_CACHE}`
// Array of core assets to be cached
const CORE_ASSETS = [
    "/manifest.json",
    "/offline",
    "/css/style.css",
    "/images/background_header.webp",
    "/static/images/melkmeisje.webp",
    "/images/icon-192x192.png",
    "/fonts/PannoText-Normal.woff",
    "/fonts/PannoText-Normal.woff2",
    "/fonts/PannoText-Bold.woff",
    "/fonts/PannoText-Bold.woff2"
]

// Install event that is triggered when the service worker is first installed
self.addEventListener('install', (event) => {
    console.log("Installed service worker")

    event.waitUntil(
        // Open the cache and add all the core assets to it
        caches.open(CORE_CACHE_NAME)
            .then(cache => cache.addAll(CORE_ASSETS))
            // Activate the service worker immediately once the core assets have been cached
            .then(() => self.skipWaiting())
    )
})

//Activate event that is triggered when the service worker is activated
self.addEventListener("activate", (event) => {
    console.log("Activating service worker")
    // Ensure that the service worker takes control of all pages within its scope
    event.waitUntil(clients.claim())
})

// Fetch event that is triggered when a resource/url is fetched
self.addEventListener("fetch", (event) => {
    const req = event.request;
    console.log("Fetch event:" + req.url);

    // Check if the request is a GET request
    if (isCoreGetRequest(req)) {
        console.log('Core get request: ', req.url);

        event.respondWith(
            caches.open(CORE_CACHE_NAME)
                .then(cache => cache.match(req.url)) // Check if the request is already cached
        );
    } else if (isHtmlGetRequest(req)) { // Check if the request is a GET request for HTML
        console.log('Html get request', req.url);

        event.respondWith(
            caches.open('html-cache')
                .then(cache => cache.match(req.url))
                .then(response => response ? response : fetchAndCache(req, 'html-cache'))
                .catch(e => {
                    return caches.open(CORE_CACHE_NAME)
                        .then(cache => cache.match('/offline'))
                })
        )
    }
});

function fetchAndCache(request, cacheName) {
    return fetch(request)
        .then(response => {
            if (!response.ok) {
                throw new TypeError('Bad response status');
            }

            const clone = response.clone()
            caches.open(cacheName).then((cache) => cache.put(request, clone))
            return response
        })
}

// Checks if a request is a GET request for HTML and if the URL is in the CORE_ASSETS array
function isHtmlGetRequest(request) {
    return request.method === 'GET' && (request.headers.get('accept') !== null && request.headers.get('accept').indexOf('text/html') > -1);
}

// Checks if a request is a GET request and if the URL is in the CORE_ASSETS array
function isCoreGetRequest(request) {
    return request.method === 'GET' && CORE_ASSETS.includes(getPathName(request.url));
}

function getPathName(requestUrl) {
    const url = new URL(requestUrl);
    return url.pathname;
}
