// GA4 vía gtag.js — Fase 6 de la guía pide medir un set fijo de eventos
// (Hero, Brief, Contenido, enlaces externos). Esta capa los deja listos
// para disparar sin depender de que GA4 ya esté conectado: sin Measurement
// ID configurado, `track()` no hace nada — no rompe nada, no llena la
// consola de nadie.
//
// Para activarlo cuando exista la propiedad GA4: copiar su Measurement ID
// (G-XXXXXXX) a la variable de build VITE_GA_MEASUREMENT_ID en Cloudflare
// Pages → el proyecto → Settings → Environment variables (mismo panel que
// las variables de las Functions, ver functions/README.md — pero esta es
// de build, no de runtime: hay que relanzar el despliegue para que entre).
// No hace falta tocar código.

let cargado = false;

function cargarGtag(id) {
  if (cargado) return;
  cargado = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args) {
    window.dataLayer.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', id, { anonymize_ip: true });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(script);
}

export function initAnalytics() {
  const id = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!id) return;
  cargarGtag(id);
}

export function track(evento, params = {}) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', evento, params);
}
