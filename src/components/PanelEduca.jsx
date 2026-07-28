import { useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import GateForm, { leerAcceso } from './GateForm';
import {
  C,
  FASES,
  COMPARATIVA,
  MODOS,
  buildDetail,
  navSource,
  navTitle,
} from '../data/gecIA';

const P = { fontFamily: 'Poppins, sans-serif' };
const TARGETS = { fases: 4, programas: 9, areas: 6 };

/* Contadores que suben con easing al abrir el panel */
function useCountUp(active) {
  const [stats, setStats] = useState({ fases: 0, programas: 0, areas: 0 });
  const rafRef = useRef(0);

  useEffect(() => {
    if (!active) {
      setStats({ fases: 0, programas: 0, areas: 0 });
      return undefined;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStats(TARGETS);
      return undefined;
    }
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / 900);
      const e = 1 - (1 - p) ** 3;
      setStats({
        fases: Math.round(TARGETS.fases * e),
        programas: Math.round(TARGETS.programas * e),
        areas: Math.round(TARGETS.areas * e),
      });
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);

  return stats;
}

function Stat({ value, label, color }) {
  return (
    <div
      className="rounded-2xl px-[18px] py-4"
      style={{ background: `${color}14`, border: `1px solid ${color}38` }}
    >
      <div className="text-[32px] leading-none font-extrabold" style={{ ...P, color }}>
        {value}
      </div>
      <div className="mt-1.5 text-[12px]" style={{ color: 'rgba(242,239,233,.6)' }}>
        {label}
      </div>
    </div>
  );
}

/* ── Modal comparativo antes / después ── */
function ModalComparativa({ open, onClose }) {
  const [lado, setLado] = useState('ambos');

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const botones = [
    { id: 'ambos', label: 'Comparar' },
    { id: 'antes', label: 'Solo el antes' },
    { id: 'despues', label: 'Solo el después' },
  ];

  return (
    <div
      onClick={onClose}
      role="presentation"
      className="fixed inset-0 z-[200] grid animate-[fadeIn_.22s_ease_both] place-items-center bg-[rgba(4,7,10,.78)] p-5 backdrop-blur-[6px] sm:p-8"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Qué cambia en la operación"
        data-lenis-prevent
        className="relative max-h-[88vh] w-full max-w-[1060px] animate-[modalIn_.3s_cubic-bezier(.2,.8,.3,1)_both] overflow-auto rounded-3xl border border-white/15 bg-[#0C141C]"
        style={{ boxShadow: '0 40px 100px rgba(0,0,0,.6)' }}
      >
        <div className="sticky top-0 z-[2] flex flex-wrap items-center justify-between gap-5 border-b border-white/[.09] bg-[#0C141C] px-7 pt-6 pb-[18px]">
          <div>
            <div
              className="mb-2 text-[10.5px] font-bold uppercase"
              style={{ letterSpacing: '.18em', color: C.amarillo }}
            >
              Antes y después
            </div>
            <h3
              className="m-0 text-[clamp(20px,2.4vw,26px)] font-bold text-white"
              style={{ ...P, letterSpacing: '-.025em' }}
            >
              Qué cambia en la operación
            </h3>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="inline-flex rounded-full border border-white/10 bg-white/[.07] p-1">
              {botones.map((b) => {
                const on = b.id === lado;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setLado(b.id)}
                    className="cursor-pointer rounded-full border-0 px-[15px] py-[9px] text-[12.5px] font-semibold transition-colors duration-200"
                    style={{
                      ...P,
                      background: on ? C.amarillo : 'transparent',
                      color: on ? '#10131A' : 'rgba(242,239,233,.6)',
                    }}
                  >
                    {b.label}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="grid h-[38px] w-[38px] cursor-pointer place-items-center rounded-full border border-white/15 bg-transparent text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        <div className="px-4 pt-1.5 pb-1 sm:px-7">
          <div className="grid grid-cols-[110px_1fr] items-center gap-x-3 border-b border-white/[.09] px-1 py-3.5 sm:grid-cols-[150px_1fr_34px_1fr] sm:gap-x-4">
            <span
              className="text-[10.5px] font-bold uppercase"
              style={{ letterSpacing: '.16em', color: 'rgba(242,239,233,.35)' }}
            >
              Dimensión
            </span>
            <span
              className="flex items-center gap-2 text-[13.5px] font-bold"
              style={{ ...P, color: 'rgba(242,239,233,.6)' }}
            >
              <span className="h-2 w-2 rounded-full bg-[#6B7280]" />
              IA sin orden
            </span>
            <span className="hidden sm:block" />
            <span
              className="hidden items-center gap-2 text-[13.5px] font-bold sm:flex"
              style={{ ...P, color: C.turquesa }}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: C.turquesa }} />
              Con la ruta GEC IA
            </span>
          </div>

          {COMPARATIVA.map((c, idx) => (
            <div
              key={c.dim}
              className="grid grid-cols-1 items-center gap-x-4 gap-y-2 border-b border-white/[.06] px-1 py-4 transition-colors hover:bg-white/[.04] sm:grid-cols-[150px_1fr_34px_1fr] sm:gap-y-0"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="text-[12px] font-extrabold"
                  style={{ ...P, color: FASES[idx % 4].color }}
                >
                  0{idx + 1}
                </span>
                <span
                  className="text-[12.5px] font-semibold"
                  style={{ letterSpacing: '.02em', color: 'rgba(242,239,233,.82)' }}
                >
                  {c.dim}
                </span>
              </div>
              <div
                className="text-[14px] leading-[1.45] transition-opacity duration-300"
                style={{
                  color: 'rgba(242,239,233,.55)',
                  opacity: lado === 'despues' ? 0.25 : 1,
                }}
              >
                {c.antes}
              </div>
              <div className="hidden place-items-center text-[15px] sm:grid" style={{ color: C.amarillo }}>
                →
              </div>
              <div
                className="text-[14px] leading-[1.45] font-medium text-[#F2EFE9] transition-opacity duration-300"
                style={{ opacity: lado === 'antes' ? 0.25 : 1 }}
              >
                {c.despues}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-[18px] px-7 pt-[18px] pb-6">
          <span className="text-[13.5px]" style={{ color: 'rgba(242,239,233,.6)' }}>
            Ese salto es lo que el módulo vende: orden, criterio y resultados.
          </span>
          <a
            href="#agendar"
            onClick={onClose}
            className="rounded-full px-5 py-3 text-[13px] font-bold text-[#10131A] transition-colors hover:bg-[#FFD25E]"
            style={{ ...P, background: C.amarillo }}
          >
            Empezar por el IA Scan →
          </a>
        </div>
      </div>
    </div>
  );
}

/* ── Panel completo GEC IA ── */
export default function PanelEduca({ open, onClose }) {
  const scrollRef = useRef(null);
  const [mode, setMode] = useState('puertas');
  const [sel, setSel] = useState({ puertas: 0, programas: 0, areas: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [acceso, setAcceso] = useState(() => leerAcceso());
  const heroVideoRef = useRef(null);
  const [heroPainted, setHeroPainted] = useState(false);
  const stats = useCountUp(open);

  const closeModal = useCallback(() => setModalOpen(false), []);

  useEffect(() => {
    if (!open) return undefined;
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    const onKey = (e) => {
      if (e.key === 'Escape' && !modalOpen) onClose();
    };
    document.addEventListener('keydown', onKey);
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
    };
  }, [open, onClose, modalOpen]);

  // El loop del hero solo corre con el panel abierto
  useEffect(() => {
    const v = heroVideoRef.current;
    if (!v) return;
    if (open && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [open]);

  const i = sel[mode] ?? 0;
  const items = navSource(mode);
  const detail = buildDetail(mode, i);

  return (
    <aside
      ref={scrollRef}
      aria-hidden={!open}
      data-lenis-prevent
      // Por encima del header del sitio (z-130): el panel trae su propia barra
      className="fixed inset-0 z-[150] overflow-y-auto bg-[#06090D] transition-transform duration-700 [transition-timing-function:cubic-bezier(.22,1,.36,1)]"
      style={{
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        visibility: open ? 'visible' : 'hidden',
        overscrollBehavior: 'contain',
        boxShadow: '-40px 0 120px rgba(0,0,0,.7)',
      }}
    >
      {/* Barra superior */}
      <div className="sticky top-0 z-[50] flex flex-wrap items-center justify-between gap-4 border-b border-white/[.08] bg-[rgba(6,9,13,.82)] px-[clamp(20px,4vw,40px)] py-3.5 backdrop-blur-[14px]">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex cursor-pointer items-center gap-2.5 rounded-full border border-white/15 bg-white/[.04] py-2.5 pr-[18px] pl-3.5 text-[13px] font-medium text-[#F2EFE9] transition-colors hover:border-[#F5B301] hover:text-[#F5B301]"
          style={P}
        >
          <span className="text-base">←</span> Volver al ecosistema
        </button>
        <div className="hidden items-center gap-3 md:flex">
          <span
            className="grid h-[30px] w-[30px] place-items-center rounded-[9px] text-[13px] font-extrabold text-[#10131A]"
            style={{ ...P, background: 'linear-gradient(135deg,#F5B301,#E8762B)' }}
          >
            G
          </span>
          <span className="text-[15px] font-bold" style={{ ...P, letterSpacing: '-.01em' }}>
            GEC IA
          </span>
          <span
            className="border-l border-white/15 pl-3 text-[11px] uppercase"
            style={{ letterSpacing: '.14em', color: 'rgba(242,239,233,.45)' }}
          >
            Educa + Soluciona
          </span>
        </div>
        <a
          href="#agendar"
          className="hidden rounded-full px-[18px] py-2.5 text-[13px] font-bold text-[#10131A] transition-colors hover:bg-[#FFD25E] sm:inline-block"
          style={{ ...P, background: C.amarillo }}
        >
          Agendar IA Scan
        </a>
      </div>

      {/* Hero */}
      <section
        className="relative px-[clamp(20px,4vw,40px)] pt-[clamp(56px,7vw,84px)] pb-[clamp(64px,8vw,96px)]"
        style={{
          background:
            'radial-gradient(1100px 620px at 12% 8%, #17415F 0%, #0C2338 42%, #06090D 100%)',
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 animate-[glowPulse_7s_ease-in-out_infinite]"
          style={{
            background:
              'radial-gradient(600px 380px at 78% 62%, rgba(60,191,174,.18), transparent 70%)',
          }}
        />
        <div className="relative mx-auto grid max-w-[1220px] items-center gap-[clamp(32px,5vw,56px)] lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <div
              className="mb-6 inline-flex items-center gap-2.5 rounded-full py-[7px] pr-3.5 pl-2"
              style={{ background: 'rgba(245,179,1,.12)', border: '1px solid rgba(245,179,1,.35)' }}
            >
              <span
                className="h-[7px] w-[7px] rounded-full"
                style={{ background: C.amarillo, boxShadow: '0 0 0 4px rgba(245,179,1,.2)' }}
              />
              <span
                className="text-[11px] font-semibold uppercase"
                style={{ letterSpacing: '.16em', color: C.amarillo }}
              >
                Módulo interno · GEC Educa
              </span>
            </div>

            <h1
              className="m-0 mb-5 text-[clamp(56px,9vw,92px)] leading-[.92] font-extrabold text-white"
              style={{ ...P, letterSpacing: '-.035em' }}
            >
              GEC{' '}
              <span
                style={{
                  background: 'linear-gradient(120deg,#F5B301 20%,#3CBFAE 90%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                IA
              </span>
            </h1>
            <p
              className="m-0 mb-5 max-w-[20ch] text-[clamp(21px,2.6vw,27px)] leading-[1.3] font-semibold text-white"
              style={{ ...P, letterSpacing: '-.02em' }}
            >
              De entender la IA a aplicarla con orden.
            </p>
            <p
              className="m-0 mb-8 max-w-[46ch] text-[16px] leading-[1.7]"
              style={{ color: 'rgba(242,239,233,.62)', textWrap: 'pretty' }}
            >
              La IA no se adopta con una sola capacitación. Este módulo ordena el camino en cuatro
              fases y dos pilares:{' '}
              <strong className="font-semibold" style={{ color: C.amarillo }}>
                Educa
              </strong>{' '}
              forma a las personas,{' '}
              <strong className="font-semibold" style={{ color: C.turquesa }}>
                Soluciona
              </strong>{' '}
              implementa los sistemas.
            </p>

            <div className="mb-11 flex flex-wrap items-center gap-3.5">
              <a
                href="#agendar"
                className="inline-flex items-center gap-2.5 rounded-full px-7 py-4 text-[15px] font-bold text-[#10131A] transition-transform duration-200 hover:-translate-y-0.5"
                style={{ ...P, background: C.amarillo, boxShadow: '0 14px 34px rgba(245,179,1,.28)' }}
              >
                Agendar diagnóstico IA Scan <span className="text-[17px]">→</span>
              </a>
              <a
                href="#catalogo"
                className="inline-flex items-center gap-2.5 rounded-full border border-white/25 px-6 py-[15px] text-[15px] font-semibold text-[#F2EFE9] transition-colors hover:bg-white/[.08]"
                style={P}
              >
                Ver el catálogo
              </a>
            </div>

            <div className="grid max-w-[520px] grid-cols-3 gap-4">
              <Stat value={stats.fases} label="fases de la ruta" color={C.turquesa} />
              <Stat value={stats.programas} label="programas activos" color={C.amarillo} />
              <Stat value={stats.areas} label="áreas cubiertas" color={C.naranja} />
            </div>
          </div>

          <div className="relative grid place-items-center">
            <div
              className="pointer-events-none absolute aspect-square w-[70%] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(245,179,1,.22), transparent 65%)',
                filter: 'blur(10px)',
              }}
            />
            {/* Sin marco ni borde: el fondo del render empata con el de la
                sección, así el personaje se lee flotando sobre la página. */}
            <div
              className="relative w-full max-w-[560px]"
              style={{
                // El render trae su propio fondo navy: lo dejamos llenar la
                // columna y sólo desvanecemos los bordes para que se funda con
                // el degradado de la sección, sin leerse como una tarjeta.
                WebkitMaskImage:
                  'linear-gradient(to right, transparent 0%, #000 16%, #000 84%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 12%, #000 86%, transparent 100%)',
                maskImage:
                  'linear-gradient(to right, transparent 0%, #000 16%, #000 84%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 12%, #000 86%, transparent 100%)',
                WebkitMaskComposite: 'source-in',
                maskComposite: 'intersect',
              }}
            >
              <img
                loading="lazy"
                decoding="async"
                src="/merakis/educa-hero.webp"
                alt="Meraki, guía del módulo GEC IA"
                className="block w-full transition-opacity duration-500"
                style={{ opacity: heroPainted ? 0 : 1 }}
              />
              <video
                ref={heroVideoRef}
                muted
                loop
                playsInline
                preload="none"
                poster="/merakis/educa-hero.webp"
                onPlaying={() => setHeroPainted(true)}
                className="absolute inset-0 block h-full w-full object-cover"
              >
                <source src="/assets/videos/educa-hero.mp4" type="video/mp4" />
              </video>
            </div>
            <div className="absolute bottom-1.5 left-1/2 flex -translate-x-1/2 items-center gap-2.5 rounded-full border border-white/15 bg-[rgba(6,9,13,.72)] px-[18px] py-2.5 whitespace-nowrap backdrop-blur-[10px]">
              <span className="h-2 w-2 rounded-full" style={{ background: C.turquesa }} />
              <span className="text-[12.5px] font-semibold text-[#F2EFE9]">
                Meraki te guía por el módulo
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Dos pilares */}
      <section className="border-t border-white/[.07] bg-[#0A0E13] px-[clamp(20px,4vw,40px)] py-[clamp(56px,7vw,88px)]">
        <div className="mx-auto max-w-[1220px]">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-8">
            <div>
              <div
                className="mb-3.5 text-[11px] font-semibold uppercase"
                style={{ letterSpacing: '.18em', color: C.naranja }}
              >
                Cómo está armado
              </div>
              <h2
                className="m-0 text-[clamp(30px,4vw,46px)] leading-[1.05] font-bold text-white"
                style={{ ...P, letterSpacing: '-.03em' }}
              >
                Un ecosistema, dos pilares
              </h2>
            </div>
            <p
              className="m-0 max-w-[40ch] text-[15px] leading-[1.65]"
              style={{ color: 'rgba(242,239,233,.55)' }}
            >
              Todo programa del módulo pertenece a uno de los dos pilares.
            </p>
          </div>

          <div className="grid gap-[26px] md:grid-cols-2">
            <div
              className="relative overflow-hidden rounded-[26px] px-9 pt-[38px] pb-[34px] text-[#10131A] transition-transform duration-250 hover:-translate-y-1"
              style={{ background: 'linear-gradient(150deg,#FFC935,#F5B301 55%,#E8A200)' }}
            >
              <div
                className="mb-4 text-[11px] font-bold uppercase opacity-60"
                style={{ letterSpacing: '.2em' }}
              >
                Pilar formativo
              </div>
              <h3
                className="m-0 mb-3.5 text-[clamp(30px,4vw,42px)] font-extrabold"
                style={{ ...P, letterSpacing: '-.03em' }}
              >
                GEC EDUCA
              </h3>
              <p className="m-0 mb-6 max-w-[34ch] text-[15.5px] leading-[1.6] font-medium">
                Forma, inspira y acompaña a los equipos para usar IA con criterio y aplicarla a su
                trabajo real.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Talleres', 'Diagnóstico', 'Sprints por área', 'Cultura'].map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-[rgba(16,19,26,.12)] px-3.5 py-[7px] text-[12.5px] font-semibold"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="absolute -right-10 -bottom-[50px] h-[190px] w-[190px] rounded-full border-[14px] border-[rgba(16,19,26,.08)]" />
            </div>

            <div
              className="relative overflow-hidden rounded-[26px] px-9 pt-[38px] pb-[34px] transition-transform duration-250 hover:-translate-y-1"
              style={{
                background: 'linear-gradient(150deg,#154A63,#13314F 60%,#0E2438)',
                border: '1px solid rgba(60,191,174,.3)',
              }}
            >
              <div
                className="mb-4 text-[11px] font-bold uppercase"
                style={{ letterSpacing: '.2em', color: C.turquesa }}
              >
                Pilar de implementación
              </div>
              <h3
                className="m-0 mb-3.5 text-[clamp(30px,4vw,42px)] font-extrabold text-white"
                style={{ ...P, letterSpacing: '-.03em' }}
              >
                GEC SOLUCIONA
              </h3>
              <p
                className="m-0 mb-6 max-w-[34ch] text-[15.5px] leading-[1.6]"
                style={{ color: 'rgba(242,239,233,.72)' }}
              >
                Diseña, configura e implementa las herramientas, automatizaciones y sistemas que la
                empresa necesita.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Ecosistema IA', 'Automatizaciones', 'Agentes', 'CRM y dashboards'].map((t) => (
                  <span
                    key={t}
                    className="rounded-full px-3.5 py-[7px] text-[12.5px] font-semibold"
                    style={{ background: 'rgba(60,191,174,.14)', color: '#7FE0D3' }}
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="absolute -right-10 -bottom-[50px] h-[190px] w-[190px] rounded-full border-[14px] border-[rgba(60,191,174,.09)]" />
            </div>
          </div>
        </div>
      </section>

      {/* La ruta — 4 fases */}
      <section
        id="ruta"
        className="px-[clamp(20px,4vw,40px)] py-[clamp(60px,7vw,92px)]"
        style={{ background: 'linear-gradient(180deg,#0A0E13,#0E1A24 40%,#0A0E13)' }}
      >
        <div className="mx-auto max-w-[1220px]">
          <div className="mx-auto mb-14 max-w-[640px] text-center">
            <div
              className="mb-3.5 text-[11px] font-semibold uppercase"
              style={{ letterSpacing: '.18em', color: C.turquesa }}
            >
              La ruta GEC IA
            </div>
            <h2
              className="m-0 mb-4 text-[clamp(30px,4vw,46px)] leading-[1.05] font-bold text-white"
              style={{ ...P, letterSpacing: '-.03em' }}
            >
              Cuatro fases
            </h2>
            <p className="m-0 text-[15.5px] leading-[1.7]" style={{ color: 'rgba(242,239,233,.58)' }}>
              Nadie recorre las cuatro siempre. Cada empresa entra por la fase que corresponde a su
              realidad.
            </p>
          </div>

          <div className="relative mb-[26px] h-1 rounded-full bg-white/[.08]">
            <div
              className="absolute inset-0 origin-left rounded-full"
              style={{
                background: 'linear-gradient(90deg,#3CBFAE,#F5B301 34%,#E8762B 67%,#5B8FF9)',
              }}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {FASES.map((f) => (
              <div
                key={f.n}
                className="relative rounded-[22px] border border-white/[.08] bg-[#10161D] px-6 pt-[26px] pb-7 transition-all duration-250 hover:-translate-y-1 hover:bg-[#131B24]"
                style={{ borderTop: `3px solid ${f.color}` }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className="text-[34px] leading-none font-extrabold"
                    style={{ ...P, color: f.color }}
                  >
                    {f.n}
                  </span>
                  <span
                    className="text-[18px] font-bold text-white"
                    style={{ ...P, letterSpacing: '-.01em' }}
                  >
                    {f.name}
                  </span>
                </div>
                <p
                  className="m-0 mb-5 min-h-[66px] text-[14px] leading-[1.6]"
                  style={{ color: 'rgba(242,239,233,.58)' }}
                >
                  {f.desc}
                </p>
                <div className="mb-[18px] h-px bg-white/[.08]" />
                <div className="flex flex-col gap-2.5">
                  {f.items.map((it) => (
                    <div key={it.name} className="flex items-center gap-2.5">
                      <span
                        className="rounded-md px-2 py-1 text-[9.5px] font-bold uppercase"
                        style={{
                          letterSpacing: '.1em',
                          background:
                            it.pilar === 'Educa' ? 'rgba(245,179,1,.16)' : 'rgba(60,191,174,.16)',
                          color: it.pilar === 'Educa' ? C.amarillo : '#7FE0D3',
                        }}
                      >
                        {it.pilar}
                      </span>
                      <span
                        className="text-[13.5px] font-medium"
                        style={{ color: 'rgba(242,239,233,.86)' }}
                      >
                        {it.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Catálogo — 3 modos */}
      <section
        id="catalogo"
        className="px-[clamp(20px,4vw,40px)] pt-[clamp(60px,7vw,96px)] pb-[clamp(64px,8vw,100px)] text-[#14181F]"
        style={{ background: '#F4F1EA' }}
      >
        <div className="mx-auto max-w-[1220px]">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-10">
            <div>
              <div
                className="mb-3.5 text-[11px] font-bold uppercase"
                style={{ letterSpacing: '.18em', color: C.naranja }}
              >
                Explora el módulo formativo
              </div>
              <h2
                className="m-0 mb-3.5 text-[clamp(30px,4vw,48px)] leading-[1.03] font-bold text-[#101720]"
                style={{ ...P, letterSpacing: '-.035em' }}
              >
                Descubre tu formación con esta guía
              </h2>
              <p
                className="m-0 max-w-[52ch] text-[16px] leading-[1.65]"
                style={{ color: 'rgba(20,24,31,.62)' }}
              >
                Tres formas de entrar al mismo catálogo: por el punto de partida del cliente, por
                programa o por área de trabajo.
              </p>
            </div>
            <div
              className="inline-flex rounded-full bg-[#E6E1D6] p-[5px]"
              style={{ display: acceso ? undefined : 'none' }}
            >
              {MODOS.map((m) => {
                const on = m.id === mode;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMode(m.id)}
                    className="cursor-pointer rounded-full border-0 px-[22px] py-3 text-[14px] font-semibold transition-colors duration-250"
                    style={{
                      ...P,
                      background: on ? '#101720' : 'transparent',
                      color: on ? '#F4F1EA' : 'rgba(20,24,31,.6)',
                      boxShadow: on ? '0 8px 20px rgba(16,23,32,.2)' : 'none',
                    }}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {!acceso && <GateForm onUnlock={setAcceso} />}

          <div
            className="grid items-start gap-[22px] lg:grid-cols-[340px_1fr]"
            style={{ display: acceso ? undefined : 'none' }}
          >
            {/* Navegación lateral */}
            <div className="flex flex-col gap-2.5">
              <div
                className="px-1.5 pt-1 pb-2 text-[11px] font-bold uppercase"
                style={{ letterSpacing: '.16em', color: 'rgba(20,24,31,.42)' }}
              >
                {navTitle(mode)}
              </div>
              {items.map((t, idx) => {
                const active = idx === i;
                const color = FASES[t.fase].color;
                return (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => setSel((s) => ({ ...s, [mode]: idx }))}
                    className="flex cursor-pointer items-center gap-3.5 rounded-2xl px-4 py-[15px] text-left transition-all duration-200 hover:translate-x-[3px]"
                    style={{
                      background: active ? '#FFFFFF' : 'rgba(255,255,255,.45)',
                      border: `1px solid ${active ? color : 'rgba(20,24,31,.08)'}`,
                      boxShadow: active ? '0 12px 26px rgba(16,23,32,.12)' : 'none',
                    }}
                  >
                    <span
                      className="grid h-[34px] w-[34px] flex-none place-items-center rounded-[11px] text-[13px] font-extrabold"
                      style={{
                        ...P,
                        background: active ? color : 'rgba(20,24,31,.07)',
                        color: active ? '#10131A' : 'rgba(20,24,31,.55)',
                      }}
                    >
                      {t.badge}
                    </span>
                    <span className="flex min-w-0 flex-col gap-[3px]">
                      <span
                        className="text-[14.5px] font-semibold"
                        style={{
                          ...P,
                          letterSpacing: '-.01em',
                          color: active ? '#101720' : 'rgba(20,24,31,.72)',
                        }}
                      >
                        {t.label}
                      </span>
                      <span className="text-[12px]" style={{ color: 'rgba(20,24,31,.5)' }}>
                        {t.meta}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Panel de detalle — se re-monta con key para reanimar */}
            <div
              key={`${mode}-${i}`}
              className="relative animate-[panelIn_.42s_cubic-bezier(.2,.8,.3,1)_both] overflow-hidden rounded-[26px] border border-[rgba(20,24,31,.08)] bg-white px-[clamp(22px,3vw,40px)] pt-10 pb-9"
              style={{ boxShadow: '0 26px 60px rgba(16,23,32,.09)' }}
            >
              <div
                className="absolute top-0 right-0 left-0 h-[5px]"
                style={{ background: detail.color }}
              />

              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span
                  className="rounded-lg px-[11px] py-1.5 text-[10.5px] font-bold uppercase"
                  style={{
                    letterSpacing: '.16em',
                    background: `${detail.color}22`,
                    color: detail.color,
                  }}
                >
                  {detail.eyebrow}
                </span>
                <span className="text-[12.5px] font-medium" style={{ color: 'rgba(20,24,31,.5)' }}>
                  {detail.eyebrowNote}
                </span>
              </div>

              <h3
                className="m-0 mb-3.5 text-[clamp(24px,3vw,34px)] leading-[1.12] font-bold text-[#101720]"
                style={{ ...P, letterSpacing: '-.03em' }}
              >
                {detail.title}
              </h3>
              <p
                className="m-0 mb-7 max-w-[60ch] text-[16px] leading-[1.65]"
                style={{ color: 'rgba(20,24,31,.66)', textWrap: 'pretty' }}
              >
                {detail.lead}
              </p>

              {detail.steps && (
                <div className="mb-[26px] rounded-[18px] bg-[#F7F5F0] p-[22px]">
                  <div
                    className="mb-4 text-[11px] font-bold uppercase"
                    style={{ letterSpacing: '.16em', color: 'rgba(20,24,31,.42)' }}
                  >
                    {detail.stepsTitle}
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {detail.steps.map((s, idx) => (
                      <div
                        key={s.label}
                        className="flex animate-[chipIn_.4s_ease_both] items-center gap-2.5"
                        style={{ animationDelay: `${idx * 70}ms` }}
                      >
                        <span className="inline-flex items-center gap-2.5 rounded-full border border-[rgba(20,24,31,.1)] bg-white px-[15px] py-2.5 text-[13.5px] font-semibold text-[#101720]">
                          <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                          {s.label}
                        </span>
                        {!s.last && (
                          <span className="text-[15px]" style={{ color: 'rgba(20,24,31,.3)' }}>
                            →
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-[26px] md:grid-cols-2">
                <div>
                  <div
                    className="mb-3.5 text-[11px] font-bold uppercase"
                    style={{ letterSpacing: '.16em', color: 'rgba(20,24,31,.42)' }}
                  >
                    {detail.leftTitle}
                  </div>
                  <div className="flex flex-col gap-3">
                    {detail.left.map((t) => (
                      <div key={t} className="flex items-start gap-3">
                        <span
                          className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full"
                          style={{ background: detail.color }}
                        />
                        <span
                          className="text-[14.5px] leading-[1.55]"
                          style={{ color: 'rgba(20,24,31,.78)' }}
                        >
                          {t}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className="rounded-[18px] px-6 py-[22px]"
                  style={{ background: `${detail.color}14` }}
                >
                  <div
                    className="mb-3.5 text-[11px] font-bold uppercase"
                    style={{ letterSpacing: '.16em', color: 'rgba(20,24,31,.45)' }}
                  >
                    {detail.rightTitle}
                  </div>
                  <div className="flex flex-col gap-3">
                    {detail.right.map((r) => (
                      <div key={r.label}>
                        <div className="text-[14px] font-semibold text-[#101720]" style={P}>
                          {r.label}
                        </div>
                        <div
                          className="mt-0.5 text-[13px] leading-[1.5]"
                          style={{ color: 'rgba(20,24,31,.6)' }}
                        >
                          {r.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-[30px] flex flex-wrap items-center justify-between gap-5 border-t border-[rgba(20,24,31,.08)] pt-6">
                <div className="max-w-[52ch] text-[13.5px]" style={{ color: 'rgba(20,24,31,.55)' }}>
                  {detail.footnote}
                </div>
                <a
                  href="#agendar"
                  className="inline-flex items-center gap-2 rounded-full px-[22px] py-[13px] text-[14px] font-bold whitespace-nowrap text-[#101720] transition-colors hover:bg-[#FFD25E]"
                  style={{ ...P, background: C.amarillo }}
                >
                  Agendar esta ruta →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impacto — abre el modal */}
      <section id="impacto" className="bg-[#0A0E13] px-[clamp(20px,4vw,40px)] pt-[42px] pb-[46px]">
        <div
          className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-[26px] rounded-[20px] px-[26px] py-[22px]"
          style={{
            background: 'linear-gradient(100deg,rgba(60,191,174,.1),rgba(19,49,79,.32))',
            border: '1px solid rgba(60,191,174,.22)',
          }}
        >
          <div className="flex items-center gap-4">
            <span
              className="grid h-[42px] w-[42px] flex-none place-items-center rounded-[13px] text-[19px]"
              style={{ background: 'rgba(245,179,1,.16)', color: C.amarillo }}
            >
              ⇄
            </span>
            <div>
              <div
                className="text-[18px] font-bold text-white"
                style={{ ...P, letterSpacing: '-.015em' }}
              >
                Qué cambia en la operación
              </div>
              <div className="mt-1 text-[13.5px]" style={{ color: 'rgba(242,239,233,.55)' }}>
                Comparativa antes / después en 5 dimensiones · material de apoyo.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border-0 px-[22px] py-[13px] text-[13.5px] font-bold text-[#10131A] transition-transform duration-200 hover:-translate-y-0.5"
            style={{ ...P, background: C.amarillo }}
          >
            Ver comparativa →
          </button>
        </div>
      </section>

      {/* CTA agendar */}
      <section
        id="agendar"
        className="px-[clamp(20px,4vw,40px)] pt-[clamp(60px,7vw,96px)] pb-[clamp(68px,8vw,104px)] text-[#10131A]"
        style={{ background: C.amarillo }}
      >
        <div className="mx-auto grid max-w-[1000px] items-center gap-12 lg:grid-cols-[1.2fr_.8fr]">
          <div>
            <div
              className="mb-4 text-[11px] font-bold uppercase opacity-60"
              style={{ letterSpacing: '.18em' }}
            >
              Siguiente paso
            </div>
            <h2
              className="m-0 mb-[18px] text-[clamp(34px,5vw,52px)] leading-none font-extrabold"
              style={{ ...P, letterSpacing: '-.035em' }}
            >
              Empieza por el IA Scan
            </h2>
            <p className="m-0 mb-[30px] max-w-[44ch] text-[17px] leading-[1.6] font-medium">
              Una sesión de 60–90 minutos con los colaboradores clave. Salimos con hallazgos,
              prioridades y la ruta recomendada para la empresa.
            </p>
            <div className="flex flex-wrap items-center gap-3.5">
              <a
                href="#agendar"
                className="inline-flex items-center gap-2.5 rounded-full bg-[#10131A] px-[30px] py-[17px] text-[16px] font-bold transition-transform duration-200 hover:-translate-y-0.5"
                style={{ ...P, color: C.amarillo }}
              >
                Agendar diagnóstico <span className="text-[18px]">→</span>
              </a>
              <span className="text-[13.5px] font-semibold opacity-65">
                Sin costo para clientes activos de GEC
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {[
              ['1. Diagnóstico', 'Nivel actual, herramientas y barreras.', false],
              ['2. Ruta recomendada', 'Fases y programas según su realidad.', false],
              ['3. Ejecución', 'Educa forma, Soluciona implementa.', true],
            ].map(([t, d, dark]) => (
              <div
                key={t}
                className="rounded-2xl px-5 py-[18px]"
                style={
                  dark
                    ? { background: '#10131A', color: '#F2EFE9' }
                    : { background: 'rgba(16,19,26,.08)' }
                }
              >
                <div
                  className="text-[14px] font-bold"
                  style={{ ...P, color: dark ? C.amarillo : undefined }}
                >
                  {t}
                </div>
                <div className="mt-1 text-[13px] opacity-70">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-6 border-t border-white/[.08] bg-[#06090D] px-[clamp(20px,4vw,40px)] py-8">
        <span className="text-[12.5px]" style={{ color: 'rgba(242,239,233,.42)' }}>
          Módulo interno GEC IA · Grupo Espacio Creativo
        </span>
        <span className="text-[12.5px]" style={{ color: 'rgba(242,239,233,.42)' }}>
          Educa forma. Soluciona implementa.
        </span>
      </footer>

      <ModalComparativa open={modalOpen} onClose={closeModal} />
    </aside>
  );
}
