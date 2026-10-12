import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ProgramaModal from './ProgramaModal';

const PILARES = {
  marketing: 'Marketing',
  studio: 'Studio',
  educa: 'Educa',
  soluciona: 'Soluciona',
  experience: 'Experience',
};
const PROGRAMAS = {
  audiovisual: 'Producción audiovisual con IA',
  wellness: 'Programa Wellness',
  cultura: 'Mejora de Cultura Organizacional',
};

// Un solo dueño para enlaces <a> y <Link>, incluidos los de futuros bloques.
// La URL directa conserva la página independiente; abrir el modal no agrega
// entradas al historial ni modifica la ruta que el visitante estaba leyendo.
export default function BriefModalController() {
  const location = useLocation();
  const [brief, setBrief] = useState(null);

  useEffect(() => {
    const close = () => setBrief(null);
    const onClick = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (/^#(?:continuar|cancelar)=/.test(url.hash)) return;
      if (/^\/cuentanos-tu-reto\/?$/.test(url.pathname)) {
        event.preventDefault();
        const pilar = url.searchParams.get('pilar') || '';
        const tema = url.searchParams.get('tema') || '';
        setBrief({
          pilar,
          tema,
          titulo: (pilar === 'educa' && PROGRAMAS[tema]) || (PILARES[pilar] ? `Cuéntanos tu reto · ${PILARES[pilar]}` : 'Cuéntanos tu reto'),
          opener: link,
          routeKey: location.key,
        });
      } else if (link.closest('.programa-modal')) {
        // El resultado puede recomendar otro pilar. Dejamos navegar al Link,
        // y retiramos el dialog para que el destino quede visible.
        close();
      }
    };
    document.addEventListener('click', onClick, true);
    window.addEventListener('popstate', close);
    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('popstate', close);
    };
  }, [location.key]);

  if (!brief || brief.routeKey !== location.key) return null;
  return <ProgramaModal {...brief} onClose={() => setBrief(null)} />;
}
