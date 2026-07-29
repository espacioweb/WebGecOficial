import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { icons } from './SocialIcons';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '../utils/gsapSetup';
import { loadSequence, nearestLoaded, anchoDeDecodificado } from '../utils/frameSequence';
import {
  pilares,
  proceso,
  fuerzas,
  abanico,
  marcas,
  contacto,
  redes,
  WHATSAPP,
  insideVideo,
  testimonios,
  footerCols,
} from '../data/site';

const P = { fontFamily: 'Poppins, sans-serif' };

function Eyebrow({ children, color = 'rgba(237,234,228,.45)' }) {
  return (
    <div className="flex items-center gap-3.5">
      <span className="h-[7px] w-[7px] rounded-full bg-[#F5B301]" />
      <span className="text-[11px] uppercase" style={{ ...P, letterSpacing: '.34em', color }}>
        {children}
      </span>
    </div>
  );
}

/* ─────────────────────────── 02 Manifiesto ─────────────────────────── */
export function Manifiesto() {
  return (
    <section className="relative bg-[#060607] px-[clamp(24px,5vw,90px)] py-[clamp(90px,11vw,180px)]">
      <div className="mx-auto grid max-w-[1180px] gap-11">
        <Eyebrow>Nuestra promesa de valor</Eyebrow>
        <p
          className="m-0 text-[clamp(24px,2.9vw,46px)] leading-[1.24] font-medium text-[#EDEAE4]"
          style={{ ...P, letterSpacing: '-.02em', textWrap: 'pretty' }}
        >
          Ayudamos a las empresas a convertir ideas en crecimiento: fortaleciendo su marca,
          desarrollando su gente, creando mejores sistemas y diseñando experiencias que conectan
          con sus clientes.
        </p>
        <div className="grid gap-7 border-t border-white/10 pt-5 [grid-template-columns:repeat(auto-fit,minmax(230px,1fr))]">
          {[
            'Somos un ecosistema creativo diseñado para empresas que necesitan pensar mejor, comunicar mejor y producir mejor.',
            'Nuestro trabajo no se limita a campañas o piezas visuales: fortalecemos lo que la marca comunica hacia afuera y lo que construye desde adentro.',
            'Ideas, equipos, procesos, herramientas y la forma en que cada empresa se relaciona con sus clientes.',
          ].map((t) => (
            <p key={t} className="m-0 text-[15px] leading-[1.75] font-light" style={{ color: 'rgba(237,234,228,.6)' }}>
              {t}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── 03 Pilares ─────────────────────────── */

// Reproduce el loop solo cuando la tarjeta está en pantalla, para no
// tener 5 videos decodificando a la vez. Lo usan los pilares y Contacto.
function LoopMedia({ pilar }) {
  const wrapRef = useRef(null);
  const videoRef = useRef(null);
  const [painted, setPainted] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    const video = videoRef.current;
    if (!el || !video) return undefined;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { rootMargin: '200px 0px', threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // En móvil el video vive en una franja vertical y `object-cover` recorta por
  // los lados justo por donde está el personaje: `--foco` reencuadra sobre él.
  // En desktop la tarjeta es casi 16:9, el recorte es mínimo y va centrado.
  const encuadre = 'object-cover [object-position:var(--foco)_50%] lg:[object-position:50%_50%]';

  return (
    <div ref={wrapRef} className="absolute inset-0" style={{ '--foco': `${pilar.focus ?? 62}%` }}>
      <img
        loading="lazy"
        decoding="async"
        src={pilar.img}
        alt={pilar.alt ?? pilar.name}
        className={`absolute inset-0 block h-full w-full transition-opacity duration-500 ${encuadre}`}
        style={{ opacity: painted ? 0 : 1 }}
      />
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="none"
        poster={pilar.img}
        onPlaying={() => setPainted(true)}
        className={`absolute inset-0 block h-full w-full ${encuadre}`}
      >
        <source src={`/assets/videos/scene_${pilar.scene}.mp4`} type="video/mp4" />
      </video>
    </div>
  );
}

export function Pilares({ onOpenPanel }) {
  const secRef = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tweens = gsap.utils.toArray('[data-pilar-copy]').map((el) =>
          gsap.from(el.children, {
            y: 34,
            opacity: 0,
            duration: 0.7,
            ease: 'power3.out',
            stagger: 0.09,
            scrollTrigger: {
              trigger: el,
              start: 'top 78%',
              toggleActions: 'play none none reverse',
            },
          }),
        );
        return () => tweens.forEach((t) => t.scrollTrigger?.kill());
      });
      return () => mm.revert();
    },
    { scope: secRef },
  );

  return (
    <section
      ref={secRef}
      id="ecosistema"
      className="flex flex-col gap-[clamp(16px,2vw,28px)] bg-[#060607] px-[clamp(16px,3vw,44px)] pt-[clamp(40px,6vw,90px)] pb-[clamp(60px,7vw,120px)]"
    >
      <div className="flex flex-wrap items-end justify-between gap-[30px] px-[clamp(8px,1.5vw,26px)] pb-[clamp(20px,3vw,50px)]">
        <div className="flex flex-col gap-[18px]">
          <Eyebrow>Ecosistema de crecimiento GEC</Eyebrow>
          <h2
            className="m-0 max-w-[22ch] text-[clamp(28px,3.2vw,52px)] leading-[1.06] font-bold text-[#EDEAE4]"
            style={{ ...P, letterSpacing: '-.03em', textWrap: 'balance' }}
          >
            Cinco pilares que activarán todo lo que necesitas para el crecimiento creativo de tu
            empresa.
          </h2>
        </div>
      </div>

      {pilares.map((b, idx) => (
        <article
          key={b.id}
          id={b.id}
          // Desktop, sticky: cada pilar se estaciona en pantalla y el siguiente
          // sube encima; el z-index creciente mantiene el orden del apilado.
          // En móvil no: el copy solo ya pide 678 de los 784px de la tarjeta,
          // así que no queda sitio para el personaje. Ahí la tarjeta toma su
          // altura natural y el pilar se lee de corrido.
          className="relative overflow-hidden rounded-[clamp(24px,2.6vw,44px)] lg:sticky lg:top-[calc(50dvh-46vh)] lg:min-h-[92vh]"
          style={{ background: b.solid, zIndex: idx + 1 }}
        >
          {/* Móvil: el personaje ocupa su propia franja, entero y centrado.
              Desktop: el loop va a sangre detrás de todo. */}
          <div className="relative h-[min(44vh,420px)] min-h-[300px] lg:absolute lg:inset-0 lg:h-auto lg:min-h-0">
            <LoopMedia pilar={b} />
            {/* Funde el pie de la franja con el color de la tarjeta */}
            <div
              className="pointer-events-none absolute inset-0 lg:hidden"
              style={{
                background: `linear-gradient(180deg, ${b.solid}00 0%, ${b.solid}00 52%, ${b.solid}CC 84%, ${b.solid} 100%)`,
              }}
            />
          </div>
          {/* Desktop: el copy va a la izquierda y el personaje respira a la derecha */}
          <div
            className="pointer-events-none absolute inset-0 hidden lg:block"
            style={{
              background: `linear-gradient(100deg, ${b.solid} 0%, ${b.solid}F2 26%, ${b.solid}B3 44%, ${b.solid}00 68%)`,
            }}
          />

          <div className="relative z-[2] flex w-full flex-col gap-8 p-[clamp(24px,4.4vw,88px)] pt-2 lg:min-h-[92vh] lg:w-[56%] lg:justify-between lg:gap-10 lg:pt-[clamp(24px,4.4vw,88px)]">
            <div className="flex items-center justify-between gap-5">
              <span className="text-[11px] uppercase" style={{ ...P, letterSpacing: '.34em', color: b.meta }}>
                {b.kicker}
              </span>
              <span className="text-[12px] font-bold" style={{ ...P, color: b.meta }}>
                {b.num}
              </span>
            </div>

            <div data-pilar-copy className="flex flex-col gap-[22px]">
              <h3
                className="m-0 text-[clamp(48px,7vw,124px)] leading-[.92] font-extrabold"
                style={{ ...P, letterSpacing: '-.045em', color: b.fg }}
              >
                {b.name}
              </h3>
              <p
                className="m-0 max-w-[40ch] text-[clamp(17px,1.6vw,26px)] leading-[1.35] font-medium"
                style={{ ...P, letterSpacing: '-.01em', color: b.fg }}
              >
                {b.tagline}
              </p>
              <p className="m-0 max-w-[48ch] text-[15px] leading-[1.75] font-light" style={{ color: b.muted }}>
                {b.blurb}
              </p>
            </div>

            <div className="flex flex-col gap-[22px]">
              <div className="flex max-w-[640px] flex-wrap gap-2">
                {b.items.map((it) => (
                  <span
                    key={it}
                    className="rounded-full px-[15px] py-[9px] text-[12.5px] font-medium"
                    style={{ border: `1px solid ${b.chipBorder}`, background: b.chipBg, color: b.fg }}
                  >
                    {it}
                  </span>
                ))}
              </div>
              {b.panel && (
                <button
                  type="button"
                  onClick={() => onOpenPanel(b.panel)}
                  className="inline-flex cursor-pointer items-center gap-2.5 self-start rounded-full border-none px-[26px] py-[15px] text-sm font-semibold transition-opacity hover:opacity-85"
                  style={{ ...P, background: b.fg, color: '#0B2545' }}
                >
                  {b.ctaLabel} <span className="text-base">→</span>
                </button>
              )}
            </div>
          </div>

        </article>
      ))}
    </section>
  );
}

/* ─────────────────── 04 Inside Your Brand ─────────────────── */

// Modal con el episodio de YouTube embebido
function VideoModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

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
        aria-label={insideVideo.title}
        className="relative w-full max-w-[1060px] animate-[modalIn_.3s_cubic-bezier(.2,.8,.3,1)_both]"
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/logos/inside-your-brand-dark.png"
              alt=""
              className="h-9 w-9 rounded-lg"
            />
            <span className="text-[14px] font-semibold text-white" style={P}>
              Inside Your Brand
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={insideVideo.channelUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-full bg-[#F5B301] px-4 py-2 text-[12.5px] font-bold text-[#0B0B0C] transition-colors hover:bg-[#FFD24A]"
              style={P}
            >
              Ir al canal ↗
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-white/20 bg-transparent text-white/75 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/12 bg-black">
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${insideVideo.id}?autoplay=1&rel=0`}
            title={insideVideo.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
export function InsideYourBrand() {
  const secRef = useRef(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const imgsRef = useRef([]);
  const wordsRef = useRef([]);
  const descsRef = useRef([]);
  const sideRef = useRef([]);
  const side2Ref = useRef([]);
  const numRef = useRef(null);
  const barRef = useRef(null);
  const shownRef = useRef(-1);

  useGSAP(
    () => {
      const n = proceso.length;
      const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

      // Cada paso ocupa una franja del recorrido. En vez de saltar de golpe al
      // cambiar de índice, las palabras se cruzan de forma continua: así el
      // avance se siente ligado al scroll y no como un clic.
      // Posición continua entre pasos: 0 = primer paso, n-1 = último.
      // Se recorta a los extremos para que Tendencias esté al 100% al entrar
      // y el último paso al 100% al salir.
      const posOf = (p) => clamp(p * n - 0.5, 0, n - 1);

      // Peso de cada paso según su distancia a la posición actual. El radio de
      // 0.55 deja apenas un roce entre vecinos (≈0.09 en la frontera): se cruzan
      // sin que se lean dos palabras encima, como pasaba con un cruce ancho.
      const RADIO = 0.55;
      const weight = (pos, i) => clamp(1 - Math.abs(pos - i) / RADIO, 0, 1);

      const apply = (p) => {
        const pos = posOf(p);
        const w = Array.from({ length: n }, (_, i) => weight(pos, i));
        const total = w.reduce((a, b) => a + b, 0) || 1;

        imgsRef.current.forEach((el, i) => {
          if (!el) return;
          const k = w[i] / total;
          el.style.opacity = String(k);
          el.style.transform = `scale(${(1 + 0.1 * (1 - k)).toFixed(4)})`;
        });

        wordsRef.current.forEach((el, i) => {
          if (!el) return;
          const k = w[i];
          el.style.opacity = String(k);
          // Ya pasó: sale hacia arriba. Aún no llega: espera abajo.
          const dir = pos > i ? -1 : 1;
          el.style.transform = `translateY(${(dir * (1 - k) * 90).toFixed(1)}%)`;
        });

        descsRef.current.forEach((el, i) => {
          if (!el) return;
          const k = w[i];
          el.style.opacity = String(k);
          el.style.transform = `translateY(${((pos > i ? -1 : 1) * (1 - k) * 16).toFixed(1)}px)`;
        });

        const idx = clamp(Math.round(pos), 0, n - 1);
        if (idx !== shownRef.current) {
          shownRef.current = idx;
          [sideRef, side2Ref].forEach((r) =>
            r.current.forEach((el, i) => {
              if (el) el.style.color = i === idx ? '#FFFFFF' : 'rgba(237,234,228,.28)';
            }),
          );
          if (numRef.current) numRef.current.textContent = `0${idx + 1}`;
        }
        if (barRef.current) barRef.current.style.width = `${(p * 100).toFixed(1)}%`;
      };

      const st = ScrollTrigger.create({
        trigger: secRef.current,
        start: 'top top',
        end: 'bottom bottom',
        // Sin snap: ScrollTrigger.snap mueve el scroll por su cuenta y pelea
        // con Lenis, lo que hacía saltar la sección hasta el último paso.
        onUpdate: (self) => apply(self.progress),
      });
      apply(0);
      return () => st.kill();
    },
    { scope: secRef },
  );

  return (
    <section id="inside" ref={secRef} className="relative h-[640vh] bg-[#050506]">
      <div className="sticky top-0 h-[100dvh] overflow-hidden">
        {proceso.map((p, i) => (
          <div
            key={p.i}
            ref={(el) => {
              imgsRef.current[i] = el;
            }}
            className="absolute inset-0 opacity-0 will-change-transform"
          >
            <img
              loading="lazy"
              decoding="async"
              src={p.img}
              alt=""
              className="h-full w-full object-cover"
              style={{ filter: 'brightness(.42) saturate(.9)' }}
            />
          </div>
        ))}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(5,5,6,.55) 0%, rgba(5,5,6,.25) 40%, rgba(5,5,6,.85) 100%)',
          }}
        />

        {/* Logo anclado a la esquina, fuera del flujo: dentro del bloque
            central sumaba una línea y empujaba el resto hacia abajo. */}
        <img
          src="/logos/inside-your-brand-dark.png"
          alt="Inside Your Brand"
          className="absolute top-[clamp(94px,11vh,120px)] left-[clamp(24px,5vw,90px)] z-[3] block h-[clamp(48px,4.4vw,68px)] w-auto rounded-xl"
          style={{ boxShadow: '0 14px 36px rgba(0,0,0,.5)' }}
        />

        <div className="absolute inset-0 grid place-items-center px-[clamp(24px,5vw,90px)] pt-[86px]">
          {/* Una sola columna en móvil. Con las tres de siempre, los índices
              laterales van en `display:none` y por tanto NO se colocan en el
              grid: el bloque central caía en la primera columna (152px), el
              texto se partía en 8 líneas y `Ver canal` se salía y lo recortaba
              el overflow. */}
          <div className="grid w-[min(1560px,100%)] items-center gap-[clamp(20px,4vw,70px)] [grid-template-columns:1fr] md:[grid-template-columns:1fr_auto_1fr]">
            <div className="hidden flex-col gap-1.5 justify-self-start md:flex">
              {proceso.map((p, i) => (
                <span
                  key={p.i}
                  ref={(el) => {
                    sideRef.current[i] = el;
                  }}
                  className="text-[clamp(13px,1.15vw,17px)] font-bold uppercase transition-colors duration-500"
                  style={{ ...P, letterSpacing: '.06em', color: 'rgba(237,234,228,.3)' }}
                >
                  {p.word}
                </span>
              ))}
            </div>

            {/* Sin items-center: los hijos deben estirarse, porque el bloque de
                palabras posiciona sus spans en absoluto y con ancho 0 no centran. */}
            <div className="flex flex-col gap-1.5 text-center">
              <h2
                className="m-0 text-[clamp(38px,7vw,124px)] leading-[.9] font-normal text-white"
                style={{ ...P, letterSpacing: '-.03em' }}
              >
                INSIDE
                <br />
                YOUR BRAND
              </h2>
              <div className="relative h-[clamp(40px,6.2vw,104px)] overflow-hidden">
                {proceso.map((p, i) => (
                  <span
                    key={p.i}
                    ref={(el) => {
                      wordsRef.current[i] = el;
                    }}
                    className="absolute inset-0 grid place-items-center opacity-0"
                  >
                    {p.action === 'youtube' ? (
                      <button
                        type="button"
                        onClick={() => setVideoOpen(true)}
                        aria-label="Ver el canal Inside Your Brand"
                        className="pointer-events-auto inline-flex cursor-pointer items-center gap-[clamp(10px,1.4vw,22px)] border-0 bg-transparent whitespace-nowrap text-[clamp(26px,5.2vw,86px)] leading-[.9] font-extrabold text-[#F5B301] transition-colors duration-300 hover:text-[#FFD24A]"
                        style={{ ...P, letterSpacing: '-.04em' }}
                      >
                        {p.word}
                        <span
                          aria-hidden="true"
                          className="grid h-[clamp(30px,3.4vw,58px)] w-[clamp(30px,3.4vw,58px)] flex-none place-items-center rounded-full bg-[#F5B301] pl-[.12em] text-[clamp(11px,1.2vw,20px)] leading-none text-[#0B0B0C]"
                        >
                          ▶
                        </span>
                      </button>
                    ) : (
                      <span
                        className="text-[clamp(26px,5.2vw,86px)] leading-[.9] font-extrabold text-[#F5B301] whitespace-nowrap"
                        style={{ ...P, letterSpacing: '-.04em' }}
                      >
                        {p.word}
                      </span>
                    )}
                  </span>
                ))}
              </div>
              {/* Apiladas para poder cruzarse; la altura la fija el contenedor */}
              <div className="relative mt-3.5 h-[92px]">
                {proceso.map((p, i) => (
                  <p
                    key={p.i}
                    ref={(el) => {
                      descsRef.current[i] = el;
                    }}
                    className="absolute inset-x-0 top-0 mx-auto max-w-[46ch] text-[15px] leading-[1.7] font-light opacity-0"
                    style={{ color: 'rgba(237,234,228,.7)' }}
                  >
                    {p.desc}
                  </p>
                ))}
              </div>
            </div>

            <div className="hidden flex-col gap-1.5 justify-self-end text-right md:flex">
              {proceso.map((p, i) => (
                <span
                  key={p.i}
                  ref={(el) => {
                    side2Ref.current[i] = el;
                  }}
                  className="text-[clamp(13px,1.15vw,17px)] font-bold uppercase transition-colors duration-500"
                  style={{ ...P, letterSpacing: '.06em', color: 'rgba(237,234,228,.3)' }}
                >
                  {p.word}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-[8%] left-1/2 flex w-[min(420px,70vw)] -translate-x-1/2 items-center gap-4">
          <span ref={numRef} className="text-[12px]" style={{ ...P, letterSpacing: '.1em', color: 'rgba(237,234,228,.75)' }}>
            01
          </span>
          <span className="relative h-px flex-1 overflow-hidden bg-white/20">
            <span ref={barRef} className="absolute inset-y-0 left-0 w-0 bg-[#F5B301]" />
          </span>
          <span className="text-[12px]" style={{ ...P, letterSpacing: '.1em', color: 'rgba(237,234,228,.4)' }}>
            0{proceso.length}
          </span>
        </div>
      </div>

      <VideoModal open={videoOpen} onClose={() => setVideoOpen(false)} />
    </section>
  );
}

/* ─────────────────── 05 Valor — scroll horizontal ─────────────────── */
export function ValorHorizontal() {
  const secRef = useRef(null);
  const trackRef = useRef(null);
  const barRef = useRef(null);
  const numRef = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const st = ScrollTrigger.create({
          trigger: secRef.current,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (self) => {
            const p = self.progress;
            const track = trackRef.current;
            if (!track) return;
            const max = Math.max(0, track.scrollWidth - window.innerWidth);
            track.style.transform = `translate3d(${(-p * max).toFixed(1)}px,0,0)`;
            if (barRef.current) barRef.current.style.width = `${(p * 100).toFixed(1)}%`;
            if (numRef.current) {
              const n = fuerzas.length;
              const i = Math.min(n, Math.max(1, Math.round(p * (n - 1)) + 1));
              numRef.current.textContent = `0${i} / 0${n}`;
            }
          },
        });
        return () => st.kill();
      });
      return () => mm.revert();
    },
    { scope: secRef },
  );

  return (
    <section id="valor" ref={secRef} className="relative h-[520vh] bg-[#08080A]">
      <div className="sticky top-0 flex h-[100dvh] flex-col overflow-hidden">
        <div className="flex items-center gap-3.5 px-[clamp(24px,5vw,90px)] pt-[clamp(90px,10vh,130px)]">
          <Eyebrow>Nuestro valor integrado — seis fuerzas que trabajan juntas</Eyebrow>
        </div>

        <div className="flex min-h-0 flex-1 items-stretch overflow-hidden py-[clamp(8px,2vh,26px)]">
          <div
            ref={trackRef}
            className="flex h-full gap-[clamp(20px,2.4vw,44px)] px-[clamp(24px,5vw,90px)] will-change-transform"
          >
            {fuerzas.map((f) => (
              <article
                key={f.n}
                className="relative h-full max-h-[620px] min-h-0 w-[clamp(300px,32vw,520px)] flex-none overflow-hidden rounded-[clamp(20px,2vw,34px)] border border-white/10 bg-[#0D0D10]"
              >
                <img
                  loading="lazy"
                  decoding="async"
                  src={f.img}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ filter: 'brightness(.45) saturate(.85)' }}
                />
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(180deg, rgba(6,6,7,.15) 0%, rgba(6,6,7,.9) 100%)' }}
                />
                <div className="relative z-[2] flex h-full flex-col justify-between p-[clamp(24px,2.4vw,42px)]">
                  <span
                    className="text-[clamp(64px,8vw,150px)] leading-[.8] font-extrabold text-white/15"
                    style={{ ...P, letterSpacing: '-.06em' }}
                  >
                    {f.n}
                  </span>
                  <div className="flex flex-col gap-3">
                    <span
                      className="text-[clamp(30px,3.4vw,58px)] leading-none font-extrabold text-white"
                      style={{ ...P, letterSpacing: '-.035em' }}
                    >
                      {f.en}
                    </span>
                    <span className="h-0.5 w-11 bg-[#F5B301]" />
                    <span className="max-w-[30ch] text-[14.5px] leading-[1.65] font-light" style={{ color: 'rgba(237,234,228,.72)' }}>
                      {f.es}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 px-[clamp(24px,5vw,90px)] pb-[clamp(40px,6vh,70px)]">
          <span className="text-[11px]" style={{ ...P, letterSpacing: '.2em', color: 'rgba(237,234,228,.35)' }}>
            SCROLL
          </span>
          <span className="relative h-px flex-1 bg-white/15">
            <span ref={barRef} className="absolute inset-y-0 left-0 w-0 bg-[#F5B301]" />
          </span>
          <span ref={numRef} className="text-[11px]" style={{ ...P, letterSpacing: '.2em', color: 'rgba(237,234,228,.5)' }}>
            01 / 06
          </span>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── 06 Portafolio — abanico ─────────────────── */
export function Portafolio() {
  const secRef = useRef(null);
  const cardsRef = useRef([]);
  const dotsRef = useRef([]);
  const descRef = useRef(null);
  const activeRef = useRef(-1);

  useGSAP(
    () => {
      const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
      const apply = (p) => {
        const n = abanico.length;
        const pos = p * (n - 1);
        const step = Math.min(230, window.innerWidth * 0.15);
        cardsRef.current.forEach((el, i) => {
          if (!el) return;
          const d = i - pos;
          const ad = Math.abs(d);
          el.style.transform = `translate3d(${(d * step).toFixed(1)}px,${(ad * 7).toFixed(1)}px,0) rotate(${(d * 9).toFixed(2)}deg) scale(${clamp(1 - ad * 0.1, 0.6, 1).toFixed(3)})`;
          el.style.zIndex = String(100 - Math.round(ad * 10));
          el.style.filter = `brightness(${clamp(1 - ad * 0.22, 0.35, 1).toFixed(2)})`;
          el.style.opacity = String(clamp(1 - ad * 0.16, 0.25, 1));
        });
        const idx = clamp(Math.round(pos), 0, n - 1);
        if (idx !== activeRef.current) {
          activeRef.current = idx;
          dotsRef.current.forEach((d, i) => {
            if (!d) return;
            d.style.background = i === idx ? '#F5B301' : 'rgba(255,255,255,.2)';
            d.style.transform = i === idx ? 'scale(1.4)' : 'scale(1)';
          });
          if (descRef.current) descRef.current.textContent = abanico[idx].desc;
        }
      };

      const st = ScrollTrigger.create({
        trigger: secRef.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => apply(self.progress),
      });
      apply(0);
      return () => st.kill();
    },
    { scope: secRef },
  );

  return (
    <section id="portafolio" ref={secRef} className="relative h-[420vh] bg-[#060607]">
      <div className="sticky top-0 flex h-[100dvh] flex-col justify-center gap-[clamp(24px,4vh,54px)] overflow-hidden">
        <div className="flex flex-wrap items-end justify-between gap-6 px-[clamp(24px,5vw,90px)]">
          <h2
            className="m-0 text-[clamp(26px,3vw,50px)] leading-[1.04] font-bold text-[#EDEAE4]"
            style={{ ...P, letterSpacing: '-.03em' }}
          >
            Lo que estamos construyendo.
          </h2>
          <span className="max-w-[36ch] text-[13px] leading-[1.6] font-light" style={{ color: 'rgba(237,234,228,.42)' }}>
            Portafolio, blog, podcast y contenidos se irán integrando a este ecosistema.
          </span>
        </div>

        <div className="relative grid h-[min(58vh,600px)] place-items-center">
          {abanico.map((c, i) => (
            <div
              key={c.i}
              ref={(el) => {
                cardsRef.current[i] = el;
              }}
              className="absolute aspect-[9/15] w-[clamp(190px,17vw,290px)] overflow-hidden rounded-[clamp(16px,1.6vw,28px)] bg-[#0D0D10] will-change-transform"
              style={{ boxShadow: '0 30px 80px rgba(0,0,0,.6)', transformOrigin: '50% 130%' }}
            >
              <img loading="lazy" decoding="async" src={c.img} alt={c.t} className="absolute inset-0 h-full w-full object-cover" />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(180deg, rgba(0,0,0,.1) 40%, rgba(0,0,0,.85) 100%)' }}
              />
              <div className="absolute right-0 bottom-0 left-0 flex flex-col gap-1.5 p-[clamp(14px,1.4vw,22px)]">
                <span className="text-[9.5px] uppercase" style={{ ...P, letterSpacing: '.26em', color: 'rgba(245,179,1,.9)' }}>
                  {c.kicker}
                </span>
                <span
                  className="text-[clamp(15px,1.4vw,22px)] leading-[1.1] font-bold text-white"
                  style={{ ...P, letterSpacing: '-.02em' }}
                >
                  {c.t}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="relative z-[200] flex flex-col items-center gap-3.5">
          <p
            ref={descRef}
            className="m-0 min-h-[48px] max-w-[44ch] text-center text-[14.5px] leading-[1.7] font-light"
            style={{ color: 'rgba(237,234,228,.6)' }}
          >
            {abanico[0].desc}
          </p>
          <div className="flex gap-2">
            {abanico.map((c, i) => (
              <span
                key={c.i}
                ref={(el) => {
                  dotsRef.current[i] = el;
                }}
                className="h-[7px] w-[7px] rounded-full bg-white/20 transition-all duration-500"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── 07 Marcas ─────────────────── */
export function Marcas() {
  const row = (
    <div className="flex gap-[clamp(40px,5vw,88px)] pr-[clamp(40px,5vw,88px)]">
      {marcas.map((m) => (
        <span
          key={m}
          className="text-[clamp(20px,2.2vw,34px)] font-semibold whitespace-nowrap"
          style={{ ...P, letterSpacing: '-.02em', color: 'rgba(237,234,228,.26)' }}
        >
          {m}
        </span>
      ))}
    </div>
  );

  return (
    <section className="overflow-hidden bg-[#060607] py-[clamp(50px,6vw,100px)]">
      <div className="mb-10 px-[clamp(24px,5vw,90px)]">
        <span className="text-[11px] uppercase" style={{ ...P, letterSpacing: '.34em', color: 'rgba(237,234,228,.45)' }}>
          Marcas que han confiado en nosotros
        </span>
      </div>
      <div className="flex w-max animate-[gecMarquee_38s_linear_infinite]">
        {row}
        <div aria-hidden="true" className="contents">
          {row}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── 07b Testimonios ─────────────────── */
export function Testimonios() {
  const secRef = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tween = gsap.from('[data-testimonio]', {
          y: 42,
          opacity: 0,
          duration: 0.75,
          ease: 'power3.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: secRef.current,
            start: 'top 72%',
            toggleActions: 'play none none reverse',
          },
        });
        return () => tween.scrollTrigger?.kill();
      });
      return () => mm.revert();
    },
    { scope: secRef },
  );

  return (
    <section
      ref={secRef}
      className="relative bg-[#060607] px-[clamp(24px,5vw,90px)] pt-[clamp(20px,3vw,50px)] pb-[clamp(70px,8vw,140px)]"
    >
      <div className="mx-auto flex max-w-[1560px] flex-col gap-[clamp(32px,4vw,64px)]">
        <div className="flex flex-col gap-4">
          <Eyebrow>Lo que dicen de trabajar con nosotros</Eyebrow>
          <h2
            className="m-0 max-w-[20ch] text-[clamp(26px,3vw,50px)] leading-[1.06] font-bold text-[#EDEAE4]"
            style={{ ...P, letterSpacing: '-.03em', textWrap: 'balance' }}
          >
            Marcas que crecieron desde adentro.
          </h2>
        </div>

        <div className="grid gap-[clamp(14px,1.6vw,24px)] [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
          {testimonios.map((t) => (
            <figure
              key={t.id}
              data-testimonio
              className="m-0 flex flex-col justify-between gap-7 rounded-[clamp(18px,1.8vw,28px)] border border-white/10 bg-white/[.03] p-[clamp(24px,2.4vw,38px)] transition-colors duration-500 hover:border-[rgba(245,179,1,.3)] hover:bg-[rgba(245,179,1,.04)]"
            >
              <span
                className="text-[42px] leading-none text-[rgba(245,179,1,.55)]"
                style={{ ...P, fontWeight: 800 }}
                aria-hidden="true"
              >
                “
              </span>
              <blockquote
                className="m-0 text-[15.5px] leading-[1.7] font-light"
                style={{ color: 'rgba(237,234,228,.78)' }}
              >
                {t.quote}
              </blockquote>
              <figcaption className="flex items-center gap-3.5 border-t border-white/[.08] pt-5">
                <span
                  className="grid h-10 w-10 flex-none place-items-center rounded-full text-[12px] font-bold text-[#0B0B0C]"
                  style={{ ...P, background: '#F5B301', letterSpacing: '.02em' }}
                >
                  {t.initials}
                </span>
                <span className="flex flex-col">
                  <span className="text-[14px] font-semibold text-white" style={P}>
                    {t.name}
                  </span>
                  <span className="text-[12.5px] font-light" style={{ color: 'rgba(237,234,228,.5)' }}>
                    {t.role}
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── 08 Familia Meraki ─────────────────── */
const FAMILIA_FRAMES = 110;
const FAMILIA_EAGER = 12;
const familiaFrame = (i) =>
  `/assets/sequences/scene_7/frame_${String(i).padStart(3, '0')}.webp`;

export function Familia() {
  const secRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const frameRef = useRef(0);
  const sizeRef = useRef({ width: 0, height: 0 });
  const veilRef = useRef(null);
  const barRef = useRef(null);
  const [ready, setReady] = useState(false);

  const draw = (index) => {
    const canvas = canvasRef.current;
    // Vecino cargado más cercano: la escena avanza aunque falten fotogramas.
    const img = nearestLoaded(imagesRef.current, index);
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = sizeRef.current;
    ctx.clearRect(0, 0, width, height);
    const scale = Math.max(width / img.width, height / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h);
  };

  const resize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    sizeRef.current = { width: rect.width, height: rect.height };
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(frameRef.current);
  };

  useEffect(() => {
    const images = new Array(FAMILIA_FRAMES);
    imagesRef.current = images;
    let cancelar = null;

    const arrancar = () => {
      if (cancelar) return;
      cancelar = loadSequence({
        total: FAMILIA_FRAMES,
        eager: FAMILIA_EAGER,
        src: familiaFrame,
        images,
        maxWidth: anchoDeDecodificado(),
        onReady: (ok) => {
          if (!ok) return;
          setReady(true);
          resize();
        },
        onFrame: () => draw(frameRef.current),
      });
    };

    // Esta escena está al final del sitio. Si empieza a cargar con el hero,
    // en un teléfono las dos secuencias compiten por la memoria y ninguna
    // termina de decodificar. Espera a estar a un par de pantallas.
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          arrancar();
          io.disconnect();
        }
      },
      { rootMargin: '200% 0px' },
    );
    if (secRef.current) io.observe(secRef.current);
    else arrancar();

    window.addEventListener('resize', resize);
    return () => {
      io.disconnect();
      cancelar?.();
      window.removeEventListener('resize', resize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useGSAP(
    () => {
      if (!ready) return undefined;
      const st = ScrollTrigger.create({
        trigger: secRef.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const p = self.progress;
          const idx = Math.min(
            FAMILIA_FRAMES - 1,
            Math.round(p * (FAMILIA_FRAMES - 1)),
          );
          frameRef.current = idx;
          draw(idx);
          if (veilRef.current) veilRef.current.style.opacity = String(0.9 - p * 0.55);
          if (barRef.current) barRef.current.style.width = `${(p * 100).toFixed(1)}%`;
        },
      });
      draw(0);
      return () => st.kill();
    },
    { dependencies: [ready], scope: secRef },
  );

  return (
    <section id="familia" ref={secRef} className="relative h-[400vh] bg-[#050506]">
      <div className="sticky top-0 flex h-[100dvh] flex-col overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        <div
          ref={veilRef}
          className="absolute inset-0"
          style={{
            opacity: 0.9,
            background:
              'radial-gradient(110% 85% at 50% 45%, rgba(5,5,6,.18) 0%, rgba(5,5,6,.62) 62%, rgba(5,5,6,.95) 100%)',
          }}
        />

        <div className="relative z-[2] flex min-h-0 flex-1 flex-col justify-start px-[clamp(24px,5vw,90px)] pt-[clamp(90px,12dvh,150px)]">
          <Eyebrow color="rgba(237,234,228,.55)">La familia Meraki</Eyebrow>
          <p
            className="mt-[clamp(10px,2dvh,22px)] mb-0 max-w-[24ch] text-[clamp(22px,2.6vw,44px)] leading-[1.08] font-bold text-white"
            style={{ ...P, letterSpacing: '-.03em', textWrap: 'balance' }}
          >
            Un ecosistema con rostro propio.
          </p>
        </div>

        <div className="relative z-[3] flex flex-none flex-wrap items-center justify-between gap-5 px-[clamp(24px,5vw,90px)] pb-[clamp(26px,4dvh,44px)]">
          <div className="flex max-w-[420px] min-w-[220px] flex-1 items-center gap-3.5">
            <span className="text-[11px]" style={{ ...P, letterSpacing: '.2em', color: 'rgba(237,234,228,.35)' }}>
              SCROLL
            </span>
            <span className="relative h-px flex-1 bg-white/15">
              <span ref={barRef} className="absolute inset-y-0 left-0 w-0 bg-[#F5B301]" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── 09 Contacto ─────────────────── */
// Mismo criterio que los pilares: en móvil el loop es 16:9 y `cover` en
// vertical recortaba justo por donde está Meraki, así que va en su propia
// franja arriba y el copy debajo. En desktop sigue a sangre detrás del texto.
const CONTACTO_MEDIA = {
  scene: 8,
  img: '/assets/pilares/contacto.webp',
  alt: 'Meraki saludando a cámara',
  focus: 88,
};

export function Contacto() {
  return (
    <section
      id="contacto"
      className="relative overflow-hidden bg-[#1B1C1E] lg:flex lg:min-h-[86vh] lg:items-center lg:px-[clamp(24px,5vw,90px)] lg:py-[clamp(70px,9vw,150px)]"
    >
      {/* Pared de piedra + halo ámbar detrás de Meraki */}
      <div className="relative h-[min(44vh,420px)] min-h-[300px] lg:absolute lg:inset-0 lg:h-auto lg:min-h-0">
        <LoopMedia pilar={CONTACTO_MEDIA} />
        {/* Funde el pie de la franja con el color de la sección */}
        <div
          className="pointer-events-none absolute inset-0 lg:hidden"
          style={{
            background:
              'linear-gradient(180deg, rgba(27,28,30,0) 0%, rgba(27,28,30,0) 50%, rgba(27,28,30,.82) 84%, #1B1C1E 100%)',
          }}
        />
      </div>
      {/* Velo para que el copy se lea sobre la pared */}
      <div
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{
          background:
            'linear-gradient(100deg, #141517 0%, rgba(20,21,23,.94) 28%, rgba(20,21,23,.6) 46%, rgba(20,21,23,0) 66%)',
        }}
      />

      <div className="relative z-[2] mx-auto grid w-full max-w-[1560px] items-center gap-[clamp(32px,5vw,80px)] px-[clamp(24px,5vw,90px)] pt-2 pb-[clamp(56px,9vw,150px)] lg:grid-cols-[1.05fr_.95fr] lg:px-0 lg:pt-0 lg:pb-0">
        <div className="flex flex-col gap-[clamp(22px,3vw,40px)]">
          <Eyebrow color="rgba(237,234,228,.5)">Grupo Espacio Creativo</Eyebrow>
          <h2
            className="m-0 max-w-[20ch] text-[clamp(32px,4.6vw,84px)] leading-[1.02] font-extrabold text-white"
            style={{ ...P, letterSpacing: '-.04em', textWrap: 'balance' }}
          >
            Producimos las mejores ideas para marcas que crecen{' '}
            <span className="text-[#F5B301]">desde adentro hacia afuera</span>.
          </h2>
          <div className="flex flex-wrap gap-3">
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-full bg-[#F5B301] px-8 py-4 text-[15px] font-semibold text-[#0B0B0C] transition-colors hover:bg-[#FFD24A]"
              style={P}
            >
              Conversemos con GEC
            </a>
            <a
              href="#ecosistema"
              className="rounded-full border border-white/20 px-8 py-4 text-[15px] font-medium text-[#EDEAE4] transition-colors hover:border-[#F5B301] hover:text-[#F5B301]"
              style={P}
            >
              Ver el ecosistema
            </a>
          </div>
        </div>

        {/* La columna derecha la ocupa el propio Meraki del video de fondo */}
        <div aria-hidden="true" className="hidden lg:block" />
      </div>
    </section>
  );
}

/* ─────────────────── Footer ─────────────────── */
export function Footer() {
  return (
    <footer id="blog" className="border-t border-white/[.07] bg-[#08080A] px-[clamp(24px,5vw,90px)] pt-[clamp(44px,5vw,80px)] pb-10">
      <div className="mx-auto grid max-w-[1560px] gap-[clamp(28px,4vw,70px)] md:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))]">
        <div className="flex flex-col gap-6">
          {/* self-start: en flex-col los hijos se estiran y deformaban el logo */}
          <img
            src="/logos/gec-invertido.png"
            alt="Grupo Espacio Creativo"
            className="block h-[clamp(56px,6vw,82px)] w-auto self-start"
          />
          <p
            className="m-0 max-w-[34ch] text-[13.5px] leading-[1.7] font-light"
            style={{ color: 'rgba(237,234,228,.48)' }}
          >
            Agencia de Crecimiento Creativo Empresarial.
          </p>

          <address className="flex flex-col gap-1.5 not-italic">
            <span className="text-[13.5px] leading-[1.7]" style={{ color: 'rgba(237,234,228,.62)' }}>
              {contacto.direccion}
            </span>
            <span className="text-[13.5px] leading-[1.7]" style={{ color: 'rgba(237,234,228,.62)' }}>
              {contacto.detalle}
            </span>
            <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13.5px]">
              <a
                href={contacto.telefonoHref}
                className="transition-colors hover:text-[#F5B301]"
                style={{ color: 'rgba(237,234,228,.62)' }}
              >
                {contacto.telefono}
              </a>
              <span style={{ color: 'rgba(237,234,228,.28)' }}>/</span>
              <a
                href={contacto.celularHref}
                className="transition-colors hover:text-[#F5B301]"
                style={{ color: 'rgba(237,234,228,.62)' }}
              >
                {contacto.celular}
              </a>
            </span>
          </address>

          <div className="flex flex-wrap items-center gap-2.5">
            {redes.map((r) => (
              <a
                key={r.id}
                href={r.href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={r.label}
                title={r.label}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/12 bg-white/[.04] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#F5B301] hover:bg-[rgba(245,179,1,.12)] hover:text-[#F5B301]"
                style={{ color: 'rgba(237,234,228,.7)' }}
              >
                {icons[r.id]}
              </a>
            ))}
          </div>
        </div>
        {footerCols.map((col) => (
          <div key={col.t} className="flex flex-col gap-3">
            <span className="text-[11px] uppercase" style={{ ...P, letterSpacing: '.28em', color: 'rgba(237,234,228,.38)' }}>
              {col.t}
            </span>
            {col.links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                {...(l.externo ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                className="text-sm transition-colors hover:text-[#F5B301]"
                style={{ color: 'rgba(237,234,228,.66)' }}
              >
                {l.label}
              </a>
            ))}
          </div>
        ))}
      </div>
      <div className="mx-auto mt-[52px] flex max-w-[1560px] flex-wrap justify-between gap-[18px] border-t border-white/[.06] pt-[22px]">
        <span className="text-[12px]" style={{ color: 'rgba(237,234,228,.32)' }}>
          © 2026 GEC — Grupo Espacio Creativo
        </span>
        <span className="text-[12px]" style={{ color: 'rgba(237,234,228,.32)' }}>
          Producimos las mejores ideas.
        </span>
      </div>
    </footer>
  );
}
