import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '../utils/gsapSetup';

const P = { fontFamily: 'Poppins, sans-serif' };

// Secciones que el riel refleja, en orden de aparición.
const HITOS = [
  { id: 'top', label: 'Inicio' },
  { id: 'ecosistema', label: 'Ecosistema' },
  { id: 'inside', label: 'Inside Your Brand' },
  { id: 'valor', label: 'Valor' },
  { id: 'portafolio', label: 'Portafolio' },
  { id: 'familia', label: 'La familia' },
  { id: 'contacto', label: 'Hablemos' },
];

// Cuántos puntos se dibujan entre un hito y el siguiente.
const PASOS = 3;

export default function ScrollRail() {
  const rootRef = useRef(null);
  const dotsRef = useRef([]);
  const labelRef = useRef(null);
  const activoRef = useRef(-1);

  // Un punto por paso, más el hito final
  const total = (HITOS.length - 1) * PASOS + 1;
  const esHito = (i) => i % PASOS === 0;
  const hitoDe = (i) => HITOS[Math.round(i / PASOS)];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

        // Posición del scroll expresada en "puntos" del riel
        const posicion = () => {
          const doc = document.documentElement;
          const max = doc.scrollHeight - window.innerHeight;
          return clamp(window.scrollY / (max || 1), 0, 1) * (total - 1);
        };

        const pintar = () => {
          const pos = posicion();

          dotsRef.current.forEach((el, i) => {
            if (!el) return;
            const d = Math.abs(pos - i);
            // Magnificación tipo ola: el punto crece al acercarse la cabeza
            const onda = clamp(1 - d / 2.6, 0, 1);
            const hito = esHito(i);
            const pasado = i <= pos;

            const ancho = (hito ? 22 : 13) + onda * (hito ? 30 : 16);
            const alto = 2 + onda * (hito ? 2.4 : 1.4);
            el.style.width = `${ancho.toFixed(1)}px`;
            el.style.height = `${alto.toFixed(1)}px`;
            el.style.opacity = String(0.2 + onda * 0.8);
            el.style.background = pasado
              ? `rgba(245,179,1,${(0.55 + onda * 0.45).toFixed(2)})`
              : `rgba(237,234,228,${(0.18 + onda * 0.3).toFixed(2)})`;
          });

          // La etiqueta viaja pegada al punto que lleva la cabeza del scroll
          const cerca = dotsRef.current[Math.round(pos)];
          if (cerca && labelRef.current) {
            const y = cerca.offsetTop + cerca.offsetHeight / 2;
            gsap.to(labelRef.current, {
              y,
              duration: 0.45,
              ease: 'power3.out',
              overwrite: 'auto',
            });
          }

          const idx = clamp(Math.round(pos / PASOS), 0, HITOS.length - 1);
          if (idx !== activoRef.current && labelRef.current) {
            activoRef.current = idx;
            const el = labelRef.current;
            gsap.killTweensOf(el, 'opacity');
            gsap.to(el, {
              opacity: 0,
              duration: 0.16,
              onComplete: () => {
                el.textContent = HITOS[idx].label;
                gsap.to(el, { opacity: 1, duration: 0.3, ease: 'power2.out' });
              },
            });
          }
        };

        const st = ScrollTrigger.create({
          start: 0,
          end: 'max',
          onUpdate: pintar,
          onRefresh: pintar,
        });
        pintar();
        return () => st.kill();
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  const irA = (i) => {
    const hito = hitoDe(i);
    if (!hito) return;
    document.getElementById(hito.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-1/2 right-[clamp(14px,2.2vw,34px)] z-[100] hidden -translate-y-1/2 flex-col items-end gap-[7px] lg:flex"
    >
      <span
        ref={labelRef}
        className="absolute top-0 right-[calc(100%+16px)] -translate-y-1/2 text-[10.5px] font-semibold whitespace-nowrap text-[rgba(237,234,228,.62)] uppercase"
        style={{ ...P, letterSpacing: '.28em' }}
      >
        Inicio
      </span>

      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          type="button"
          tabIndex={-1}
          onClick={() => irA(i)}
          aria-label={esHito(i) ? hitoDe(i)?.label : undefined}
          ref={(el) => {
            dotsRef.current[i] = el;
          }}
          className={`block rounded-full border-0 p-0 transition-[background] duration-300 ${
            esHito(i) ? 'pointer-events-auto cursor-pointer' : ''
          }`}
          style={{ width: 13, height: 2, background: 'rgba(237,234,228,.2)' }}
        />
      ))}
    </div>
  );
}
