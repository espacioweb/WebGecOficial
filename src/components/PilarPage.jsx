import { cloneElement, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Image as ImageIcon } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../utils/gsapSetup';
import { P } from '../utils/textStyles';
import { track } from '../utils/analytics';
import { WHATSAPP } from '../data/site';
import { icons } from './SocialIcons';
import PilarFamiliaNav from './PilarFamiliaNav';

const isRich = (item) => typeof item === 'object' && item !== null;

// Personaje del pilar en el hero: tarjeta cuadrada con esquinas levemente
// biseladas (antes tenía una máscara radial que difuminaba los bordes del
// render hasta volverlo un blob — el mockup del usuario (Educa/Soluciona
// Landing v2, `image-slot shape="rounded"`) mostró que el patrón correcto
// es un recorte limpio, no un fundido). El halo de color detrás sigue
// siendo un círculo aparte, ya no necesita disimular un borde: solo da el
// resplandor ambiental. `video` es opcional — sin él queda solo la imagen
// fija (poster).
// `haloBold`: el halo por defecto es el mismo en los 5 pilares (sutil, solo
// para fundir el render contra el fondo). Un pase /impeccable bolder pidió
// amplificar esto SOLO en el hero de Educa — mismo color, mismo dispositivo,
// nada nuevo — así que queda detrás de un prop en vez de subir el valor por
// defecto y afectar a Marketing/Studio/Soluciona/Experience de paso.
// `halo`: el halo se pensó para fundir el render contra el fondo OSCURO de
// la página — reutilizado en la tarjeta dorada del Cierre se ve como una
// mancha turbia en vez de un resplandor, así que esa instancia lo apaga.
export function HeroCharacter({ img, video, focus = 50, color, alt, haloBold = false, halo = true }) {
  const wrapRef = useRef(null);
  const videoRef = useRef(null);
  const [painted, setPainted] = useState(false);

  // El Cierre reutiliza este mismo componente con video (ver más abajo) —
  // sin este observer, el video del Hero y el del Cierre decodificarían y
  // reproducirían a la vez aunque uno de los dos esté fuera de pantalla.
  // Mismo patrón que `LoopMedia` en Sections.jsx.
  useEffect(() => {
    const el = videoRef.current;
    const wrap = wrapRef.current;
    if (!el || !wrap || !video) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { rootMargin: '200px 0px', threshold: 0.05 },
    );
    io.observe(wrap);
    return () => io.disconnect();
  }, [video]);

  const posicion = { objectPosition: `${focus}% 50%` };

  return (
    <div ref={wrapRef} className="relative mx-auto aspect-[3/4] w-full max-w-[420px]">
      {halo && (
        <div
          className={
            haloBold
              ? 'pointer-events-none absolute -inset-8 -z-10 rounded-full blur-[110px]'
              : 'pointer-events-none absolute inset-0 -z-10 rounded-full blur-[70px]'
          }
          style={{ background: `radial-gradient(circle, ${color}${haloBold ? '66' : '3d'} 0%, transparent 70%)` }}
        />
      )}
      <div className="absolute inset-0 overflow-hidden rounded-[28px]">
        <img
          src={img}
          alt={alt}
          loading="eager"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
          style={{ ...posicion, opacity: video && painted ? 0 : 1 }}
        />
        {video && (
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload="auto"
            poster={img}
            onPlaying={() => setPainted(true)}
            className="absolute inset-0 h-full w-full object-cover"
            style={posicion}
          >
            <source src={video} type="video/mp4" />
          </video>
        )}
      </div>
    </div>
  );
}

