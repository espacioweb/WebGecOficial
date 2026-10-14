// Corre justo después de `vite build` (ver "build" en package.json).
//
// El sitio es un SPA: Vite genera un solo dist/index.html y Cloudflare Pages
// lo servía para TODA dirección. Resultado: Google recibía, en el HTML inicial
// de /marketing/, el título, la descripción y el canonical del Home, y
// cualquier URL inventada respondía 200 con el Home ("soft 404"). Este script
// arregla las dos cosas sin tocar el contenido de las páginas:
//
//  1. escribe dist/<ruta>/index.html para cada ruta de src/data/seo.js, igual
//     al index.html pero con el <title>, la descripción, el canonical y los
//     datos Open Graph de esa página (el mismo texto que luego fija
//     useDocumentMeta en el navegador, porque ambos salen de seo.js);
//  2. escribe dist/404.html — con ese archivo presente, Cloudflare Pages
//     responde 404 real a lo que no existe (y por eso public/_redirects ya no
//     lleva el comodín `/* /index.html 200`);
//  3. genera dist/sitemap.xml con <lastmod> tomado de git;
//  4. en cada HTML por ruta agrega <link rel="modulepreload"> con los paquetes
//     de esa página (React.lazy en App.jsx). Sin eso, entrar directo a
//     /marketing/ bajaba primero el paquete principal y solo después
//     descubría el de la página: una vuelta de red de más justo en las
//     páginas que Google rastrea.
//
// El cuerpo sigue siendo el de React (se pinta con JavaScript): esto NO es un
// prerenderizado completo, solo deja correcto lo que Google lee primero.

import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { RUTAS, META_404, SITE_URL } from '../src/data/seo.js';

const dist = new URL('../dist/', import.meta.url);
const base = readFileSync(new URL('index.html', dist), 'utf8');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// Si el index.html cambia de forma y una etiqueta deja de encontrarse, el
// build debe fallar a gritos: mejor eso que publicar un <head> a medias.
function reemplazar(html, regex, nuevo, nombre) {
  if (!regex.test(html)) throw new Error(`postbuild: no encontré ${nombre} en dist/index.html`);
  return html.replace(regex, () => nuevo);
}
const metaRe = (attr, name) => new RegExp(`<meta\\s+${attr}="${name}"\\s+content="[^"]*"\\s*/>`);

// Paquetes (JS) que necesita una página, según el manifest de Vite: el de la
// página y todo lo que importa, menos lo que ya trae el paquete principal.
const manifest = JSON.parse(readFileSync(new URL('.vite/manifest.json', dist), 'utf8'));
const entrada = Object.values(manifest).find((m) => m.isEntry);
function paquetesDe(fuente) {
  const raiz = manifest[fuente];
  if (!raiz) return [];
  const yaEnPrincipal = new Set([Object.keys(manifest).find((k) => manifest[k] === entrada)]);
  const marcar = (m) => { for (const k of m.imports ?? []) if (!yaEnPrincipal.has(k)) { yaEnPrincipal.add(k); marcar(manifest[k]); } };
  marcar(entrada);
  const vistos = new Set();
  const visitar = (clave) => {
    if (vistos.has(clave) || yaEnPrincipal.has(clave)) return;
    vistos.add(clave);
    for (const k of manifest[clave].imports ?? []) visitar(k);
  };
  visitar(fuente);
  return [...vistos].map((k) => `/${manifest[k].file}`);
}
const preloadsDe = (fuente) =>
  paquetesDe(fuente).map((f) => `    <link rel="modulepreload" crossorigin href="${f}" />\n`).join('');

function conCabeza(html, { title, description, canonical, og, preload = '' }) {
  let h = reemplazar(html, /<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`, '<title>');
  h = reemplazar(h, metaRe('name', 'description'), `<meta name="description" content="${esc(description)}" />`, 'meta description');
  h = reemplazar(h, metaRe('property', 'og:title'), `<meta property="og:title" content="${esc(title)}" />`, 'og:title');
  h = reemplazar(h, metaRe('property', 'og:description'), `<meta property="og:description" content="${esc(description)}" />`, 'og:description');
  h = reemplazar(h, metaRe('name', 'twitter:title'), `<meta name="twitter:title" content="${esc(title)}" />`, 'twitter:title');
  h = reemplazar(h, metaRe('name', 'twitter:description'), `<meta name="twitter:description" content="${esc(description)}" />`, 'twitter:description');
  if (canonical) {
    h = reemplazar(h, /<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${canonical}" />`, 'canonical');
    h = reemplazar(h, metaRe('property', 'og:url'), `<meta property="og:url" content="${canonical}" />`, 'og:url');
  }
  // Los dos preload del fotograma del Hero solo sirven en el Home: en las demás
  // páginas son ~40 KB que compiten con lo que sí se ve.
  h = h.replace(/<link\s+rel="preload"\s+as="image"\s+href="\/assets\/sequences\/[^"]*"\s+media="[^"]*"\s*\/>\s*/g, '');
  if (preload) h = reemplazar(h, /<\/head>/, `${preload}  </head>`, '</head>');
  return h;
}

function escribir(ruta, html) {
  const archivo = new URL(ruta, dist);
  mkdirSync(new URL('./', archivo), { recursive: true });
  writeFileSync(archivo, html);
}

// ── HTML por ruta (el Home es dist/index.html tal cual) ──────────────────────
for (const r of RUTAS) {
  if (r.path === '/') continue;
  const canonical = `${SITE_URL}${r.path}`;
  escribir(`.${r.path}index.html`, conCabeza(base, { title: r.title, description: r.description, canonical, preload: preloadsDe(r.fuentes[0]) }));
}

// ── 404.html: sin canonical ni og:url, y noindex ─────────────────────────────
let p404 = conCabeza(base, { title: META_404.title, description: META_404.description, preload: preloadsDe('src/pages/NotFoundPage.jsx') });
p404 = p404.replace(/<link rel="canonical"[^>]*>\s*/, '').replace(/<meta\s+property="og:url"[^>]*>\s*/, '');
p404 = reemplazar(p404, /<meta charset="UTF-8"\s*\/>/, '<meta charset="UTF-8" />\n    <meta name="robots" content="noindex" />', 'meta charset');
escribir('./404.html', p404);

// ── sitemap.xml con <lastmod> real ───────────────────────────────────────────
const hoy = new Date().toISOString().slice(0, 10);
function ultimaModificacion(fuentes) {
  try {
    const f = execFileSync('git', ['log', '-1', '--format=%cs', '--', ...fuentes], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    return f || hoy;
  } catch {
    return hoy; // sin git (o clon sin historial): fecha del build
  }
}
const urls = RUTAS.map(
  (r) => `  <url>
    <loc>${SITE_URL}${r.path}</loc>
    <lastmod>${ultimaModificacion(r.fuentes)}</lastmod>
    <priority>${r.priority}</priority>
  </url>`,
).join('\n');
writeFileSync(
  new URL('sitemap.xml', dist),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`,
);

rmSync(new URL('.vite/', dist), { recursive: true, force: true }); // el manifest no se publica
console.log(`postbuild: ${RUTAS.length - 1} páginas + 404.html + sitemap.xml (${RUTAS.length} URL)`);
