import { Compass, Palette, Megaphone, SlidersHorizontal } from 'lucide-react';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { WHATSAPP } from '../data/site';
import { C } from '../data/gecIA';
import PilarPage, { HeroCharacter } from '../components/PilarPage';

const BRIEF_MARKETING = '/cuentanos-tu-reto/?pilar=marketing';

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
        // Copy "CAMBIOS WEBSITE GEC · octubre 2026" (lámina 6) — literal.
        descriptor:
          'Cuando una empresa crece, también crecen sus canales, públicos, mensajes y decisiones de comunicación. Sin una dirección clara, todo puede empezar a trabajar por separado.',
        explicacion:
          'En GEC revisamos dónde está la marca, qué necesita el negocio y qué oportunidades existen para definir prioridades, orientar la comunicación y activar los canales adecuados con mayor intención.',
        ctaPrimary: 'Cuéntanos qué necesita tu empresa',
        ctaPrimaryTo: BRIEF_MARKETING,
        ctaSecondary: 'Descubre cómo construir una marca sólida',
        ctaSecondaryHref: '#areas',
        media: (
          <HeroCharacter img="/assets/pilares/marketing.webp" video="/assets/videos/scene_2.mp4" focus={58} color={C.amarillo} alt="Meraki Marketing" />
        ),
      }}
      // Láminas 11 y 12 — títulos en primera persona del cliente (las citas
      // van con comillas tipográficas, tal cual el PDF).
      valor={{
        h2: 'Cuando hacer marketing ya no es suficiente.',
        intro:
          'A medida que una empresa crece, también crecen los canales, mensajes, públicos y decisiones. El reto es evitar que todo termine funcionando por separado.',
        items: [
          {
            titulo: '“Hacemos de todo, pero no sabemos qué priorizar.”',
            texto: 'Ponemos foco en lo que realmente necesita la marca y el negocio.',
          },
          {
            titulo: '“Conocemos nuestro producto, pero ¿seguimos entendiendo al cliente?”',
            texto: 'Revisamos mercado, audiencias y oportunidades para tomar mejores decisiones.',
          },
          {
            titulo: '“Cada canal parece estar diciendo algo diferente.”',
            texto: 'Conectamos mensajes y puntos de contacto para construir una comunicación más coherente.',
          },
          {
            titulo: '“Invertimos y hacemos acciones, pero no siempre sabemos qué está funcionando.”',
            texto: 'Usamos información y resultados para ajustar, priorizar y decidir mejor.',
          },
          {
            titulo: '“Queremos crecer sin perder lo que hace valiosa a nuestra marca.”',
            texto: 'Construimos una dirección que fortalece posicionamiento, diferenciación y consistencia en el tiempo.',
          },
        ],
      }}
      alcance={{
        h2: 'Cuatro formas de activar mejor el marketing de tu empresa.',
        intro:
          'No todas las empresas necesitan lo mismo. Podemos intervenir desde la revisión de lo que ya estás haciendo hasta la definición de una nueva estrategia, campaña o activación de canales.',
        items: [
          {
            titulo: '01 — Revisión y dirección estratégica',
            lead: 'Cuando se hacen muchas acciones, pero hace falta ordenar el rumbo.',
            texto: 'Revisamos lo que está funcionando, detectamos oportunidades y definimos prioridades para orientar mejor los esfuerzos.',
            icon: Compass,
            color: C.amarillo,
          },
          {
            titulo: '02 — Marca y posicionamiento',
            lead: 'Cuando la empresa ha evolucionado, pero la marca necesita ponerse al día.',
            texto: 'Fortalecemos su propuesta, mensajes y posicionamiento para que exprese mejor el valor actual del negocio.',
            icon: Palette,
            color: C.amarillo,
          },
          {
            titulo: '03 — Campañas y lanzamientos',
            lead: 'Cuando hay algo importante que comunicar y necesitamos mover a la audiencia.',
            texto: 'Desarrollamos el concepto, los mensajes y la estrategia de canales alrededor de un objetivo concreto.',
            icon: Megaphone,
            color: C.amarillo,
          },
          {
            titulo: '04 — Activación de canales',
            lead: 'Cuando sabemos qué queremos lograr, pero necesitamos decidir dónde y cómo comunicarlo.',
            texto: 'Seleccionamos y articulamos los canales más adecuados para llevar la estrategia al mercado.',
            icon: SlidersHorizontal,
            color: C.amarillo,
          },
        ],
      }}
      cierre={{
        // Lámina 13.
        h2: 'Antes de hacer más, definamos qué conviene mover.',
        texto: 'Cuéntanos qué quieres mejorar, qué está frenando tus esfuerzos o dónde sientes que se están perdiendo oportunidades. Te ayudamos a ordenar la necesidad y definir el siguiente paso.',
        ctaPrimary: 'Cuéntanos tu reto',
        ctaPrimaryTo: BRIEF_MARKETING,
        ctaSecondary: 'Conversar con GEC',
        ctaSecondaryHref: WHATSAPP,
      }}
    />
  );
}
