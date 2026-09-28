import { Target, Briefcase, Users, RefreshCw, Sparkles, Video, Palette, BarChart3, Image as ImageIcon, Users2 } from 'lucide-react';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { WHATSAPP } from '../data/site';
import { C } from '../data/gecIA';
import { P } from '../utils/textStyles';
import PilarPage, { CtaPrimary, Eyebrow, SlotCard, HeroCharacter } from '../components/PilarPage';

const BRIEF_EDUCA = '/cuentanos-tu-reto/?pilar=educa';
const DORADO = 'linear-gradient(150deg,#FFC935,#F5B301 55%,#E8A200)';

// Panel lateral con slot de media marcado (diagrama, reel...) para los
// bloques CompañIA y Audiovisual — mismo lenguaje visual que el slot de
// SlotCard, pero a la altura completa de la columna.
function MediaSlot({ color, icon: Icon, label }) {
  return (
    <div
      className="grid min-h-[220px] flex-1 place-items-center rounded-2xl border border-dashed lg:min-h-0"
      style={{
        borderColor: `${color}55`,
        background: `linear-gradient(160deg, ${color}14, transparent 75%)`,
      }}
    >
      <div className="flex flex-col items-center gap-3 px-6 text-center">
        <Icon size={28} style={{ color: `${color}99` }} />
        <span className="text-[12.5px]" style={{ ...P, color: 'rgba(242,239,233,.4)' }}>
          {label}
        </span>
      </div>
    </div>
  );
}


function BloqueCompañIA() {
  return (
    <section className="border-t border-white/[.07] px-[clamp(20px,4vw,40px)] py-[clamp(56px,7vw,96px)]">
      <div className="mx-auto grid max-w-[1220px] gap-10 lg:grid-cols-[1.35fr_1fr] lg:items-stretch">
        <div>
          <Eyebrow color={C.turquesa} uppercase={false}>Programa Corporativo para la Adopción y Aplicación de IA</Eyebrow>
          <h2
            className="m-0 mt-4 mb-5 max-w-[24ch] text-[clamp(28px,3.6vw,44px)] leading-[1.1] font-extrabold text-white"
            style={{ ...P, letterSpacing: '-.03em' }}
          >
            CompañIA
          </h2>
          <p className="m-0 mb-8 max-w-[62ch] text-[16px] leading-[1.75]" style={{ ...P, color: 'rgba(242,239,233,.68)' }}>
            Una ruta para que la inteligencia artificial deje de ser una iniciativa aislada y se
            convierta en una capacidad organizada dentro de la empresa.
          </p>
          <ul className="m-0 mb-9 grid list-none gap-3 p-0 sm:grid-cols-2">
            {[
              'Alinear visión y personas',
              'Identificar necesidades',
              'Organizar herramientas, reglas y responsables',
              'Formar a las personas clave',
              'Compartir resultados',
              'Dar continuidad',
            ].map((paso, i) => (
              <li
                key={paso}
                className="flex items-center gap-3 rounded-xl border border-white/[.08] bg-[#10161D] px-4 py-3 text-[13.5px] font-medium text-[#EDEAE4]"
                style={P}
              >
                <span
                  className="grid h-6 w-6 flex-none place-items-center rounded-full text-[11px] font-bold text-[#151008]"
                  style={{ background: DORADO }}
                >
                  {i + 1}
                </span>
                {paso}
              </li>
            ))}
          </ul>
          <CtaPrimary to={`${BRIEF_EDUCA}&tema=companiia`} color={C.turquesa}>
            Conversemos sobre CompañIA
          </CtaPrimary>
        </div>
        <MediaSlot color={C.turquesa} icon={ImageIcon} label="diagrama de la ruta CompañIA" />
      </div>
    </section>
  );
}

function BloqueAudiovisual() {
  return (
    <section className="border-t border-white/[.07] px-[clamp(20px,4vw,40px)] py-[clamp(56px,7vw,96px)]">
      <div className="mx-auto grid max-w-[1220px] gap-10 lg:grid-cols-[1.35fr_1fr] lg:items-stretch">
        <div>
          <Eyebrow color={C.naranja} uppercase={false}>Formación Especializada IA: Audiovisual</Eyebrow>
          <p
            className="m-0 mt-4 mb-8 max-w-[56ch] text-[clamp(20px,2.4vw,26px)] leading-[1.4] font-semibold text-white"
            style={{ ...P, letterSpacing: '-.01em' }}
          >
            De experimentar con herramientas a desarrollar un flujo de producción con criterio
            creativo, técnico y de marca.
          </p>
          <div className="mb-9 grid gap-3 sm:grid-cols-2">
            {['Flujo de producción con IA', 'Coherencia de marca', 'Revisión y control de calidad', 'Ejercicio piloto con tu equipo'].map((t) => (
              <div
                key={t}
                className="rounded-xl border border-white/[.08] bg-[#10161D] px-4 py-3.5 text-[13.5px] font-medium text-[#EDEAE4]"
                style={P}
              >
                {t}
              </div>
            ))}
          </div>
          <CtaPrimary to={`${BRIEF_EDUCA}&tema=audiovisual`} color={C.turquesa}>
            Conversemos sobre la formación audiovisual
          </CtaPrimary>
        </div>
        <MediaSlot color={C.naranja} icon={Video} label="reel de producción audiovisual" />
      </div>
    </section>
  );
}

