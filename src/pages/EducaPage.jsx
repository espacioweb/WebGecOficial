import useDocumentMeta from '../hooks/useDocumentMeta';
import { WHATSAPP } from '../data/site';
import { C } from '../data/gecIA';
import { P } from '../utils/textStyles';
import PilarPage, { Eyebrow, HeroCharacter } from '../components/PilarPage';

const BRIEF_EDUCA = '/cuentanos-tu-reto/?pilar=educa';
// Un solo color de acción en toda la página (antes cambiaba entre dorado,
// naranja y turquesa según el bloque — ver mockup "Educa Landing v2": el
// color de cada pilar se reserva para acentos/identidad — eyebrows, íconos,
// bordes —, nunca para el relleno de un CTA. El dorado es el único color de
// acción en todo el sitio (Header, Home, Contacto...), así que los CTA de
// Educa vuelven a esa convención en vez de usar el turquesa propio del pilar.
const GOLD = '#F5B301';

// Programas (copy "CAMBIOS WEBSITE GEC · octubre 2026", lámina 17). Reemplaza
// las dos tarjetas insignia + las filas Marca / Programas corporativos.
// CompañIA ya tiene su propio sitio (compania.grupoespaciocreativo.com) — se
// enlaza afuera en vez de repetir aquí los 6 pasos; los otros tres programas
// no tienen página todavía, así que llevan al brief con el tema ya marcado
// (decisión confirmada con el usuario). Se escribe "CompañIA" y no
// "CompañÍA" como trae el PDF: es la grafía vigente de la guía y la que usa
// el propio sitio del programa.
const programas = [
  {
    eyebrow: 'Programa insignia',
    titulo: 'CompañIA',
    lead: 'Adopción de IA para empresas que quieren pasar del interés a la aplicación real.',
    texto: 'Identificamos dónde puede aportar valor, preparamos a los equipos y acompañamos su incorporación al trabajo.',
    link: 'Conocer CompañIA',
    href: 'https://compania.grupoespaciocreativo.com/',
    color: C.turquesa,
    destacado: true,
  },
  {
    eyebrow: 'Formación especializada',
    titulo: 'Producción audiovisual con IA',
    lead: 'Para equipos creativos que necesitan integrar IA sin perder criterio, calidad ni coherencia de marca.',
    texto: 'Aprenden a incorporarla dentro de un flujo práctico de producción audiovisual.',
    link: 'Ver programa',
    href: `${BRIEF_EDUCA}&tema=audiovisual`,
    color: C.naranja,
  },
  {
    eyebrow: 'Bienestar organizacional',
    titulo: 'Programa Wellness',
    lead: 'Para empresas que quieren cuidar a sus equipos y construir formas de trabajo más sostenibles.',
    texto: 'Trabajamos bienestar, hábitos y herramientas que favorecen una mejor experiencia dentro de la organización.',
    link: 'Ver programa',
    href: `${BRIEF_EDUCA}&tema=wellness`,
    color: C.turquesa,
  },
  {
    eyebrow: 'Cultura organizacional',
    titulo: 'Mejora de Cultura Organizacional',
    lead: 'Cuando la cultura que la empresa necesita no siempre coincide con lo que sucede en el día a día.',
    texto: 'Trabajamos comunicación, comportamientos y formas de colaboración para acercar al equipo a la cultura que se quiere construir.',
    link: 'Ver programa',
    href: `${BRIEF_EDUCA}&tema=cultura`,
    color: C.turquesa,
  },
];

