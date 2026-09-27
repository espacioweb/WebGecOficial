import { useEffect, useState } from 'react';

// Fusiona el respaldo estático (`iybVideosSeed`, pintado de inmediato) con lo
// que devuelva /api/youtube en vivo — un episodio nuevo publicado en el
// canal aparece solo, sin admin ni redeploy. Ver functions/api/youtube.js.
export default function useCanalVideos(seed) {
  const [videos, setVideos] = useState(seed);

  useEffect(() => {
    let vivo = true;
    fetch('/api/youtube')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('youtube'))))
      .then(({ videos: frescos }) => {
        if (!vivo || !Array.isArray(frescos) || frescos.length === 0) return;
        setVideos((prev) => {
          const soloRespaldo = prev.filter((p) => !frescos.some((f) => f.id === p.id));
          return [...frescos, ...soloRespaldo];
        });
      })
      .catch(() => {
        // En npm run dev /api/* da 404 (esperado, ver functions/README.md) y
        // en producción una falla de red — en ambos casos el respaldo ya
        // pintado se queda tal cual, coherente sin depender de la red.
      });
    return () => {
      vivo = false;
    };
  }, []);

  return videos;
}
