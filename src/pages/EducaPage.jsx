import { Video } from 'lucide-react';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { WHATSAPP } from '../data/site';
import { C } from '../data/gecIA';
import { P } from '../utils/textStyles';
import PilarPage, { CtaPrimary, Eyebrow, HeroCharacter } from '../components/PilarPage';

const BRIEF_EDUCA = '/cuentanos-tu-reto/?pilar=educa';
// Un solo color de acción en toda la página (antes cambiaba entre dorado,
// naranja y turquesa según el bloque — ver mockup "Educa Landing v2": el
// color de cada pilar se reserva para acentos/identidad — eyebrows, íconos,
// bordes —, nunca para el relleno de un CTA. El dorado es el único color de
// acción en todo el sitio (Header, Home, Contacto...), así que los CTA de
// Educa vuelven a esa convención en vez de usar el turquesa propio del pilar.
const GOLD = '#F5B301';

const valorItems = [
  { n: '01', t: 'Conectada con el negocio', d: 'Orientada a partir de los objetivos reales de tu empresa.' },
  { n: '02', t: 'Aplicable al trabajo', d: 'Ejercicios y herramientas que el equipo usa desde el primer día.' },
  { n: '03', t: 'Adaptada a las personas', d: 'Rutas ajustadas al nivel y al rol de cada participante.' },
  { n: '04', t: 'Preparada para el cambio', d: 'Hábitos y criterio para seguir aprendiendo después del programa.' },
];

