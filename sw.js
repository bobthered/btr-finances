const staticAssets = [
  './',
  './css/fa/css/fa.all.min.css',
  './css/fa/webfonts/fa-brands-400.eot',
  './css/fa/webfonts/fa-brands-400.svg',
  './css/fa/webfonts/fa-brands-400.ttf',
  './css/fa/webfonts/fa-brands-400.woff',
  './css/fa/webfonts/fa-brands-400.woff2',
  './css/fa/webfonts/fa-regular-400.eot',
  './css/fa/webfonts/fa-regular-400.svg',
  './css/fa/webfonts/fa-regular-400.ttf',
  './css/fa/webfonts/fa-regular-400.woff',
  './css/fa/webfonts/fa-regular-400.woff2',
  './css/fa/webfonts/fa-solid-900.eot',
  './css/fa/webfonts/fa-solid-900.svg',
  './css/fa/webfonts/fa-solid-900.ttf',
  './css/fa/webfonts/fa-solid-900.woff',
  './css/fa/webfonts/fa-solid-900.woff2',
  './css/styles.min.css',
  './fonts/lato-bold-ext.woff2',
  './fonts/lato-bold.woff2',
  './fonts/lato-light-ext.woff2',
  './fonts/lato-light.woff2',
  './js/app.js',
  './js/btrPWA.js',
  './manifest.json',
  './modals/confirm.html',
  './modals/error.html',
  './modals/fbReauthenticate.html',
  './modals/offline.html',
  './modals/success.html'
];

self.addEventListener( 'install', async e => {
  console.log( 'sw install' );
  const cache = await caches.open( 'finances-static' );
  cache.addAll( staticAssets );
} );

self.addEventListener( 'fetch', e => {
  //console.log( 'sw fetch', e );

  const request = e.request;
  const url = new URL( request.url );

  if ( url.origin === location.origin ) {
    e.respondWith( cacheFirst( request ) );
  }
} );

async function cacheFirst( request ) {
  const cachedResponse = await caches.match( request );
  return cachedResponse || fetch( request );
}
