//importScripts("js/loquesea.js");
var CACHE_NAME = "comunidad-v2";
var CACHED_URLS = [
 "/index.html",
 "pages/404.html",
 "pages/actualizarApp.html",
 "pages/actualizarGasto.html",
 "pages/actualizarIngreso.html",
 "pages/actualizarVecino.html",
 "pages/documentos.html",
 "pages/gastos.html",
 "pages/gastosDetalle.html",
 "pages/ingresos.html",
 "pages/ingresosDetalle.html",
 "pages/insertarGasto.html",
 "pages/insertarIngreso.html",
 "pages/notificaciones.html",
 "pages/saldoAnterior.html",
 "pages/settings.html",
 "pages/subirArchivo.html",
 "pages/subirArchivo2.html",
 "pages/vecinos.html",
 "pages/verAños.html",
 "pages/verArchivo.html",
 "pages/verGastos.html",
 "js/app.js",
 "js/framework7.bundle.js",
 "js/routes.js",
 "css/app.css",
 "css/framework7.bundle.css",
 "fonts/Framework7Icons-Regular.eot",
 "fonts/Framework7Icons-Regular.ttf",
 "fonts/Framework7Icons-Regular.woff",
 "fonts/Framework7Icons-Regular.woff2",
 "fonts/MaterialIcons-Regular.eot",
 "fonts/MaterialIcons-Regular.svg",
 "fonts/MaterialIcons-Regular.ttf",
 "fonts/MaterialIcons-Regular.woff",
 "fonts/MaterialIcons-Regular.woff2",
 "fonts/Roboto-Thin.ttf",
 "img/f7-icon.png",
 "img/f7-icon-square.png",
 "img/logo.jpg",
 "img/Comunidad.jpg"
];

self.addEventListener("install", function(event){
 event.waitUntil(
  caches.open(CACHE_NAME).then(function(cache){
   return cache.addAll(CACHED_URLS);
  }).then(function(){
   //console.log("SERVICEWORKER instalado");
  })
 );
});

self.addEventListener("fetch", function(event){
 event.respondWith(
  caches.open(CACHE_NAME).then(function(cache){
   return cache.match(event.request).then(function(cacheResponse){
    //console.log("desde el cache : " + event.request.url);
	  return cacheResponse || fetch(event.request).then(function(networkResponse){
	  //console.log("desde la red: " + event.request.url);
     return networkResponse;
    }).catch(function(){
	  //console.log("fallo desde la red");
	  })
   })
  })
 )
});

self.addEventListener("activate", function(event){
 event.waitUntil(
  caches.keys().then(function(cacheNames){
   return Promise.all(
    cacheNames.map(function(cacheName){
     if (CACHE_NAME !== cacheName && cacheName.startsWith("comunidad-")){
      return caches.delete(cacheName);
     }
    })
   );
  })
 );
});

/*self.addEventListener("sync", function(event){
 if(event.tag === "cola-mensajes"){
  event.waitUntil(
   self.clients.matchAll({ includeUncontrolled: true }).then(function(clients) {
    clients.forEach(function(client) {
     client.postMessage('mensajes')
    })
   })
  )
 }
})*/
