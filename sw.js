var CACHE="nutri-v4";
var ASSETS=[
  "./",
  "index.html",
  "css/site.css",
  "js/site.js",
  "js/glossario.js",
  "manifest.webmanifest",
  "icon-192.png",
  "icon-512.png",
  "partes/p1.html",
  "partes/p10.html",
  "partes/p11.html",
  "partes/p12.html",
  "partes/p13.html",
  "partes/p2.html",
  "partes/p3.html",
  "partes/p4.html",
  "partes/p5.html",
  "partes/p6.html",
  "partes/p7.html",
  "partes/p8.html",
  "partes/p9.html"
];
self.addEventListener("install",function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ASSETS);}).then(function(){return self.skipWaiting();}));
});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.map(function(k){return k===CACHE?null:caches.delete(k);}));
  }).then(function(){return self.clients.claim();}));
});
function fresh(req){
  return fetch(req).then(function(res){
    if(res&&res.status===200&&res.type==="basic"){
      var copy=res.clone();
      caches.open(CACHE).then(function(c){c.put(req,copy);});
    }
    return res;
  });
}
self.addEventListener("fetch",function(e){
  if(e.request.method!=="GET")return;
  var u=new URL(e.request.url);
  var isDoc=e.request.mode==="navigate"||/\.(html|js|css)$/.test(u.pathname)||u.pathname==="/"||u.pathname.slice(-1)==="/";
  if(isDoc){
    // rede primeiro, para o material atualizar sozinho; cache como reserva offline
    e.respondWith(fresh(e.request).catch(function(){
      return caches.match(e.request).then(function(h){return h||caches.match("index.html");});
    }));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function(hit){
      if(hit)return hit;
      return fetch(e.request).then(function(res){
        if(res&&res.status===200&&res.type==="basic"){
          var copy=res.clone();
          caches.open(CACHE).then(function(c){c.put(e.request,copy);});
        }
        return res;
      }).catch(function(){ return caches.match("index.html"); });
    })
  );
});
