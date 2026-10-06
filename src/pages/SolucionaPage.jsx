import { Image as ImageIcon } from 'lucide-react';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { WHATSAPP } from '../data/site';
import { C } from '../data/gecIA';
import { P } from '../utils/textStyles';
import { track } from '../utils/analytics';
import PilarPage, { B, Eyebrow, HeroCharacter, Intro } from '../components/PilarPage';

const BRIEF_SOLUCIONA = '/cuentanos-tu-reto/?pilar=soluciona';

// SO-B · Tres formas de construir la solución, en orden de menor a mayor
// esfuerzo — el nivel + los 3 puntos comunican la escala, y "Conviene
// cuando" ayuda a elegir sin tener que entender de tecnología primero.
// Copy "CAMBIOS WEBSITE GEC · octubre 2026" (lámina 23), literal: el segundo
// nivel pasa de "ADOPTAR" a "ADAPTAR" porque así lo trae el PDF.
const formas = [
  {
    nivel: 'CONFIGURAR',
    activos: 1,
    t: 'Aprovechar mejor lo que ya tienes',
    d: 'Integramos, conectamos y configuramos plataformas existentes para que respondan mejor a tu operación.',
    cuando: 'ya tienes las herramientas, pero están subutilizadas, desconectadas o requieren mejor configuración.',
  },
  {
    nivel: 'ADAPTAR',
    activos: 2,
    t: 'Implementar una solución existente',
    d: 'Adaptamos productos GEC o soluciones disponibles al proceso de tu empresa, evitando desarrollar desde cero cuando no es necesario.',
    cuando: 'tu necesidad puede resolverse con una solución existente que requiere ajustes o personalización.',
  },
  {
    nivel: 'DESARROLLAR',
    activos: 3,
    t: 'Crear una solución a la medida',
    d: 'Diseñamos y desarrollamos un sistema específico cuando las herramientas existentes no responden suficientemente a la necesidad.',
    cuando: 'el proceso es particular, requiere funcionalidades propias o necesita una solución diseñada alrededor de la operación.',
  },
];

