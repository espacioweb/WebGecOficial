import { useState } from 'react';
import { Play } from 'lucide-react';
import { track } from '../utils/analytics';
import { P } from '../utils/textStyles';

/* Reproductor premium de un video propio (mp4 en /public): tarjeta 16:9 con
   póster, botón de play dorado y resplandor cálido. `preload` no existe aquí
   a propósito: el <video> ni se monta hasta que la persona da play, así que
   no se descarga nada y no suma peso a la página (el Home ya carga la
   secuencia del Hero).

   Se usa en el Home (video de intro del sitio) y en /marketing/ (pieza
   "Desde adentro hacia afuera"). Antes vivía dentro de Sections.jsx con el
   video fijo; se movió para que Marketing no cargue todo Sections.

   `video` = { src, poster }; `duracion` es el texto de la etiqueta ("1:13");
   `id` es el id del evento de analítica `content_opened`. */
export default function VideoExplicativo({ video, duracion, id, etiqueta = 'Reproducir el video' }) {
  const [activo, setActivo] = useState(false);
  return (
    <div className="relative">
      {/* Resplandor dorado detrás de la tarjeta — el mismo halo cálido del
          video (fondo claro) contra la sección negra. */}
      <div
        aria-hidden="true"
        // Sin desbordar a los lados: con -inset-x el halo empujaba el ancho del
        // documento más allá del viewport en teléfono.
        className="pointer-events-none absolute inset-x-0 -inset-y-8 rounded-[48px] opacity-60 blur-[70px]"
        style={{ background: 'radial-gradient(60% 60% at 50% 50%, rgba(245,179,1,.18), transparent 70%)' }}
      />
      <div className="relative aspect-video w-full overflow-hidden rounded-[clamp(18px,2.4vw,32px)] border border-white/10 bg-[#F4F4F2] shadow-[0_40px_120px_-40px_rgba(0,0,0,.9)]">
        {activo ? (
          <video
            src={video.src}
            poster={video.poster}
            controls
            autoPlay
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setActivo(true);
              track('content_opened', { tipo: 'video', id });
            }}
            aria-label={etiqueta}
            className="group absolute inset-0 cursor-pointer border-0 bg-transparent p-0 focus-visible:outline focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-[#F5B301]"
          >
            <img
              src={video.poster}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
            <span className="absolute inset-0 grid place-items-center">
              <span className="relative grid h-[clamp(64px,7vw,92px)] w-[clamp(64px,7vw,92px)] place-items-center rounded-full bg-[#F5B301] text-[#0B0B0C] shadow-[0_18px_50px_-10px_rgba(245,179,1,.65)] transition-transform duration-300 group-hover:scale-105">
                {/* Anillo que late — se apaga con prefers-reduced-motion
                    (motion-safe). */}
                <span className="absolute inset-0 rounded-full bg-[#F5B301]/40 motion-safe:animate-ping" />
                <Play className="relative translate-x-[2px]" size={30} strokeWidth={2.2} fill="currentColor" aria-hidden="true" />
              </span>
            </span>
            <span
              className="absolute bottom-[clamp(14px,2vw,26px)] left-[clamp(14px,2vw,26px)] rounded-full bg-[#0B0B0C]/80 px-3.5 py-1.5 text-[12px] font-semibold text-[#EDEAE4] backdrop-blur-sm"
              style={P}
            >
              {duracion}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

