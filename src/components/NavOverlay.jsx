import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import { gsap } from '../utils/gsapSetup';
import { nav, pilares } from '../data/site';

const P = { fontFamily: 'Poppins, sans-serif' };

// Las cinco páginas de pilar ya existen como rutas reales — se insertan
// después de "Ecosistema" (que sigue llevando a la vista de conjunto en
// Home) para dar acceso directo a cada una, como pide la guía de Fase 1.
const PILARES_LINKS = pilares.map((p) => ({ href: p.ruta, label: p.name }));

const EXTRA = [
  { href: '/inside-your-brand/', label: 'Inside Your Brand' },
  { href: '#familia', label: 'La familia Meraki' },
  { href: '#contacto', label: 'Hablemos' },
];

export default function NavOverlay({ open, onClose }) {
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const itemsRef = useRef([]);
  const tlRef = useRef(null);

  // Cerrar con Escape y bloquear el scroll de fondo
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useGSAP(
    () => {
      const items = itemsRef.current.filter(Boolean);
      const tl = gsap.timeline({ paused: true });

      tl.set(rootRef.current, { visibility: 'visible' })
        .fromTo(
          panelRef.current,
          { clipPath: 'inset(0% 0% 100% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.62, ease: 'power4.inOut' },
        )
        .fromTo(
          items,
          { yPercent: 118, rotate: 4, opacity: 0 },
          {
            yPercent: 0,
            rotate: 0,
            opacity: 1,
            duration: 0.62,
            ease: 'power3.out',
            stagger: 0.06,
          },
          '-=0.28',
        );

      tlRef.current = tl;
      return () => tl.kill();
    },
    { scope: rootRef },
  );

  useEffect(() => {
    const tl = tlRef.current;
    if (!tl) return;
    if (open) {
      tl.play();
    } else {
      tl.reverse().then(() => {
        if (rootRef.current) rootRef.current.style.visibility = 'hidden';
      });
    }
  }, [open]);

  const links = [nav[0], ...PILARES_LINKS, ...nav.slice(1), ...EXTRA];

  const go = (e, href) => {
    e.preventDefault();
    onClose();
    // esperar al cierre para que el scroll no compita con la animación
    setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 420);
  };

  return (
    <div
      ref={rootRef}
      aria-hidden={!open}
      className="fixed inset-0 z-[110]"
      style={{ visibility: 'hidden' }}
    >
      <div
        ref={panelRef}
        className="absolute inset-0 bg-[#07080B]"
        style={{ clipPath: 'inset(0% 0% 100% 0%)' }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(60% 55% at 78% 30%, rgba(245,179,1,.14) 0%, rgba(245,179,1,0) 70%)',
          }}
        />

        <nav className="relative flex h-full flex-col justify-center gap-0.5 overflow-y-auto px-[clamp(28px,7vw,140px)] py-[clamp(90px,10vh,140px)]">
          {links.map((l, i) => {
            const isRoute = !l.href.startsWith('#');
            const num = (
              <span
                className="text-[clamp(9px,.9vw,12px)] font-medium text-[rgba(245,179,1,.7)]"
                style={{ letterSpacing: '.28em' }}
              >
                {i + 1 < 10 ? `0${i + 1}` : i + 1}
              </span>
            );
            const cls =
              'group inline-flex items-baseline gap-5 text-[clamp(22px,4.6vw,58px)] leading-[1.08] font-bold text-[#EDEAE4] transition-colors duration-300 hover:text-[#F5B301]';
            return (
              <div key={l.href} className="overflow-hidden py-[clamp(1px,.4vh,5px)]">
                {isRoute ? (
                  <Link
                    to={l.href}
                    onClick={onClose}
                    ref={(el) => {
                      itemsRef.current[i] = el;
                    }}
                    className={cls}
                    style={{ ...P, letterSpacing: '-.035em' }}
                  >
                    {num}
                    {l.label}
                  </Link>
                ) : (
                  <a
                    href={l.href}
                    onClick={(e) => go(e, l.href)}
                    ref={(el) => {
                      itemsRef.current[i] = el;
                    }}
                    className={cls}
                    style={{ ...P, letterSpacing: '-.035em' }}
                  >
                    {num}
                    {l.label}
                  </a>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
