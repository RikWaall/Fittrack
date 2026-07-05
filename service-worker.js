var CACHE_NAME = 'fittrack-v2';
var APP_SHELL = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(names){
      return Promise.all(names.filter(function(n){ return n !== CACHE_NAME; }).map(function(n){ return caches.delete(n); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event){
  var url = event.request.url;
  // Live data (voedingswaarden opzoeken) altijd via het netwerk, nooit uit de cache
  if(url.indexOf('openfoodfacts.org') !== -1 || url.indexOf('googleapis.com') !== -1 || url.indexOf('gstatic.com') !== -1 || url.indexOf('jsdelivr.net') !== -1){
    return;
  }
  // Netwerk-eerst voor de app-shell, zodat updates altijd doorkomen; cache is alleen de offline-fallback.
  event.respondWith(
    fetch(event.request).then(function(res){
      var resClone = res.clone();
      caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, resClone); });
      return res;
    }).catch(function(){
      return caches.match(event.request);
    })
  );
});
