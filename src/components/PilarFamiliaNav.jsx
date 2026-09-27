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
              <Link
                key={p.id}
                to={p.ruta}
                className="group flex flex-col items-center gap-3 rounded-2xl border px-3 py-6 text-center transition-colors"
                style={{
                  borderColor: active ? `${acento}99` : 'rgba(255,255,255,.08)',
                  background: active ? `${acento}14` : 'transparent',
                }}
              >
                <img
                  src={p.img}
                  alt={p.name}
                  className="h-16 w-16 rounded-full object-cover"
                  style={{
                    opacity: active ? 1 : 0.75,
                    objectPosition: `${p.focus ?? 50}% 50%`,
                    boxShadow: active ? `0 0 0 3px ${acento}, 0 0 22px ${acento}80` : 'none',
                  }}
                  loading="lazy"
                />
                <span className="text-[13.5px] font-semibold" style={{ ...P, color: active ? acento : '#EDEAE4' }}>
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
