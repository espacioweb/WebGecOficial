import { Compass, Users, MessagesSquare, BarChart3, Award, Palette, Megaphone, Globe, SlidersHorizontal } from 'lucide-react';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { WHATSAPP } from '../data/site';
import { C } from '../data/gecIA';
import PilarPage, { HeroCharacter } from '../components/PilarPage';

const BRIEF_MARKETING = '/cuentanos-tu-reto/?pilar=marketing';
const SLOT = 'captura / video';

export default function MarketingPage() {
  useDocumentMeta({
    title: 'Marketing — Estrategia y comunicación | Grupo Espacio Creativo',
    description: 'Estrategia y comunicación para impulsar el negocio y construir marcas sólidas.',
    path: '/marketing/',
  });

  return (
    <PilarPage
      pilarId="p-marketing"
      hero={{
        eyebrow: 'Marketing',
        color: C.amarillo,
        h1: 'Marketing',
        descriptor: 'Estrategia y comunicación para impulsar el negocio y construir marcas sólidas.',
        explicacion:
          'Cada estrategia parte de los objetivos del negocio y de lo que los datos revelan sobre el mercado y las audiencias. Así construimos una comunicación coherente, relevante y sostenible que fortalece el posicionamiento y mantiene la marca presente en el tiempo.',
        ctaPrimary: 'Cuéntanos qué necesita tu empresa',
        ctaPrimaryTo: BRIEF_MARKETING,
        ctaSecondary: 'Descubre cómo construir una marca sólida',
        ctaSecondaryHref: '#areas',
        media: (
          <HeroCharacter img="/assets/pilares/marketing.webp" video="/assets/videos/scene_2.mp4" focus={58} color={C.amarillo} alt="Meraki Marketing" />
        ),
      }}
      valor={{
        h2: 'Lo que Marketing aporta a tu empresa.',
        items: [
          { titulo: 'Dirección estratégica', icon: Compass, color: C.amarillo, slot: SLOT },
          { titulo: 'Mercado y audiencias', icon: Users, color: C.amarillo, slot: SLOT },
          { titulo: 'Comunicación integrada', icon: MessagesSquare, color: C.amarillo, slot: SLOT },
          { titulo: 'Medición e insights', icon: BarChart3, color: C.amarillo, slot: SLOT },
          { titulo: 'Construcción de marca sólida', icon: Award, color: C.amarillo, slot: SLOT },
        ],
      }}
      alcance={{
        h2: 'Cuatro formas de fortalecer tu marca.',
        nota: 'El alcance se adapta después de comprender el objetivo de tu empresa.',
        items: [
          {
            titulo: 'Branding y posicionamiento',
            texto: 'Definimos una identidad y un lugar claro para tu marca en la mente de tu audiencia.',
            icon: Palette,
            color: C.amarillo,
            slot: SLOT,
          },
          {
            titulo: 'Campañas',
            texto: 'Diseñamos campañas alineadas a los objetivos del negocio.',
            icon: Megaphone,
            color: C.amarillo,
            slot: SLOT,
          },
          {
            titulo: 'Marketing digital',
            texto: 'Activamos canales digitales para generar alcance y resultados medibles.',
            icon: Globe,
            color: C.amarillo,
            slot: SLOT,
          },
          {
            titulo: 'Optimización de canales',
            texto: 'Ajustamos cada canal según lo que el desempeño va mostrando.',
            icon: SlidersHorizontal,
            color: C.amarillo,
            slot: SLOT,
          },
        ],
      }}
      cierre={{
        h2: 'Construyamos una marca que crezca sin perder su esencia.',
        texto: 'Cuéntanos qué resultado necesita alcanzar tu empresa y te ayudaremos a definir la solución de Marketing más adecuada.',
        ctaPrimary: 'Completar brief',
        ctaPrimaryTo: BRIEF_MARKETING,
        ctaSecondary: 'Conversar con GEC',
        ctaSecondaryHref: WHATSAPP,
      }}
    />
  );
}
