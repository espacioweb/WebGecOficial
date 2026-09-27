import { useEffect } from 'react';
import { X } from 'lucide-react';
import { P } from '../utils/textStyles';

// Modal premium con un video de YouTube embebido — mismo lenguaje visual que
// el modal original de Inside Your Brand en Home (fadeIn/modalIn ya están
// definidos globalmente en index.css), generalizado para recibir cualquier
// {id, title} en vez de un solo episodio fijo.
export default function VideoModal({ video, onClose }) {
  useEffect(() => {
    if (!video) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [video, onClose]);

  if (!video) return null;

  return (
    <div
      onClick={onClose}
      role="presentation"
      className="fixed inset-0 z-[200] grid animate-[fadeIn_.22s_ease_both] place-items-center bg-[rgba(4,7,10,.85)] p-4 backdrop-blur-[6px] sm:p-8"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={video.title}
        className="relative w-full max-w-[1060px] animate-[modalIn_.3s_cubic-bezier(.2,.8,.3,1)_both]"
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <span className="max-w-[70%] truncate text-[14px] font-semibold text-white" style={P}>
            {video.title}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="grid h-9 w-9 flex-none cursor-pointer place-items-center rounded-full border border-white/20 bg-transparent text-white/75 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/12 bg-black">
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
