import { useState } from 'react';
import { Building2, Clapperboard, GraduationCap, Megaphone, Radio, Mic } from 'lucide-react';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { WHATSAPP } from '../data/site';
import { C } from '../data/gecIA';
import { P } from '../utils/textStyles';
import PilarPage, { B, Eyebrow, HeroCharacter } from '../components/PilarPage';
import { VideoCard } from '../components/VideoCarousel';
import VideoModal from '../components/VideoModal';

const BRIEF_STUDIO = '/cuentanos-tu-reto/?pilar=studio';

// Reel real de producción, dado por el usuario (2026-09-29). Título verbatim
// vía oEmbed de YouTube (no inventado), mismo criterio que iybVideosSeed en
// site.js.
const REEL = {
  id: 'tc6r7P4PyUo',
  title: 'Showreel 2026 | Portafolio de Producción Audiovisual | Grupo Espacio Creativo – Honduras',
  thumbnail: 'https://i.ytimg.com/vi/tc6r7P4PyUo/hqdefault.jpg',
};

// Botón del reel en modal premium — reutiliza VideoCard/VideoModal (mismo
// componente que Inside Your Brand) en vez de un botón de texto plano.
function BloqueReel() {
  const [abierto, setAbierto] = useState(null);
  return (
    <section className="border-t border-white/[.07] px-[clamp(20px,4vw,40px)] py-[clamp(48px,6vw,80px)]">
      <div data-reveal className="mx-auto flex max-w-[1100px] flex-col items-start gap-6">
        <Eyebrow color={C.azul}>Nuestro trabajo</Eyebrow>
        <h2
          className="m-0 text-[clamp(22px,2.6vw,30px)] leading-[1.2] font-bold text-white"
          style={{ ...P, letterSpacing: '-.02em' }}
        >
          Mira nuestro reel de producción.
        </h2>
        <VideoCard video={REEL} color={C.azul} onOpen={() => setAbierto(REEL)} className="w-full max-w-[420px]" />
      </div>
      <VideoModal video={abierto} onClose={() => setAbierto(null)} />
    </section>
  );
}

export default function StudioPage() {
  useDocumentMeta({
    title: 'Studio — Producción visual y audiovisual | Grupo Espacio Creativo',
    description: 'Producimos ideas con criterio y las convertimos en soluciones visuales y audiovisuales que agregan valor a la marca.',
    path: '/studio/',
  });

  return (
    <PilarPage
      pilarId="p-studio"
      hero={{
        eyebrow: 'Studio',
        color: C.azul,
        h1: 'Studio',
        // Copy "CAMBIOS WEBSITE GEC · octubre 2026" (lámina 8) — literal.
        descriptor:
          'Hay ideas que necesitan verse. Otras necesitan explicarse, venderse o lograr que todos las entiendan.',
        explicacion:
          'Studio convierte necesidades de comunicación en soluciones visuales y audiovisuales pensadas para cumplir una función dentro de la empresa y fortalecer la marca.',
        ctaPrimary: 'Cuéntanos tu idea',
        ctaPrimaryTo: BRIEF_STUDIO,
        ctaSecondary: 'Descubre cómo podemos producirla',
        ctaSecondaryHref: '#areas',
        media: (
          <HeroCharacter img="/assets/pilares/studio.webp" video="/assets/videos/scene_3.mp4" focus={84} color={C.azul} alt="Meraki Studio" />
        ),
      }}
      // Lámina 9 — las frases en negrita del PDF van como <B> dentro del texto.
      valor={{
        h2: 'No producimos por producir. Cada pieza debe cumplir un propósito.',
        items: [
          {
            titulo: 'La necesidad',
            texto: (
              <>
                Una empresa puede necesitar <B>presentar, explicar, vender, formar o fortalecer su marca</B>. Todo
                comienza entendiendo qué necesita lograr.
              </>
            ),
          },
          {
            titulo: 'La dirección',
            texto: (
              <>
                Definimos <B>qué contar, cómo contarlo y qué formato funciona mejor</B>, manteniendo coherencia con
                la marca y su audiencia.
              </>
            ),
          },
          {
            titulo: 'La producción',
            texto: (
              <>
                Convertimos esa dirección en <B>soluciones visuales y audiovisuales</B> pensadas para comunicar mejor
                y aportar valor al negocio.
              </>
            ),
          },
        ],
      }}
      // Lámina 10 — reemplaza las 5 tarjetas por disciplina (Dirección creativa,
      // Diseño, Fotografía, Animación, Producción) y la nota Live/Fusion/Cinema
      // por 6 tipos de contenido según lo que la empresa necesita comunicar.
      alcance={{
        eyebrow: 'Soluciones audiovisuales',
        h2: 'Contenidos pensados para lo que tu empresa necesita comunicar.',
        intro: (
          <>
            Desde contar la historia de una marca hasta explicar un servicio, apoyar una venta, formar equipos o
            conectar con una audiencia. <B>Definimos el formato y la producción según el objetivo.</B>
          </>
        ),
        items: [
          {
            titulo: 'Producciones Institucionales',
            texto: 'Historias de marca, documentales y contenidos que comunican trayectoria, propósito, cultura y valor empresarial.',
            icon: Building2,
            color: C.azul,
          },
          {
            titulo: 'Serie Spotlight',
            texto: 'Contenidos por capítulos que profundizan en productos, servicios o soluciones para facilitar su comprensión y apoyar la venta.',
            icon: Clapperboard,
            color: C.azul,
          },
          {
            titulo: 'Contenidos Educativos',
            texto: 'Piezas para formar, explicar procesos, fortalecer cultura organizacional o compartir conocimiento con equipos y clientes.',
            icon: GraduationCap,
            color: C.azul,
          },
          {
            titulo: 'Contenidos Comerciales',
            texto: 'Spots, reels y piezas audiovisuales pensadas para presentar productos, servicios, campañas y promociones con mayor impacto.',
            icon: Megaphone,
            color: C.azul,
          },
          {
            titulo: 'Eventos & Streaming',
            texto: 'Programas en vivo o pregrabados para eventos, transmisiones, entrevistas y contenidos diseñados para extender la experiencia a otros canales.',
            icon: Radio,
            color: C.azul,
          },
          {
            titulo: 'Podcast',
            texto: 'Formatos de conversación, entrevistas o contenidos especializados que ayudan a construir conocimiento, cercanía y presencia de marca.',
            icon: Mic,
            color: C.azul,
          },
        ],
      }}
      extra={<BloqueReel />}
      cierre={{
        h2: 'Tu próxima gran idea merece cobrar vida.',
        texto: 'Cuéntanos qué necesitas comunicar y construiremos la dirección creativa, el formato y la producción que mejor le den vida a tu idea.',
        ctaPrimary: 'Cuéntanos qué producción necesitas',
        ctaPrimaryTo: BRIEF_STUDIO,
        ctaSecondary: 'Conversar con GEC',
        ctaSecondaryHref: WHATSAPP,
      }}
    />
  );
}
