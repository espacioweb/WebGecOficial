import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Play, X } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../utils/gsapSetup';
import { LenisContext } from '../context/LenisContext';
import { track } from '../utils/analytics';
import { P } from '../utils/textStyles';
import { testimoniosVideo } from '../data/site';

/* Testimonios en video del Home (oct. 2026): tres tarjetas con la miniatura
   del video; al abrir una, el video de YouTube corre en un modal.

   El modal va con portal en <body> (una tarjeta con `transform` en hover
   atraparía un `position: fixed`) y detiene Lenis mientras está abierto, igual
   que VideoLocalModal. El iframe solo se monta al abrir: nada de YouTube se
   descarga hasta que alguien da play. */

function ModalTestimonio({ t, onClose }) {
  const lenisRef = useContext(LenisContext);
  const cerrarRef = useRef(null);

  useEffect(() => {
    if (!t) return undefined;
    const lenis = lenisRef?.current;
    const previo = document.activeElement;
    lenis?.stop();
    cerrarRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      lenis?.start();
      previo?.focus?.();
    };
  }, [t, onClose, lenisRef]);

  if (!t) return null;

  return createPortal(
    <div
      onClick={onClose}
      role="presentation"
      data-lenis-prevent
      className="fixed inset-0 z-[200] grid animate-[fadeIn_.25s_ease_both] place-items-center bg-[rgba(4,7,10,.9)] p-4 backdrop-blur-[10px] sm:p-8"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Testimonio de ${t.nombre}, ${t.cargo}, ${t.empresa}`}
        className="relative w-full max-w-[1060px] animate-[modalIn_.35s_cubic-bezier(.2,.8,.3,1)_both]"
      >
        <div className="mb-3.5 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="m-0 truncate text-[15px] font-semibold text-white" style={P}>
              {t.nombre}
            </p>
            <p className="m-0 mt-0.5 truncate text-[13px]" style={{ ...P, color: 'rgba(237,234,228,.6)' }}>
              {t.cargo} · {t.empresa}
            </p>
          </div>
          <button
            ref={cerrarRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar testimonio"
            className="grid h-10 w-10 flex-none cursor-pointer place-items-center rounded-full border border-white/20 bg-white/[.04] text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5B301]"
          >
            <X size={17} />
          </button>
        </div>
        <div className="relative aspect-video w-full overflow-hidden rounded-[18px] border border-white/[.12] bg-black shadow-[0_50px_140px_-40px_rgba(0,0,0,.95)]">
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${t.id}?autoplay=1&rel=0`}
            title={t.titulo}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Tarjeta({ t, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(t)}
      aria-label={`Ver el testimonio de ${t.nombre}, ${t.cargo}, ${t.empresa}`}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-[clamp(20px,2vw,28px)] border border-white/[.09] bg-[#0D0D10] p-0 text-left transition-[transform,border-color,box-shadow] duration-500 ease-[cubic-bezier(.2,.8,.2,1)] hover:-translate-y-1.5 hover:border-[#F5B301]/45 hover:shadow-[0_30px_80px_-30px_rgba(245,179,1,.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F5B301] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <span
        aria-hidden="true"
        className="absolute top-0 left-0 z-10 h-px w-0 bg-gradient-to-r from-[#F5B301] to-transparent transition-[width] duration-700 ease-out group-hover:w-full"
      />
      <span className="relative block aspect-video w-full overflow-hidden">
        <img
          src={t.thumb}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05] motion-reduce:transition-none"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-[#0D0D10] via-black/10 to-black/20" />
        <span className="absolute inset-0 grid place-items-center">
          <span className="relative grid h-[68px] w-[68px] place-items-center rounded-full bg-[#F5B301] text-[#0B0B0C] shadow-[0_18px_50px_-10px_rgba(245,179,1,.6)] transition-transform duration-500 group-hover:scale-110 motion-reduce:transition-none">
            <span className="absolute inset-0 rounded-full bg-[#F5B301]/40 opacity-0 group-hover:opacity-100 motion-safe:group-hover:animate-ping" />
            <Play className="relative translate-x-[2px]" size={26} strokeWidth={2.2} fill="currentColor" aria-hidden="true" />
          </span>
        </span>
      </span>
      <span className="flex flex-col gap-3.5 p-[clamp(20px,2.2vw,28px)]">
        <img
          src={t.logo}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-7 w-auto max-w-[150px] self-start object-contain object-left opacity-60 transition-opacity duration-500 group-hover:opacity-100"
        />
        <span className="flex flex-col gap-1">
          <span className="text-[19px] leading-[1.25] font-semibold text-[#F2EFE9]" style={{ ...P, letterSpacing: '-.01em' }}>
            {t.nombre}
          </span>
          <span className="text-[14px] leading-[1.5]" style={{ ...P, color: 'rgba(237,234,228,.7)' }}>
            {t.cargo}
          </span>
          <span className="text-[14px] leading-[1.5] font-medium text-[#F5B301]" style={P}>
            {t.empresa}
          </span>
        </span>
      </span>
    </button>
  );
}

export default function TestimoniosVideo() {
  const gridRef = useRef(null);
  const [abierto, setAbierto] = useState(null);

  // Misma entrada escalonada que las tarjetas del Manifiesto; sin animación con
  // prefers-reduced-motion.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tween = gsap.from(gridRef.current.children, {
          y: 28,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.14,
          scrollTrigger: { trigger: gridRef.current, start: 'top 85%', toggleActions: 'play none none reverse' },
        });
        return () => tween.scrollTrigger?.kill();
      });
      return () => mm.revert();
    },
    { scope: gridRef },
  );

  // Estable: el modal lo lleva en las dependencias de su efecto (Lenis/foco),
  // y una función nueva en cada render lo reiniciaría.
  const cerrar = useCallback(() => setAbierto(null), []);
  const abrir = (t) => {
    setAbierto(t);
    track('content_opened', { tipo: 'testimonio', id: t.id, titulo: t.titulo });
  };

  return (
    <section id="testimonios" className="bg-[#060607] px-[clamp(24px,5vw,90px)] py-[clamp(70px,8vw,130px)]">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-[clamp(32px,4vw,56px)]">
        <div className="flex items-center gap-5">
          <span className="h-[7px] w-[7px] flex-none rounded-full bg-[#F5B301]" />
          <h2
            className="m-0 text-[clamp(28px,3.4vw,50px)] leading-[1.1] font-bold text-[#EDEAE4]"
            style={{ ...P, letterSpacing: '-.03em' }}
          >
            Testimonios
          </h2>
          <span className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent" />
        </div>
        <div
          ref={gridRef}
          className="mx-auto grid w-full max-w-[640px] gap-5 lg:max-w-none lg:grid-cols-3 lg:gap-6"
        >
          {testimoniosVideo.map((t) => (
            <Tarjeta key={t.id} t={t} onOpen={abrir} />
          ))}
        </div>
      </div>
      <ModalTestimonio t={abierto} onClose={cerrar} />
    </section>
  );
}