function ProgramaCard({ p }) {
  const externo = p.href.startsWith('http');
  return (
    <a
      href={p.href}
      {...(externo ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
      className="group flex min-h-[260px] flex-col justify-between gap-8 rounded-2xl border p-8 transition-colors hover:border-white/25"
      style={{
        borderColor: p.destacado ? `${p.color}66` : 'rgba(255,255,255,.08)',
        background: p.destacado
          ? `linear-gradient(160deg, ${p.color}24, transparent 70%)`
          : `linear-gradient(160deg, ${p.color}10, #10161D 60%)`,
      }}
    >
      <Eyebrow color={p.color}>{p.eyebrow}</Eyebrow>
      <div className="flex flex-col gap-2.5">
        <h3 className="m-0 text-[clamp(22px,2.2vw,26px)] leading-[1.15] font-extrabold text-white" style={{ ...P, letterSpacing: '-.02em' }}>
          {p.titulo}
        </h3>
        <p className="m-0 max-w-[44ch] text-[14px] leading-[1.55] font-semibold" style={{ ...P, color: 'rgba(242,239,233,.88)' }}>
          {p.lead}
        </p>
        <p className="m-0 max-w-[44ch] text-[14px] leading-[1.6]" style={{ ...P, color: 'rgba(242,239,233,.6)' }}>
          {p.texto}
        </p>
        <span className="mt-1 text-[13.5px] font-semibold transition-colors group-hover:text-white" style={{ ...P, color: p.color }}>
          {p.link} →
        </span>
      </div>
    </a>
  );
}

// `id="areas"`: el CTA secundario del hero apunta aquí (ver PilarPage).
function BloqueProgramas() {
  return (
    <section id="areas" className="border-t border-white/[.07] bg-[#0A0E13]/60 px-[clamp(20px,4vw,40px)] py-[clamp(56px,7vw,96px)]">
      <div className="mx-auto max-w-[1100px]">
        <h2
          data-reveal
          className="m-0 mb-10 max-w-[24ch] text-[clamp(24px,3vw,36px)] leading-[1.15] font-bold text-white"
          style={{ ...P, letterSpacing: '-.02em' }}
        >
          Programas para los retos que hoy enfrenta tu empresa.
        </h2>
        <div data-reveal className="grid gap-4 sm:grid-cols-2">
          {programas.map((p) => (
            <ProgramaCard key={p.titulo} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

// La sección propia de CompañIA (6 pasos) y la de Formación Audiovisual
// (reel + 4 rasgos) se retiraron en octubre 2026 — lámina 18 del PDF:
// "Eliminamos esta información". CompañIA vive ahora en su sitio propio.

export default function EducaPage() {
  useDocumentMeta({
    title: 'Educa — Formación en IA y crecimiento creativo | Grupo Espacio Creativo',
    description:
      'Formación para adoptar la IA y desarrollar habilidades estratégicas, creativas y tecnológicas que impulsen el crecimiento creativo empresarial.',
    path: '/educa/',
  });

  return (
    <PilarPage
      pilarId="p-educa"
      hero={{
        eyebrow: 'Educa · Formación empresarial',
        color: C.turquesa,
        h1Size: 'clamp(40px,6.2vw,76px)',
        h1: (
          <>
            Adopción de <span style={{ color: C.turquesa }}>IA</span> empresarial
          </>
        ),
        // Copy octubre 2026 (lámina 15) — literal.
        descriptor: 'Capacitar no basta si lo aprendido no cambia la forma de trabajar.',
        explicacion:
          'Las empresas necesitan equipos capaces de responder a nuevos retos, adoptar cambios y aplicar lo aprendido en situaciones reales. En Educa diseñamos programas a partir de necesidades concretas del negocio para convertir conocimiento en acción.',
        ctaPrimary: 'Forma a tu equipo',
        ctaPrimaryTo: BRIEF_EDUCA,
        ctaPrimaryColor: GOLD,
        // El botón dice lo que hay del otro lado del link: la sección #areas
        // ahora se llama "Programas para los retos…" (antes "Capacidades").
        ctaSecondary: 'Ver programas',
        ctaSecondaryHref: '#areas',
        media: (
          <HeroCharacter
            img="/merakis/educa-hero.webp"
            video="/assets/videos/educa-hero.mp4"
            color={C.turquesa}
            alt="Meraki Educa con una tablet"
            haloBold
          />
        ),
      }}
      // Lámina 16 — usa la sección Valor compartida (mismo patrón numerado
      // que antes vivía como BloqueValor propio de esta página).
      valor={{
        h2: 'Aprender tiene valor cuando cambia la forma de trabajar.',
        items: [
          {
            titulo: 'Parte de un reto real',
            texto: 'Diseñamos cada programa desde una necesidad concreta de la empresa, no desde un temario genérico.',
          },
          {
            titulo: 'Se lleva al día a día',
            texto: 'Trabajamos con casos, situaciones y herramientas que el equipo puede aplicar en su trabajo.',
          },
          {
            titulo: 'Se adapta al equipo',
            texto: 'Ajustamos contenidos, nivel y dinámica según el rol y el contexto de quienes participan.',
          },
          {
            titulo: 'Busca generar adopción',
            texto: 'Orientamos el aprendizaje para convertirlo en nuevos criterios, hábitos y formas de trabajar.',
          },
        ],
      }}
      extra={<BloqueProgramas />}
      cierre={{
        // Lámina 19.
        h2: '¿Qué necesita cambiar dentro de tu empresa?',
        texto:
          'Puede ser una nueva herramienta, un proceso que necesita adoptarse, una forma de trabajar que debe mejorar o una cultura que queremos fortalecer. Cuéntanos el reto y te ayudamos a convertirlo en una ruta de formación aplicable.',
        ctaPrimary: 'Diseñemos tu formación',
        ctaPrimaryTo: BRIEF_EDUCA,
        ctaSecondary: 'WhatsApp',
        ctaSecondaryHref: WHATSAPP,
      }}
    />
  );
}
