// Service worker para PSS-PRL. Ver sw.js de DGP-PRL para la explicacion completa del
// enfoque (cachea solo el cascaron de la app; las llamadas a la IA nunca se cachean).
// IMPORTANTE: sube CACHE_VERSION cada vez que publiques una version nueva del index.html.
var CACHE_VERSION = "pss-prl-v1.00";
var APP_SHELL = [
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-512-maskable.png",
  "./apple-touch-icon.png",
  "./favicon-32.png"
];

self.addEventListener("install", function(event){
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function(cache){
      return cache.addAll(APP_SHELL).catch(function(){});
    })
  );
});

self.addEventListener("activate", function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE_VERSION; })
            .map(function(k){ return caches.delete(k); })
      );
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(event){
  var req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.match(req).then(function(cached){
      var network = fetch(req).then(function(resp){
        if (resp && resp.ok) {
          caches.open(CACHE_VERSION).then(function(cache){ cache.put(req, resp.clone()); });
        }
        return resp;
      }).catch(function(){ return cached; });
      return cached || network;
    })
  );
});