// Lista numerada con divisores en vez de tarjetas con caja de media vacía
// — la crítica de diseño de esta página señaló ese patrón como el más
// genérico/intercambiable; esto lo reemplaza sin inventar contenido nuevo
// (mismos 4 atributos, mismos textos, solo la presentación cambia).
function BloqueValor() {
  return (
    <section className="border-t border-white/[.07] px-[clamp(20px,4vw,40px)] py-[clamp(56px,7vw,96px)]">
      <div className="mx-auto max-w-[1100px]">
        <h2
          data-reveal
          className="m-0 mb-10 max-w-[26ch] text-[clamp(24px,3vw,36px)] leading-[1.15] font-bold text-white"
          style={{ ...P, letterSpacing: '-.02em' }}
        >
          Formación que se convierte en valor para la empresa.
        </h2>
        <div
          data-reveal
          className="grid gap-px overflow-hidden rounded-2xl border border-white/[.08] bg-white/[.08] sm:grid-cols-2 lg:grid-cols-4"
        >
          {valorItems.map((v) => (
            <div key={v.n} className="flex flex-col gap-2.5 bg-[#0A0E13] p-7">
              <span className="text-[13px] font-bold" style={{ ...P, color: GOLD }}>
                {v.n}
              </span>
              <h3 className="m-0 text-[16.5px] font-bold text-white" style={P}>
                {v.t}
              </h3>
              <p className="m-0 text-[13.5px] leading-[1.6]" style={{ ...P, color: 'rgba(242,239,233,.6)' }}>
                {v.d}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Fusiona lo que antes eran dos secciones separadas (Alcance/Capacidades y
// "Otras formas") — tenían Marca y Programas corporativos duplicados entre
// las dos. Dos programas insignia (enlazan a sus propias secciones más
// abajo) + dos complementarios en una lista simple.
function BloqueProgramas() {
  return (
    <section id="areas" className="border-t border-white/[.07] bg-[#0A0E13]/60 px-[clamp(20px,4vw,40px)] py-[clamp(56px,7vw,96px)]">
      <div className="mx-auto max-w-[1100px]">
        <h2
          data-reveal
          className="m-0 mb-10 max-w-[24ch] text-[clamp(24px,3vw,36px)] leading-[1.15] font-bold text-white"
          style={{ ...P, letterSpacing: '-.02em' }}
        >
          Capacidades para los nuevos retos de la empresa.
        </h2>
        <div data-reveal className="mb-5 grid gap-4 sm:grid-cols-2">
          <a
            href="#compania"
            className="group flex min-h-[240px] flex-col justify-between gap-10 rounded-2xl border p-8 transition-colors"
            style={{ borderColor: `${C.turquesa}40`, background: `linear-gradient(160deg, ${C.turquesa}1f, transparent 70%)` }}
          >
            <Eyebrow color={C.turquesa}>Programa insignia</Eyebrow>
            <div className="flex flex-col gap-2.5">
              <h3 className="m-0 text-[26px] font-extrabold text-white" style={{ ...P, letterSpacing: '-.02em' }}>
                CompañIA
              </h3>
              <p className="m-0 max-w-[38ch] text-[14px] leading-[1.6]" style={{ ...P, color: 'rgba(242,239,233,.65)' }}>
                Adopción acompañada de IA: desde la primera herramienta hasta el flujo de trabajo completo.
              </p>
              <span className="mt-1 text-[13.5px] font-semibold transition-colors group-hover:text-white" style={{ ...P, color: C.turquesa }}>
                Ver la ruta de 6 pasos →
              </span>
            </div>
          </a>
          <a
            href="#audiovisual"
            className="group flex min-h-[240px] flex-col justify-between gap-10 rounded-2xl border p-8 transition-colors"
            style={{ borderColor: `${C.naranja}40`, background: `linear-gradient(160deg, ${C.naranja}1f, transparent 70%)` }}
          >
            <Eyebrow color={C.naranja}>Formación especializada</Eyebrow>
            <div className="flex flex-col gap-2.5">
              <h3 className="m-0 text-[26px] font-extrabold text-white" style={{ ...P, letterSpacing: '-.02em' }}>
                Producción audiovisual con IA
              </h3>
              <p className="m-0 max-w-[38ch] text-[14px] leading-[1.6]" style={{ ...P, color: 'rgba(242,239,233,.65)' }}>
                De la idea al video terminado, con criterio creativo, técnico y de marca en cada paso.
              </p>
              <span className="mt-1 text-[13.5px] font-semibold transition-colors group-hover:text-white" style={{ ...P, color: C.naranja }}>
                Ver el programa →
              </span>
            </div>
          </a>
        </div>
        <div data-reveal className="grid gap-3 sm:grid-cols-2">
          {[
            {
              t: 'Marca',
              d: 'Programas y talleres sobre branding, marketing, posicionamiento y comunicación.',
            },
            {
              t: 'Programas corporativos',
              d: 'Creatividad, innovación, bienestar, comunicación, habilidades técnicas y desarrollo humano.',
            },
          ].map((e) => (
            <div key={e.t} className="flex items-start gap-4 rounded-xl border border-white/[.08] bg-[#10161D] px-6 py-5">
              <div className="flex-1">
                <h3 className="m-0 mb-1.5 text-[15px] font-bold text-white" style={P}>
                  {e.t}
                </h3>
                <p className="m-0 text-[13px] leading-[1.55]" style={{ ...P, color: 'rgba(242,239,233,.55)' }}>
                  {e.d}
                </p>
              </div>
              <span className="text-[18px] flex-none" style={{ color: GOLD }}>
                →
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const companiaSteps = [
  { n: 1, t: 'Alinear visión y personas', d: 'Definimos para qué usará la empresa la IA y quién lidera el cambio.' },
  { n: 2, t: 'Identificar necesidades', d: 'Mapeamos procesos y tareas donde la IA aporta valor real.' },
  { n: 3, t: 'Organizar herramientas, reglas y responsables', d: 'Políticas de uso, stack recomendado y dueños por área.' },
  { n: 4, t: 'Formar a las personas clave', d: 'Entrenamiento práctico según rol y nivel.' },
  { n: 5, t: 'Compartir resultados', d: 'Casos internos que demuestran avances y generan adopción.' },
  { n: 6, t: 'Dar continuidad', d: 'Seguimiento para que la capacidad se mantenga y crezca.' },
];

// La columna de la izquierda queda fija (sticky) mientras se lee la línea
// de tiempo a la derecha — reemplaza el diagrama vacío que había ahí antes
// (no había un diagrama real que mostrar) por los 6 pasos, que sí son
// contenido real.
function BloqueCompañIA() {
  return (
    <section id="compania" className="border-t border-white/[.07] px-[clamp(20px,4vw,40px)] py-[clamp(56px,7vw,96px)]">
      <div className="mx-auto grid max-w-[1220px] items-start gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div data-reveal className="flex flex-col gap-5 lg:sticky lg:top-[110px]">
          <Eyebrow color={C.turquesa} uppercase={false}>Programa Corporativo para la Adopción y Aplicación de IA</Eyebrow>
          <h2
            className="m-0 text-[clamp(36px,4.6vw,56px)] leading-[1] font-extrabold text-white"
            style={{ ...P, letterSpacing: '-.03em' }}
          >
            Compañ<span style={{ color: C.turquesa }}>IA</span>
          </h2>
          <p className="m-0 max-w-[40ch] text-[16px] leading-[1.7]" style={{ ...P, color: 'rgba(242,239,233,.68)' }}>
            Una ruta para que la inteligencia artificial deje de ser una iniciativa aislada y se
            convierta en una capacidad organizada dentro de la empresa.
          </p>
          <div>
            <CtaPrimary to={`${BRIEF_EDUCA}&tema=companiia`} color={GOLD}>
              Conversemos sobre CompañIA
            </CtaPrimary>
          </div>
        </div>
        <ol data-reveal className="m-0 flex list-none flex-col p-0">
          {companiaSteps.map((s) => (
            <li key={s.n} className="grid grid-cols-[44px_1fr] gap-5 border-b border-white/[.08] py-5 first:pt-0 last:border-b-0">
              <span
                className="grid h-11 w-11 flex-none place-items-center rounded-full border text-[14px] font-bold"
                style={{ borderColor: `${C.turquesa}80`, color: C.turquesa }}
              >
                {s.n}
              </span>
              <div className="flex flex-col gap-1 pt-0.5">
                <h3 className="m-0 text-[16px] font-bold text-white" style={P}>
                  {s.t}
                </h3>
                <p className="m-0 text-[13.5px] leading-[1.55]" style={{ ...P, color: 'rgba(242,239,233,.55)' }}>
                  {s.d}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const avFeatures = [
  { t: 'Flujo de producción con IA', d: 'Guion, imagen, voz y edición integrados.' },
  { t: 'Coherencia de marca', d: 'Resultados alineados a la identidad visual.' },
  { t: 'Revisión y control de calidad', d: 'Criterios para aprobar piezas finales.' },
  { t: 'Ejercicio piloto con tu equipo', d: 'Una pieza real producida durante el programa.' },
];

function BloqueAudiovisual() {
  return (
    <section id="audiovisual" className="border-t border-white/[.07] bg-[#0A0E13]/60 px-[clamp(20px,4vw,40px)] py-[clamp(56px,7vw,96px)]">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-10">
        <div data-reveal className="flex max-w-[62ch] flex-col gap-4">
          <Eyebrow color={C.naranja} uppercase={false}>Formación Especializada IA: Audiovisual</Eyebrow>
          <h2
            className="m-0 text-[clamp(24px,3vw,36px)] leading-[1.2] font-bold text-white"
            style={{ ...P, letterSpacing: '-.02em' }}
          >
            De experimentar con herramientas a un flujo de producción con criterio creativo, técnico y
            de marca.
          </h2>
        </div>
        <div
          className="grid min-h-[220px] place-items-center rounded-2xl border border-dashed aspect-video"
          style={{ borderColor: `${C.naranja}55`, background: `linear-gradient(160deg, ${C.naranja}14, transparent 75%)` }}
        >
          <div className="flex flex-col items-center gap-3 px-6 text-center">
            <Video size={28} style={{ color: `${C.naranja}99` }} />
            <span className="text-[12.5px]" style={{ ...P, color: 'rgba(242,239,233,.4)' }}>
              reel de producción audiovisual
            </span>
          </div>
        </div>
        <div data-reveal className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {avFeatures.map((f) => (
            <div key={f.t} className="flex flex-col gap-2 border-t-2 pt-4" style={{ borderColor: C.naranja }}>
              <h3 className="m-0 text-[15px] font-bold text-white" style={P}>
                {f.t}
              </h3>
              <p className="m-0 text-[13px] leading-[1.55]" style={{ ...P, color: 'rgba(242,239,233,.55)' }}>
                {f.d}
              </p>
            </div>
          ))}
        </div>
        <div>
          <CtaPrimary to={`${BRIEF_EDUCA}&tema=audiovisual`} color={GOLD}>
            Conversemos sobre la formación audiovisual
          </CtaPrimary>
        </div>
      </div>
    </section>
  );
}

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
        descriptor:
          'Preparamos a líderes y equipos para incorporar la IA, fortalecer la marca y desarrollar las habilidades que hacen crecer a la empresa.',
        ctaPrimary: 'Forma a tu equipo',
        ctaPrimaryTo: BRIEF_EDUCA,
        ctaPrimaryColor: GOLD,
        // El mockup dice "Ver formaciones", pero esta página no lista cursos —
        // lleva a "Capacidades" (BloqueProgramas, #areas). Se ajusta el texto
        // del botón para que coincida con lo que hay del otro lado del link
        // (bug ya corregido antes: prometía "formaciones" y aterrizaba en
        // "Capacidades").
        ctaSecondary: 'Ver capacidades',
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
      extra={
        <>
          <BloqueValor />
          <BloqueProgramas />
          <BloqueCompañIA />
          <BloqueAudiovisual />
        </>
      }
      cierre={{
        h2: 'Lo que tu empresa quiere lograr depende de lo que su equipo está preparado para hacer.',
        ctaPrimary: 'Diseñemos tu formación',
        ctaPrimaryTo: BRIEF_EDUCA,
        ctaSecondary: 'WhatsApp',
        ctaSecondaryHref: WHATSAPP,
      }}
    />
  );
}
