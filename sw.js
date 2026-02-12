const CACHE_NAME = "fc26-saitama-open-arena-prod-v2";
const ASSETS = [
    "./",
    "./index.html",
    "./table.html",
    "./bracket.html",
    "./manifest.webmanifest",
    "./sw.js",

    "./js/app_state.js",
    "./js/tournament_engine.js",
    "./js/ui_shared.js",

    "./sounds/tick.mp3",
    "./sounds/dong.mp3",

    "./icons/icon-180.png",
    "./icons/icon-192.png",
    "./icons/icon-512.png",

    // logos
    "./logos/real-madrid.png",
    "./logos/barcelona.png",
    "./logos/psg.png",
    "./logos/liverpool.png",
    "./logos/man-city.png",
    "./logos/arsenal.png",
    "./logos/bayern.png",
    "./logos/atletico.png",
    "./logos/newcastle.png",
    "./logos/napoli.png",
    "./logos/tottenham.png",
    "./logos/chelsea.png",
    "./logos/man-united.png",
    "./logos/leverkusen.png",
    "./logos/spain.png",
    "./logos/france.png",
    "./logos/argentina.png",
    "./logos/england.png",
    "./logos/portugal.png",
    "./logos/germany.png",
    "./logos/inter.png"
];

// Install: cache core
self.addEventListener("install", (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
});

// Activate: delete old caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null)))
        )
    );
    self.clients.claim();
});

// Fetch
self.addEventListener("fetch", (event) => {
    const req = event.request;

    // HTML navigation => network-first (avoid stale HTML / JS references)
    if (req.mode === "navigate") {
        event.respondWith(
            fetch(req)
                .then(res => {
                    const copy = res.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
                    return res;
                })
                .catch(() => caches.match(req))
        );
        return;
    }

    // Others => cache-first
    event.respondWith(
        caches.match(req).then(cached => {
            if (cached) return cached;
            return fetch(req).then(res => {
                const copy = res.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
                return res;
            });
        })
    );
});
