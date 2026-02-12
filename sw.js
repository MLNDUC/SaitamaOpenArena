const CACHE = "fc26-saitama-open-arena-v2";

const CORE = [
    "./",
    "./index.html",
    "./table.html",
    "./bracket.html",
    "./manifest.webmanifest",
    "./sw.js",

    // JS
    "./js/app_state.js",
    "./js/tournament_engine.js",
    "./js/ui_shared.js",

    // PWA Icons
    "./icons/icon-180.png",
    "./icons/icon-192.png",
    "./icons/icon-512.png",

    // Sounds
    "./sounds/tick.mp3",
    "./sounds/dong.mp3",

    // Logos (21)
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

self.addEventListener("install", (e) => {
    e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)));
    self.skipWaiting();
});

self.addEventListener("activate", (e) => {
    e.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.map((k) => (k !== CACHE ? caches.delete(k) : null)))
        )
    );
    self.clients.claim();
});

// Cache-first for app assets
self.addEventListener("fetch", (e) => {
    e.respondWith(
        caches.match(e.request).then((r) => r || fetch(e.request))
    );
});
