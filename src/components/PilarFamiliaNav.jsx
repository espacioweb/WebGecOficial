import { useState } from 'react';
import { Link } from 'react-router-dom';
import { pilares } from '../data/site';
import { C } from '../data/gecIA';
import { P } from '../utils/textStyles';

// Acento por pilar cuando está activo — el mismo color que cada página usa
// en su eyebrow/CTA (ver hero.color en cada *Page.jsx). Studio y Soluciona
// comparten azul porque ambos ya nacieron con fondo azul en `site.js`; el
// gradiente propio de cada página los distingue igual.
const ACENTO_ACTIVO = {
  'p-marketing': C.amarillo,
  'p-studio': C.azul,
  'p-educa': C.turquesa,
  'p-soluciona': C.azul,
  'p-experience': C.morado,
};

// Avatar con fundido de entrada: sin esto el `<img>` aparece en blanco
// mientras carga (confirmado con naturalWidth 0 en la primera pintura, en
// desktop y mobile) — es el último bloque antes del footer, así que un
// parpadeo ahí se lee como un bug, no como estilo. El fondo tintado cubre el
// hueco mientras tanto, en vez de dejarlo negro.
function Avatar({ p, active, acento }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="h-16 w-16 overflow-hidden rounded-full" style={{ background: `${acento}1f` }}>
      <img
        src={p.img}
        alt={p.name}
        className="h-full w-full object-cover transition-opacity duration-500"
        style={{
          opacity: loaded ? (active ? 1 : 0.75) : 0,
          objectPosition: `${p.focus ?? 50}% 50%`,
          boxShadow: active ? `0 0 0 3px ${acento}, 0 0 22px ${acento}80` : 'none',
        }}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

// Versión ligera y estática de la Familia Meraki para páginas de pilar: no
// repite la animación cinemática de 400vh del Home (sería pesado repetirla
// cinco veces), pero sí cumple lo que pide la guía — destacar el pilar
// actual y enlazar cada personaje a su página.
export default function PilarFamiliaNav({ current }) {
  return (
    <section className="border-t border-white/[.07] bg-[#0A0E13] px-[clamp(24px,5vw,90px)] py-[clamp(56px,7vw,96px)]">
      <div className="mx-auto max-w-[1220px]">
        <div
          className="mb-2.5 text-[11px] font-semibold uppercase"
          style={{ ...P, letterSpacing: '.18em', color: 'rgba(237,234,228,.45)' }}
        >
          La familia Meraki
        </div>
        <h2
          className="m-0 mb-10 max-w-[26ch] text-[clamp(24px,3vw,36px)] leading-[1.15] font-bold text-white"
          style={{ ...P, letterSpacing: '-.02em' }}
        >
          Una familia de soluciones para hacer crecer tu empresa.
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {pilares.map((p) => {
            const active = p.id === current;
            const acento = ACENTO_ACTIVO[p.id] ?? '#F5B301';
            return (
              // Hover: mismo patrón que el resto de cuadros (HOVER_CUADRO en
              // PilarPage) — sube, escala y se tiñe del color de ese pilar;
              // el avatar crece un poco más y el nombre toma el color.
              <Link
                key={p.id}
                to={p.ruta}
                className={`group flex flex-col items-center gap-3 rounded-2xl border px-3 py-6 text-center transition-[transform,border-color,background-color,box-shadow] duration-500 ease-[cubic-bezier(.2,.8,.2,1)] hover:-translate-y-1 hover:scale-[1.04] hover:border-(--c) hover:bg-[color-mix(in_srgb,var(--c)_12%,transparent)] hover:shadow-[0_24px_60px_-30px_var(--c)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100 ${
                  active
                    ? 'border-[color-mix(in_srgb,var(--c)_60%,transparent)] bg-[color-mix(in_srgb,var(--c)_8%,transparent)]'
                    : 'border-white/[.08] bg-transparent'
                }`}
                style={{ '--c': acento }}
              >
                <div className="transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-110 motion-reduce:group-hover:scale-100">
                  <Avatar p={p} active={active} acento={acento} />
                </div>
                <span
                  className={`text-[13.5px] font-semibold transition-colors duration-300 group-hover:text-(--c) ${active ? 'text-(--c)' : 'text-[#EDEAE4]'}`}
                  style={P}
                >
                  {p.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
