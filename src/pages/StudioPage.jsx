import { Compass, PenTool, Camera, Wand2, Video } from 'lucide-react';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { WHATSAPP } from '../data/site';
import { C } from '../data/gecIA';
import PilarPage, { HeroCharacter } from '../components/PilarPage';

const BRIEF_STUDIO = '/cuentanos-tu-reto/?pilar=studio';

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