function BloqueFormas() {
  return (
    <section id="formas" className="border-t border-white/[.07] px-[clamp(20px,4vw,40px)] py-[clamp(56px,7vw,96px)]">
      <div className="mx-auto max-w-[1100px]">
        <div data-reveal className="mb-5 flex max-w-[62ch] flex-col gap-4">
          <Eyebrow color={C.azul}>Cómo trabajamos</Eyebrow>
          <h2
            className="m-0 text-[clamp(24px,3vw,36px)] leading-[1.15] font-bold text-white"
            style={{ ...P, letterSpacing: '-.02em' }}
          >
            Primero aprovechamos lo que existe. Desarrollamos solo cuando hace falta.
          </h2>
        </div>
        <Intro>
          Partimos de la necesidad y elegimos la ruta más conveniente según el proceso, las herramientas disponibles y
          lo que realmente necesita la empresa.
        </Intro>
        <div data-reveal className="grid gap-4 md:grid-cols-3">
          {formas.map((f, i) => (
            <div key={f.t} className="flex flex-col gap-5 rounded-2xl border border-white/[.08] bg-[#10161D] p-7">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold" style={{ ...P, letterSpacing: '.12em', color: C.azul }}>
                  {String(i + 1).padStart(2, '0')} · {f.nivel}
                </span>
                <div className="flex gap-1">
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      className="h-[5px] w-[16px] rounded-full"
                      style={{ background: d < f.activos ? C.azul : 'rgba(255,255,255,.14)' }}
                    />
                  ))}
                </div>
              </div>
              <h3 className="m-0 text-[19px] leading-[1.2] font-bold text-white" style={{ ...P, letterSpacing: '-.01em' }}>
                {f.t}
              </h3>
              <p className="m-0 flex-1 text-[13.5px] leading-[1.6]" style={{ ...P, color: 'rgba(242,239,233,.6)' }}>
                {f.d}
              </p>
              <p
                className="m-0 border-t border-white/[.08] pt-4 text-[12.5px] leading-[1.55]"
                style={{ ...P, color: 'rgba(242,239,233,.5)' }}
              >
                <B>Conviene cuando:</B> {f.cuando}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// SO-04 · Productos GEC (lámina 24): reemplaza los 4 productos anteriores
// (Orienta, Agencia, Gestor Operativo, Bolsillo) por los 3 del copy de
// octubre 2026 — decisión confirmada con el usuario. El Sistema de Gestión
// Creativa reusa la captura real de "Contenidos GEC" (es ese mismo sistema);
// XP Event y VecinoHub quedan con el slot honesto hasta tener capturas. Las
// webp de Orienta/Gestor/Bolsillo siguen en /assets/pilares/productos/ sin
// usarse, por si vuelven.
const productos = [
  {
    titulo: 'Sistema de Gestión Creativa de Marketing y Producción Audiovisual',
    texto: 'Organiza campañas, contenidos, producción, responsables y seguimiento en un mismo flujo de trabajo.',
    img: '/assets/pilares/productos/agencia.webp',
  },
  {
    titulo: 'XP Event',
    texto: 'Organiza el ciclo del evento desde el registro y check-in hasta la comunicación y la información posterior.',
    href: 'https://xpevent.app',
  },
  {
    titulo: 'VecinoHub',
    texto: 'Centraliza seguridad, comunicación, finanzas y decisiones para simplificar la gestión de comunidades residenciales.',
  },
];

function ProductoCard({ p, i }) {
  const contenido = (
    <>
      {p.img ? (
        <img
          src={p.img}
          alt={`Captura de la interfaz de ${p.titulo}`}
          loading="lazy"
          decoding="async"
          className="aspect-video w-full border-b border-white/[.08] object-cover"
        />
      ) : (
        <div
          className="grid aspect-video place-items-center border-b border-dashed"
          style={{ borderColor: `${C.azul}55`, background: `linear-gradient(160deg, ${C.azul}14, transparent 75%)` }}
        >
          <div className="flex flex-col items-center gap-2 px-4 text-center">
            <ImageIcon size={22} style={{ color: `${C.azul}99` }} />
            <span className="text-[11.5px] leading-tight" style={{ ...P, color: 'rgba(242,239,233,.4)' }}>
              captura de {p.titulo}
            </span>
          </div>
        </div>
      )}
      <div className="flex flex-1 items-start gap-4 p-6">
        <div className="flex-1">
          <span className="mb-1.5 block text-[12px] font-bold" style={{ ...P, color: '#F5B301' }}>
            {String(i + 1).padStart(2, '0')}
          </span>
          <h3 className="m-0 mb-1.5 text-[18px] leading-[1.25] font-bold text-white" style={{ ...P, letterSpacing: '-.01em' }}>
            {p.titulo}
          </h3>
          <p className="m-0 text-[13.5px] leading-[1.55]" style={{ ...P, color: 'rgba(242,239,233,.6)' }}>
            {p.texto}
          </p>
        </div>
        {p.href && (
          <span className="mt-1 flex-none text-[18px]" style={{ color: '#F5B301' }}>
            →
          </span>
        )}
      </div>
    </>
  );
  const cls = 'flex flex-col overflow-hidden rounded-2xl border border-white/[.08] bg-[#10161D]';
  // Solo la tarjeta con destino real es link — una flecha sin a dónde ir
  // promete algo que no existe.
  if (p.href) {
    return (
      <a
        href={p.href}
        target="_blank"
        rel="noreferrer noopener"
        onClick={() => p.href.includes('xpevent') && track('xpevent_clicked')}
        className={`${cls} transition-colors hover:border-white/20`}
      >
        {contenido}
      </a>
    );
  }
  return <div className={cls}>{contenido}</div>;
}

function BloqueProductosGEC() {
  return (
    <section id="productos" className="border-t border-white/[.07] bg-[#0A0E13]/60 px-[clamp(20px,4vw,40px)] py-[clamp(56px,7vw,96px)]">
      <div className="mx-auto max-w-[1100px]">
        <div data-reveal className="mb-10 flex max-w-[62ch] flex-col gap-4">
          <Eyebrow color={C.azul}>Productos GEC</Eyebrow>
          <h2
            className="m-0 text-[clamp(24px,3vw,36px)] leading-[1.15] font-bold text-white"
            style={{ ...P, letterSpacing: '-.02em' }}
          >
            Soluciones desarrolladas para necesidades concretas de las empresas.
          </h2>
        </div>
        <div data-reveal className="grid gap-5 md:grid-cols-3">
          {productos.map((p, i) => (
            <ProductoCard key={p.titulo} p={p} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function SolucionaPage() {
  useDocumentMeta({
    title: 'Soluciona — Plataformas y sistemas a la medida | Grupo Espacio Creativo',
    description:
      'Convertimos necesidades operativas en herramientas digitales que ordenan procesos, conectan información y facilitan decisiones.',
    path: '/soluciona/',
  });

  return (
    <PilarPage
      pilarId="p-soluciona"
      hero={{
        eyebrow: 'Soluciona · Plataformas y sistemas',
        color: C.azul,
        h1: (
          <>
            Herramientas digitales que <span style={{ color: C.azul }}>ordenan tu operación</span>
          </>
        ),
        // Copy "CAMBIOS WEBSITE GEC · octubre 2026" (lámina 21) — literal.
        descriptor: 'La tecnología debe adaptarse a tu operación. No al revés.',
        explicacion: (
          <>
            <B>
              A veces el problema no es que falten herramientas, sino que las que existen no responden a la forma en
              que trabaja la empresa.
            </B>{' '}
            En GEC partimos del proceso real para definir qué conviene:{' '}
            <B>
              configurar mejor una plataforma existente, automatizar parte del flujo o desarrollar una solución a la
              medida.
            </B>
          </>
        ),
        ctaPrimary: 'Optimiza tus procesos',
        ctaPrimaryTo: BRIEF_SOLUCIONA,
        ctaSecondary: 'Ver productos GEC',
        ctaSecondaryHref: '#productos',
        media: (
          <HeroCharacter img="/assets/pilares/soluciona.webp" video="/assets/videos/scene_5.mp4" focus={68} color={C.azul} alt="Meraki Soluciona" />
        ),
      }}
      // Lámina 22.
      valor={{
        h2: 'Una buena solución no empieza con software. Empieza entendiendo el problema.',
        items: [
          {
            titulo: 'Primero entendemos el proceso',
            texto: 'Revisamos dónde se pierde tiempo, información o seguimiento antes de proponer una herramienta.',
          },
          {
            titulo: 'Pensamos en quienes la van a usar',
            texto: 'Simplificamos pasos y organizamos la información para que la solución sea práctica y fácil de incorporar al trabajo.',
          },
          {
            titulo: 'Cuidamos que funcione en el tiempo',
            texto: 'Consideramos costos, crecimiento, mantenimiento y capacidad de gestión para que la solución siga siendo útil a medida que la empresa avanza.',
          },
        ],
      }}
      extra={
        <>
          <BloqueFormas />
          <BloqueProductosGEC />
        </>
      }
      cierre={{
        // Lámina 25.
        h2: 'Si un proceso te quita tiempo todos los días, probablemente ya necesita una mejor solución.',
        texto:
          'Seguimientos manuales, información dispersa, tareas repetidas o herramientas que no terminan de funcionar como necesitas. Cuéntanos dónde se complica la operación y buscaremos la forma más práctica de resolverlo.',
        ctaPrimary: 'Cuéntanos qué quieres resolver',
        ctaPrimaryTo: BRIEF_SOLUCIONA,
        ctaSecondary: 'WhatsApp',
        ctaSecondaryHref: WHATSAPP,
      }}
    />
  );
}