function BloqueMarcaYProgramas() {
  return (
    <section id="otras-formas" className="border-t border-white/[.07] px-[clamp(20px,4vw,40px)] py-[clamp(56px,7vw,96px)]">
      <div className="mx-auto max-w-[1100px]">
        <h2
          className="m-0 mb-10 max-w-[26ch] text-[clamp(24px,3vw,36px)] leading-[1.15] font-bold text-white"
          style={{ ...P, letterSpacing: '-.02em' }}
        >
          Otras formas en que Educa fortalece a tu empresa.
        </h2>
        <div className="mb-9 grid gap-4 sm:grid-cols-2">
          <SlotCard
            item={{
              titulo: 'Marca',
              texto: 'Programas y talleres sobre branding, marketing, posicionamiento y comunicación.',
              icon: Palette,
              color: C.amarillo,
            }}
          />
          <SlotCard
            item={{
              titulo: 'Programas corporativos',
              texto: 'Creatividad, innovación, bienestar, comunicación, habilidades técnicas y desarrollo humano.',
              icon: Users2,
              color: C.turquesa,
            }}
          />
        </div>
        <CtaPrimary to={BRIEF_EDUCA} color={C.turquesa}>
          Diseñemos la formación que necesita tu empresa
        </CtaPrimary>
      </div>
    </section>
  );
}

// Meraki muy tenue detrás del cierre — no protagonista, solo textura. Se
// funde con máscara radial y se desatura para no competir con el copy.
function CierreSilhouette() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 flex justify-center"
      style={{
        maskImage: 'radial-gradient(ellipse 48% 62% at 50% 8%, black 45%, transparent 90%)',
        WebkitMaskImage: 'radial-gradient(ellipse 48% 62% at 50% 8%, black 45%, transparent 90%)',
      }}
    >
      <img
        src="/merakis/educa.webp"
        alt=""
        loading="lazy"
        className="h-[560px] w-auto max-w-none opacity-[.22] grayscale sepia-[.35]"
      />
    </div>
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
        eyebrow: 'Educa',
        color: C.turquesa,
        h1: (
          <>
            Adopción de <span style={{ color: C.turquesa }}>IA</span> empresarial
          </>
        ),
        descriptor:
          'Formación para adoptar la IA y desarrollar habilidades estratégicas, creativas y tecnológicas que impulsen el crecimiento creativo empresarial.',
        explicacion:
          'Preparamos a líderes y equipos para incorporar nuevas tecnologías como la inteligencia artificial, fortalecer la marca, ampliar su capacidad creativa y desarrollar habilidades técnicas y humanas que les permitan innovar, resolver retos y aportar mayor valor a la empresa.',
        ctaPrimary: 'Forma a tu equipo para crecer',
        ctaPrimaryTo: BRIEF_EDUCA,
        ctaSecondary: 'Explora nuestras capacidades',
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
      valor={{
        h2: 'Formación que se convierte en valor para la empresa.',
        items: [
          {
            titulo: 'Conectada con el negocio',
            texto: 'Diseñada a partir de los objetivos reales de tu empresa.',
            icon: Target,
            color: C.turquesa,
            slot: 'captura / video',
          },
          {
            titulo: 'Aplicable al trabajo',
            texto: 'Ejercicios y herramientas que el equipo usa desde el primer día.',
            icon: Briefcase,
            color: C.naranja,
          },
          {
            titulo: 'Adaptada a las personas',
            texto: 'Rutas ajustadas al nivel y al rol de cada participante.',
            icon: Users,
            color: C.amarillo,
            slot: 'captura / video',
          },
          {
            titulo: 'Preparada para el cambio',
            texto: 'Hábitos y criterio para seguir aprendiendo después del programa.',
            icon: RefreshCw,
            color: C.turquesa,
          },
        ],
      }}
      alcance={{
        h2: 'Capacidades para responder a los nuevos retos de la empresa.',
        items: [
          {
            titulo: 'Adopción acompañada de IA',
            texto: 'Acompañamos a tu equipo desde la primera herramienta hasta el flujo de trabajo completo.',
            icon: Sparkles,
            color: C.turquesa,
            slot: 'captura / video',
          },
          {
            titulo: 'Producción audiovisual con IA',
            texto: 'De la idea al video terminado, con criterio creativo y técnico en cada paso.',
            icon: Video,
            color: C.naranja,
            slot: 'captura / video',
          },
          {
            titulo: 'Marca',
            icon: Palette,
            color: C.amarillo,
            href: '#otras-formas',
            linkLabel: 'Ver más',
          },
          {
            titulo: 'Programas corporativos de crecimiento creativo',
            icon: BarChart3,
            color: C.turquesa,
            href: '#otras-formas',
            linkLabel: 'Ver más',
          },
        ],
      }}
      extra={
        <>
          <BloqueCompañIA />
          <BloqueAudiovisual />
          <BloqueMarcaYProgramas />
        </>
      }
      cierre={{
        h2: 'Lo que tu empresa quiere lograr también depende de lo que su equipo está preparado para hacer.',
        ctaPrimary: 'Forma a tu equipo para crecer',
        ctaPrimaryTo: BRIEF_EDUCA,
        ctaSecondary: 'Conversar con GEC',
        ctaSecondaryHref: WHATSAPP,
        silhouette: <CierreSilhouette />,
      }}
    />
  );
}
