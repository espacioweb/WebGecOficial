import { useContext, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { P } from '../utils/textStyles';
import { LenisContext } from '../context/LenisContext';

// Modal premium para un video propio (mp4 en /public), hermano de
// VideoModal (que embebe YouTube). Mismo lenguaje: fondo oscuro con blur,
// entrada fadeIn/modalIn (globales en index.css), cierre con Escape, clic
// afuera o la X. Esquinas levemente biseladas (rounded-[18px]).
//
// `video` = { titulo, src, poster, vertical }. Si es vertical (versión de
// celular) el marco es 9:16 y se limita por alto; si no, 16:9 por ancho.
// Mientras está abierto se pausa Lenis para que la rueda no mueva la
// página de fondo.
// Se monta con un portal en <body>: quien lo abre suele ser una tarjeta con
// `transform` en hover, y un `position: fixed` dentro de un ancestro
// transformado queda atrapado en él en vez de cubrir la pantalla.
export default function VideoLocalModal({ video, onClose }) {
  const lenisRef = useContext(LenisContext);

  useEffect(() => {
    if (!video) return undefined;
    const lenis = lenisRef?.current;
    lenis?.stop();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      lenis?.start();
    };
  }, [video, onClose, lenisRef]);

  if (!video) return null;

  return createPortal(
    <div
      onClick={onClose}
      role="presentation"
      data-lenis-prevent
      className="fixed inset-0 z-[200] grid animate-[fadeIn_.25s_ease_both] place-items-center bg-[rgba(4,7,10,.88)] p-4 backdrop-blur-[10px] sm:p-8"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={video.titulo}
        className={`relative animate-[modalIn_.35s_cubic-bezier(.2,.8,.3,1)_both] ${
          video.vertical ? 'w-auto' : 'w-full max-w-[1100px]'
        }`}
      >
        <div className="mb-3 flex items-center justify-between gap-4">
          <span className="truncate text-[14px] font-semibold text-white" style={P}>
            {video.titulo}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar video"
            className="grid h-10 w-10 flex-none cursor-pointer place-items-center rounded-full border border-white/20 bg-white/[.04] text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={17} />
          </button>
        </div>
        <div
          className={`relative overflow-hidden rounded-[18px] border border-white/[.12] bg-black shadow-[0_50px_140px_-40px_rgba(0,0,0,.95)] ${
            // Vertical: el ancho es el menor entre el viewport y lo que da
            // un alto de 80dvh en 9:16 — así nunca desborda el teléfono.
            video.vertical ? 'aspect-[9/16] w-[min(calc(100vw-32px),calc(80dvh*9/16),460px)]' : 'aspect-video w-full'
          }`}
        >
          <video
            src={video.src}
            poster={video.poster}
            controls
            autoPlay
            playsInline
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
