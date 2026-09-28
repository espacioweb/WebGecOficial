import { cloneElement, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Image as ImageIcon } from 'lucide-react';
import { P } from '../utils/textStyles';
import { track } from '../utils/analytics';
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

function CierreSecondary({ href, children }) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2.5 rounded-full border-[1.5px] border-[#0A1216] px-6 py-[15px] text-[15px] font-semibold text-[#0A1216] transition-colors hover:bg-[#0A1216]/10"
      style={P}
    >
      {children}
    </a>
  );
}

// Patrón compartido de las páginas de pilar: Hero · Valor · Alcance ·
// bloques opcionales del pilar · Cierre · Familia Meraki (el Footer ya vive
// en App, global a todo el sitio).
export default function PilarPage({ pilarId, hero, valor, alcance, extra, cierre }) {
  return (
    <main className="bg-[#0A0E13]" style={{ paddingTop: '110px' }}>
      {/* Hero */}
      <section className="px-[clamp(20px,4vw,40px)] pt-[clamp(20px,4vw,40px)] pb-[clamp(56px,7vw,96px)]">
        <div
          className={
            hero.media
              ? 'mx-auto grid max-w-[1240px] items-center gap-x-14 gap-y-12 lg:grid-cols-[1.05fr_.95fr]'
              : 'mx-auto max-w-[900px] text-center'
          }
        >
          <div>
            <Eyebrow color={hero.color}>{hero.eyebrow}</Eyebrow>
            <h1
              className="m-0 mt-4 mb-6 leading-[1.08] font-extrabold text-white"
              style={{ ...P, letterSpacing: '-.03em', fontSize: hero.h1Size ?? 'clamp(34px,5.4vw,60px)' }}
            >
              {hero.h1}
            </h1>
            <p
              className={`m-0 text-[clamp(17px,2vw,21px)] leading-[1.5] font-semibold ${hero.explicacion ? 'mb-3' : 'mb-10'}`}
              style={{ ...P, color: hero.color }}
            >
              {hero.descriptor}
            </p>
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

      {/* Valor — opcional: Educa reemplaza esta sección genérica por una
          lista numerada propia (ver EducaPage.jsx), pasada dentro de `extra`. */}
      {valor && (
        <section className="border-t border-white/[.07] px-[clamp(20px,4vw,40px)] py-[clamp(56px,7vw,96px)]">
          <div className="mx-auto max-w-[1100px]">
            <h2
              className="m-0 mb-10 max-w-[26ch] text-[clamp(24px,3vw,36px)] leading-[1.15] font-bold text-white"
              style={{ ...P, letterSpacing: '-.02em' }}
            >
              {valor.h2}
            </h2>
            <div className={`grid gap-4 ${valor.items.some(isRich) ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
              {valor.items.map((v) =>
                isRich(v) ? (
                  <SlotCard key={v.titulo} item={v} />
                ) : (
                  <div
                    key={v}
                    className="rounded-2xl border border-white/[.08] bg-[#10161D] p-6 text-[14.5px] leading-[1.5] font-medium text-[#EDEAE4]"
                    style={P}
                  >
                    {v}
                  </div>
                ),
              )}
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
            <h2
              className="m-0 mb-10 max-w-[28ch] text-[clamp(24px,3vw,36px)] leading-[1.15] font-bold text-white"
              style={{ ...P, letterSpacing: '-.02em' }}
            >
              {alcance.h2}
            </h2>
            {alcance.nota && (
              <p className="m-0 mb-8 max-w-[64ch] text-[13.5px] leading-[1.7]" style={{ ...P, color: 'rgba(242,239,233,.5)' }}>
                {alcance.nota}
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
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
          <div className="flex flex-col gap-6">
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
