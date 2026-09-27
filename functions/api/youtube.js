// GET /api/youtube — últimos episodios de "Inside Your Brand" leídos del feed
// RSS público del canal de GEC. Sin API key ni panel de admin: YouTube expone
// este feed sin autenticación y se actualiza solo con cada publicación, así
// que un video nuevo aparece en el sitio en la siguiente visita sin que nadie
// tenga que tocar código.
//
// Límite real: el feed de canal solo trae los 15 videos más recientes de
// TODO el canal (mezclado con producciones de clientes, spots, etc.), así
// que un episodio de Inside Your Brand puede salir de esa ventana cuando se
// publican 15 cosas después. `iybVideosSeed` en `src/data/site.js` es el
// respaldo — se actualiza a mano si algún episodio viejo desaparece del
// feed y se quiere seguir mostrando. Si algún día existe una lista de
// reproducción pública dedicada a Inside Your Brand, cambiar FEED_URL a
// `?playlist_id=` resuelve esto de raíz (no hay una todavía, se buscó).

const CHANNEL_ID = 'UCjmI5Wo1_w83zw7o3Wgdyew'; // @grupoespaciocreativo — resuelto desde /channel/ una sola vez
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

const json = (datos, status = 200) =>
  new Response(JSON.stringify(datos), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=1800' },
  });

const decodeEntities = (s) =>
  s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

function parseEntries(xml) {
  return xml
    .split('<entry>')
    .slice(1)
    .map((block) => ({
      id: block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1],
      title: block.match(/<title>([^<]*)<\/title>/)?.[1],
      published: block.match(/<published>([^<]+)<\/published>/)?.[1],
    }))
    .filter((v) => v.id && v.title);
}

export async function onRequestGet() {
  try {
    const res = await fetch(FEED_URL, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) throw new Error(`feed respondió ${res.status}`);
    const xml = await res.text();

    const videos = parseEntries(xml)
      .filter((v) => /inside your brand/i.test(v.title))
      .map((v) => ({
        id: v.id,
        title: decodeEntities(v.title),
        thumbnail: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
        publishedAt: v.published,
      }));

    return json({ videos });
  } catch (e) {
    console.error('No se pudo leer el feed de YouTube', e);
    return json({ videos: [] });
  }
}
