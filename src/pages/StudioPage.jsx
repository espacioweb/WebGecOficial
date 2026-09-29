import { useState } from 'react';
import { Compass, PenTool, Camera, Wand2, Video } from 'lucide-react';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { WHATSAPP } from '../data/site';
import { C } from '../data/gecIA';
import { P } from '../utils/textStyles';
import PilarPage, { Eyebrow, HeroCharacter } from '../components/PilarPage';
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
        descriptor:
          'Producimos ideas con criterio y las convertimos en soluciones visuales y audiovisuales que agregan valor a la marca.',
        explicacion:
          'Cada marca necesita una respuesta creativa propia. Partimos de lo que necesita comunicar y elegimos la dirección, los formatos y los recursos de producción adecuados para desarrollar piezas coherentes, originales y adaptables que fortalezcan su presencia.',
        ctaPrimary: 'Cuéntanos tu idea',
        ctaPrimaryTo: BRIEF_STUDIO,
        ctaSecondary: 'Descubre cómo podemos producirla',
        ctaSecondaryHref: '#areas',
        media: (
          <HeroCharacter img="/assets/pilares/studio.webp" video="/assets/videos/scene_3.mp4" focus={84} color={C.azul} alt="Meraki Studio" />
        ),
      }}
      valor={{
        h2: 'Creatividad con criterio para producir lo que tu marca necesita.',
        items: [
          'Dirección creativa alineada con la marca',
          'Soluciones visuales coherentes y adaptables',
          'Producción con propósito',
        ],
      }}
      alcance={{
        h2: 'Soluciones creativas para dar forma y movimiento a tus ideas.',
        nota: 'En spots y reels: Live es filmación real, Fusion combina filmación con IA y Cinema es totalmente IA.',
        items: [
          {
            titulo: 'Dirección creativa',
            icon: Compass,
            color: C.azul,
          },
          {
            titulo: 'Diseño gráfico',
            texto: 'Desarrollo visual de marca, piezas, composición e imagen, con IA cuando aporta valor.',
            icon: PenTool,
            color: C.azul,
          },
          {
            titulo: 'Fotografía',
            texto: 'Producto, corporativa e instalaciones, con postproducción e IA cuando aplica.',
            icon: Camera,
            color: C.azul,
          },
          {
            titulo: 'Animación',
            texto: '2D, motion graphics y animación con IA.',
            icon: Wand2,
            color: C.azul,
          },
          {
            titulo: 'Producción audiovisual',
            texto: 'Spots, reels, spotlights, videos educativos y cortinas para pantallas o tótems.',
            icon: Video,
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
