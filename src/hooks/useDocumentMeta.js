import { useEffect } from 'react';

const SITE_URL = 'https://grupoespaciocreativo.com'; // TODO: confirmar dominio final antes de publicar

function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setOg(property, content) {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(path) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', `${SITE_URL}${path}`);
}

// El sitio es un SPA renderizado en el cliente (sin SSR/SSG). Esto cubre lo
// que Googlebot puede leer al ejecutar el JS, pero no reemplaza el
// prerenderizado real: revisar en Fase 6 si hace falta reforzarlo.
export default function useDocumentMeta({ title, description, path, noindex = false }) {
  useEffect(() => {
    if (title) document.title = title;
    if (description) {
      setMeta('description', description);
      setOg('og:description', description);
    }
    if (title) setOg('og:title', title);
    if (path) {
      setOg('og:url', `${SITE_URL}${path}`);
      setCanonical(path);
    }

    let robots = document.querySelector('meta[name="robots"]');
    if (noindex) {
      if (!robots) {
        robots = document.createElement('meta');
        robots.setAttribute('name', 'robots');
        document.head.appendChild(robots);
      }
      robots.setAttribute('content', 'noindex, nofollow');
    } else if (robots) {
      robots.remove();
    }
  }, [title, description, path, noindex]);
}