// Tarjeta con ícono, microtexto y un slot marcado (borde punteado) para la
// foto/video que todavía no existe — Valor y Alcance la comparten. Los
// pilares que aún no tienen este nivel de detalle siguen pasando strings
// planos y caen en el render simple de cada sección.
export function SlotCard({ item }) {
  const Icon = item.icon;
  const SlotIcon = item.slotIcon ?? ImageIcon;
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/[.08] bg-[#10161D] p-6 sm:flex-row sm:items-stretch">
      <div className="flex min-w-0 flex-1 flex-col">
        {Icon && (
          <div
            className="mb-4 grid h-11 w-11 flex-none place-items-center rounded-xl"
            style={{ background: `${item.color}29`, color: item.color }}
          >
            <Icon size={20} strokeWidth={2} />
          </div>
        )}
        <div className="mb-1.5 text-[15px] font-bold text-white" style={P}>
          {item.titulo}
        </div>
        {/* `lead`: la frase de situación ("Cuando…" / "Para…") que trae el copy
            de octubre 2026 antes de la explicación — va en blanco para que se lea
            primero, el `texto` queda en gris debajo. */}
        {item.lead && (
          <p className="m-0 mb-1.5 text-[13.5px] leading-[1.55] font-semibold" style={{ ...P, color: 'rgba(242,239,233,.88)' }}>
            {item.lead}
          </p>
        )}
        {item.texto && (
          <p className="m-0 text-[13.5px] leading-[1.6]" style={{ ...P, color: 'rgba(242,239,233,.6)' }}>
            {item.texto}
          </p>
        )}
        {item.href && (
          <a
            href={item.href}
            {...(item.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
            onClick={() => item.href.includes('xpevent') && track('xpevent_clicked')}
            className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-semibold transition-colors hover:text-white"
            style={{ ...P, color: item.color }}
          >
            {item.linkLabel ?? 'Conocer más'} <span>→</span>
          </a>
        )}
      </div>
      {item.slot && (
        <div
          className="grid h-[110px] w-full flex-none place-items-center rounded-xl border border-dashed sm:h-auto sm:w-[104px] lg:w-[128px]"
          style={{
            borderColor: `${item.color}55`,
            background: `linear-gradient(160deg, ${item.color}14, transparent 75%)`,
          }}
        >
          <div className="flex flex-col items-center gap-2 px-2 text-center">
            <SlotIcon size={20} style={{ color: `${item.color}99` }} />
            <span className="text-[11.5px] leading-tight" style={{ ...P, color: 'rgba(242,239,233,.4)' }}>
              {item.slot}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// `uppercase = false` es para eyebrows que son oraciones largas, no tags
// cortos ("Educa", "Archivo") — el tracking de mayúsculas (.18em) vuelve
// ilegible un texto de 40-60 caracteres, así que esa variante usa tamaño
// normal sin transformar el caso.
export function Eyebrow({ children, color = 'rgba(237,234,228,.55)', uppercase = true }) {
  if (!uppercase) {
    return (
      <div className="text-[13px] font-semibold" style={{ ...P, color }}>
        {children}
      </div>
    );
  }
  return (
    <div className="text-[11px] font-semibold uppercase" style={{ ...P, letterSpacing: '.18em', color }}>
      {children}
    </div>
  );
}

// Las frases que el PDF de octubre 2026 marca en negrita dentro de un
// párrafo — se resaltan subiendo el contraste, no solo el peso, porque el
// texto que las rodea va en gris.
export function B({ children }) {
  return (
    <strong className="font-semibold" style={{ color: 'rgba(242,239,233,.92)' }}>
      {children}
    </strong>
  );
}

// Párrafo de entrada bajo un H2 de sección — el copy de octubre 2026 abre
// casi cada bloque con una frase que plantea el problema antes de las
// tarjetas. Más presente que la `nota` (que es aclaración al margen).
export function Intro({ children }) {
  return (
    <p
      data-reveal
      className="m-0 mb-10 max-w-[64ch] text-[clamp(15px,1.3vw,17px)] leading-[1.65]"
      style={{ ...P, color: 'rgba(242,239,233,.68)' }}
    >
      {children}
    </p>
  );
}

export function CtaPrimary({ to, children, color = '#F5B301' }) {
  const cls = 'inline-flex items-center gap-2.5 rounded-full px-7 py-4 text-[15px] font-bold text-[#10131A] transition-transform duration-200 hover:-translate-y-0.5';
  const style = { ...P, background: color };
  // Un ancla dentro de la misma página (ej. "#tipos") no debe pasar por el
  // router — Link la trataría como una ruta nueva.
  if (to?.startsWith('#')) {
    return (
      <a href={to} className={cls} style={style}>
        {children} <span className="text-[17px]">→</span>
      </a>
    );
  }
  return (
    <Link to={to} className={cls} style={style}>
      {children} <span className="text-[17px]">→</span>
    </Link>
  );
}

export function CtaSecondary({ href, children, onClick }) {
  const Tag = onClick ? 'button' : 'a';
  return (
    <Tag
      href={href}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
      className="inline-flex items-center gap-2.5 rounded-full border border-white/25 px-6 py-[15px] text-[15px] font-semibold text-[#F2EFE9] transition-colors hover:bg-white/[.08]"
      style={P}
    >
      {children}
    </Tag>
  );
}

// Variantes oscuras de los CTA compartidos — el Cierre es una tarjeta
// dorada sólida, así que necesita texto/relleno oscuro en vez del dorado
// sobre fondo oscuro que usa el resto de la página.
function CierrePrimary({ to, children }) {
  const cls =
    'inline-flex items-center gap-2.5 rounded-full bg-[#0A1216] px-7 py-4 text-[15px] font-bold text-[#F5B301] transition-transform duration-200 hover:-translate-y-0.5';
  if (to?.startsWith('#')) {
    return (
      <a href={to} className={cls} style={P}>
        {children} <span className="text-[17px]">→</span>
      </a>
    );
  }
  return (
    <Link to={to} className={cls} style={P}>
      {children} <span className="text-[17px]">→</span>
    </Link>
  );
}

// El CTA secundario del Cierre en los 5 pilares apunta a WhatsApp — el
// usuario pidió dejarlo explícito con el ícono de la marca (antes era solo
// texto, "Conversar con GEC" no decía por qué canal).
function CierreSecondary({ href, children }) {
  return (
    <a
      href={href}
      {...(href === WHATSAPP ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
      className="inline-flex items-center gap-2.5 rounded-full border-[1.5px] border-[#0A1216] px-6 py-[15px] text-[15px] font-semibold text-[#0A1216] transition-colors hover:bg-[#0A1216]/10"
      style={P}
    >
      {href === WHATSAPP && <span className="h-[18px] w-[18px] flex-none">{icons.whatsapp}</span>}
      {children}
    </a>
  );
}

// Patrón compartido de las páginas de pilar: Hero · Valor · Alcance ·
// bloques opcionales del pilar · Cierre · Familia Meraki (el Footer ya vive
// en App, global a todo el sitio).
export default function PilarPage({ pilarId, hero, valor, alcance, extra, cierre }) {
  const mainRef = useRef(null);

  // Entradas animadas al hacer scroll — el usuario reportó que las páginas
  // de pilar se sentían "cuadradas"/estáticas comparadas con el Home (que
  // sí anima Pilares/Inside Your Brand). Mismo patrón que `data-pilar-copy`
  // en Sections.jsx: cada contenedor marcado `data-reveal` anima la entrada
  // de sus hijos directos con un stagger corto. Selector genérico, así que
  // cubre también los bloques bespoke que cada página arma en `extra`
  // (EducaPage.jsx, SolucionaPage.jsx) — son descendientes reales de este
  // `<main>` en tiempo de ejecución, aunque estén definidos en otro archivo.
  // `toggleActions: '...reverse'` deshace la entrada si se sube de nuevo,
  // para no dejar texto invisible si el usuario retrocede rápido.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tweens = gsap.utils.toArray('[data-reveal]').map((el) =>
          // Si el contenedor tiene hijos (una tarjeta, un grupo de líneas
          // del hero) anima cada uno con stagger; un `<h2>` con solo texto
          // no tiene hijos-elemento (el texto no cuenta), así que ahí anima
          // el propio contenedor entero como una sola unidad.
          gsap.from(el.children.length ? el.children : el, {
            y: 26,
            opacity: 0,
            duration: 0.7,
            ease: 'power3.out',
            stagger: 0.08,
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }),
        );
        return () => tweens.forEach((t) => t.scrollTrigger?.kill());
      });
      return () => mm.revert();
    },
    { scope: mainRef, dependencies: [pilarId] },
  );

  return (
    <main ref={mainRef} className="bg-[#0A0E13]" style={{ paddingTop: '110px' }}>
      {/* Hero */}
      <section className="px-[clamp(20px,4vw,40px)] pt-[clamp(20px,4vw,40px)] pb-[clamp(56px,7vw,96px)]">
        <div
          className={
            hero.media
              ? 'mx-auto grid max-w-[1240px] items-center gap-x-14 gap-y-12 lg:grid-cols-[1.05fr_.95fr]'
              : 'mx-auto max-w-[900px] text-center'
          }
        >
          <div data-reveal>
            <Eyebrow color={hero.color}>{hero.eyebrow}</Eyebrow>
            <h1
              className="m-0 mt-4 mb-6 leading-[1.08] font-extrabold text-white"
              style={{ ...P, letterSpacing: '-.03em', fontSize: hero.h1Size ?? 'clamp(34px,5.4vw,60px)' }}
            >
              {hero.h1}
            </h1>
            {/* `descriptor` es opcional: Educa (oct. 2026) pone la frase fuerte
                directamente como H1 y solo lleva el párrafo de `explicacion`. */}
            {hero.descriptor && (
              <p
                className={`m-0 text-[clamp(17px,2vw,21px)] leading-[1.5] font-semibold ${hero.explicacion ? 'mb-3' : 'mb-10'}`}
                style={{ ...P, color: hero.color }}
              >
                {hero.descriptor}
              </p>
            )}
            {hero.explicacion && (
              <p
                className="m-0 mb-10 text-[15.5px] leading-[1.75]"
                style={{ ...P, color: 'rgba(242,239,233,.65)' }}
              >
                {hero.explicacion}
              </p>
            )}
            <div className={`flex flex-wrap items-center gap-3.5 ${hero.media ? 'justify-start' : 'justify-center'}`}>
              <CtaPrimary to={hero.ctaPrimaryTo} color={hero.ctaPrimaryColor ?? hero.color}>
                {hero.ctaPrimary}
              </CtaPrimary>
              {hero.ctaSecondaryHref && (
                <CtaSecondary href={hero.ctaSecondaryHref}>{hero.ctaSecondary}</CtaSecondary>
              )}
            </div>
          </div>
          {hero.media}
        </div>
      </section>

      {/* Valor — opcional. Lista numerada con divisores, sin ícono ni slot de
          media vacío: patrón adoptado del mockup "Educa/Soluciona Landing
          v2" del usuario (antes cada pilar mostraba tarjetas con una caja
          punteada "captura/video" siempre vacía — se veía genérico y
          "cuadrado"). El número usa el dorado del sitio (igual que en Educa,
          que fue donde se probó primero este patrón), no el color propio del
          pilar — mantiene un solo acento de "atención" consistente entre
          páginas. `texto` es opcional: los pilares sin descripción todavía
          para cada atributo simplemente muestran título + número. */}
      {valor && (
        <section className="border-t border-white/[.07] px-[clamp(20px,4vw,40px)] py-[clamp(56px,7vw,96px)]">
          <div className="mx-auto max-w-[1100px]">
            <h2
              data-reveal
              className={`m-0 max-w-[26ch] text-[clamp(24px,3vw,36px)] leading-[1.15] font-bold text-white ${valor.intro ? 'mb-5' : 'mb-10'}`}
              style={{ ...P, letterSpacing: '-.02em' }}
            >
              {valor.h2}
            </h2>
            {valor.intro && <Intro>{valor.intro}</Intro>}
            <div
              data-reveal
              className={`grid gap-px overflow-hidden rounded-2xl border border-white/[.08] bg-white/[.08] sm:grid-cols-2 ${
                // Columnas = cantidad real de items (topado a 5) — un
                // `lg:grid-cols-4` fijo dejaba una celda vacía cuando el
                // pilar no tenía un múltiplo exacto de 4 (Marketing: 5 caía
                // en una segunda fila con 3 celdas vacías; Soluciona/Studio/
                // Experience: 3 dejaban una vacía en la primera).
                { 1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 5: 'lg:grid-cols-5' }[
                  valor.items.length
                ] ?? 'lg:grid-cols-4'
              }`}
            >
              {valor.items.map((v, i) => {
                const item = isRich(v) ? v : { titulo: v };
                return (
                  <div key={item.titulo} className="flex flex-col gap-2.5 bg-[#0A0E13] p-7">
                    <span className="text-[13px] font-bold" style={{ ...P, color: '#F5B301' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="m-0 text-[16.5px] font-bold text-white" style={P}>
                      {item.titulo}
                    </h3>
                    {item.texto && (
                      <p className="m-0 text-[13.5px] leading-[1.6]" style={{ ...P, color: 'rgba(242,239,233,.6)' }}>
                        {item.texto}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Alcance / soluciones — opcional, mismo criterio que Valor. Cuando se
          omite, la página debe declarar su propio `id="areas"` en el bloque
          que lo reemplaza: el CTA secundario del hero apunta ahí. */}
      {alcance && (
        <section id="areas" className="border-t border-white/[.07] px-[clamp(20px,4vw,40px)] py-[clamp(56px,7vw,96px)]">
          <div className="mx-auto max-w-[1100px]">
            {alcance.eyebrow && (
              <div className="mb-4">
                <Eyebrow color={hero.color}>{alcance.eyebrow}</Eyebrow>
              </div>
            )}
            <h2
              data-reveal
              className={`m-0 max-w-[28ch] text-[clamp(24px,3vw,36px)] leading-[1.15] font-bold text-white ${alcance.intro ? 'mb-5' : 'mb-10'}`}
              style={{ ...P, letterSpacing: '-.02em' }}
            >
              {alcance.h2}
            </h2>
            {alcance.intro && <Intro>{alcance.intro}</Intro>}
            {alcance.nota && (
              <p className="m-0 mb-8 max-w-[64ch] text-[13.5px] leading-[1.7]" style={{ ...P, color: 'rgba(242,239,233,.5)' }}>
                {alcance.nota}
              </p>
            )}
            <div data-reveal className="grid gap-4 sm:grid-cols-2">
              {alcance.items.map((a) =>
                isRich(a) && a.icon ? (
                  <SlotCard key={a.titulo} item={a} />
                ) : (
                  <div key={a.titulo} className="rounded-2xl border border-white/[.08] bg-[#10161D] p-6">
                    <div className="mb-1.5 text-[15px] font-bold text-white" style={P}>
                      {a.titulo}
                    </div>
                    {a.texto && (
                      <p className="m-0 text-[13.5px] leading-[1.6]" style={{ ...P, color: 'rgba(242,239,233,.6)' }}>
                        {a.texto}
                      </p>
                    )}
                    {a.href && (
                      <a
                        href={a.href}
                        {...(a.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                        className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-semibold transition-colors hover:text-white"
                        style={{ ...P, color: a.color ?? hero?.color ?? '#F5B301' }}
                      >
                        {a.linkLabel ?? 'Conocer más'} <span>→</span>
                      </a>
                    )}
                  </div>
                ),
              )}
            </div>
          </div>
        </section>
      )}

      {extra}

      {/* Cierre — tarjeta dorada sólida, mismo patrón repetido en dos
          mockups del usuario (Educa Landing v2 y un cierre de Soluciona).
          Reutiliza el personaje del hero (mismo `hero.media`) en vez de una
          foto nueva: nada de contenido inventado. Con video (no una imagen
          fija) a pedido del usuario — el IntersectionObserver de
          `HeroCharacter` pausa el que quede fuera de pantalla, así no
          decodifican los dos videos (Hero + Cierre) a la vez. */}
      <section className="px-[clamp(20px,4vw,40px)] py-[clamp(48px,6vw,90px)]">
        <div
          className="mx-auto grid max-w-[1220px] items-center gap-10 overflow-hidden rounded-[32px] p-[clamp(28px,5vw,64px)] lg:grid-cols-2"
          style={{ background: '#F5B301', color: '#0A1216' }}
        >
          <div data-reveal className="flex flex-col gap-6">
            <h2
              className="m-0 text-[clamp(30px,4.2vw,52px)] leading-[1.05] font-extrabold"
              style={{ ...P, letterSpacing: '-.03em' }}
            >
              {cierre.h2}
            </h2>
            {cierre.texto && (
              <p className="m-0 max-w-[48ch] text-[15px] leading-[1.65]" style={{ ...P, color: 'rgba(10,18,22,.75)' }}>
                {cierre.texto}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3.5">
              <CierrePrimary to={cierre.ctaPrimaryTo}>{cierre.ctaPrimary}</CierrePrimary>
              {cierre.ctaSecondaryHref && (
                <CierreSecondary href={cierre.ctaSecondaryHref}>{cierre.ctaSecondary}</CierreSecondary>
              )}
            </div>
          </div>
          {hero.media && (
            <div className="mx-auto w-full max-w-[340px] lg:mx-0 lg:ml-auto">
              {cloneElement(hero.media, { halo: false })}
            </div>
          )}
        </div>
      </section>

      <PilarFamiliaNav current={pilarId} />
    </main>
  );
}
