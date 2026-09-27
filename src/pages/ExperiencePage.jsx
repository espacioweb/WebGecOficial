import { Users, Info, Wand2, CalendarCheck, Gamepad2, Vote, MonitorPlay, Sparkles } from 'lucide-react';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { WHATSAPP } from '../data/site';
import { C } from '../data/gecIA';
import PilarPage, { HeroCharacter } from '../components/PilarPage';

const BRIEF_EXPERIENCE = '/cuentanos-tu-reto/?pilar=experience';
const SLOT = 'captura / video';

export default function ExperiencePage() {
  useDocumentMeta({
    title: 'Experience — Eventos y experiencias interactivas | Grupo Espacio Creativo',
    description:
      'Creamos experiencias interactivas para eventos, puntos de venta y entornos digitales que conectan a las marcas con las personas.',
    path: '/experience/',
  });

  return (
    <PilarPage
      pilarId="p-experience"
      hero={{
        eyebrow: 'Experience',
        color: C.morado,
        h1: 'Experience',
        descriptor:
          'Creamos experiencias interactivas para eventos, puntos de venta y entornos digitales que conectan a las marcas con las personas.',
        explicacion:
          'Combinamos tecnología, contenido y participación para organizar eventos, activar audiencias y transformar juegos, presentaciones y puntos de contacto en experiencias más dinámicas y memorables.',
        ctaPrimary: 'Cuéntanos qué experiencia quieres crear',
        ctaPrimaryTo: BRIEF_EXPERIENCE,
        ctaSecondary: 'Activa la participación de tu audiencia',
        ctaSecondaryHref: '#areas',
        media: (
          <HeroCharacter img="/assets/pilares/experience.webp" video="/assets/videos/scene_6.mp4" focus={80} color={C.morado} alt="Meraki Experience" />
        ),
      }}
      valor={{
        h2: 'Creatividad y tecnología para fortalecer cada interacción con la audiencia.',
        items: [
          { titulo: 'Participación y conexión', icon: Users, color: C.morado, slot: SLOT },
          { titulo: 'Información útil', icon: Info, color: C.morado, slot: SLOT },
          { titulo: 'Tecnología fácil de utilizar', icon: Wand2, color: C.morado, slot: SLOT },
        ],
      }}
      alcance={{
        h2: 'Soluciones para conectar con tu audiencia.',
        items: [
          {
            titulo: 'XP Event',
            texto: 'Plataforma para eventos corporativos: invitación, registro, ingreso con QR, asistencia y comunicación.',
            icon: CalendarCheck,
            color: C.morado,
            slot: SLOT,
            href: 'https://xpevent.app',
            linkLabel: 'Conocer XP Event',
          },
          {
            titulo: 'Juegos y dinámicas',
            texto: 'Trivias, ruletas, retos y acciones para eventos o puntos de venta.',
            icon: Gamepad2,
            color: C.morado,
            slot: SLOT,
          },
          {
            titulo: 'Encuestas y votaciones',
            texto: 'Interacciones durante eventos para conocer opiniones, preferencias o satisfacción.',
            icon: Vote,
            color: C.morado,
            slot: SLOT,
          },
          {
            titulo: 'Presentaciones interactivas',
            texto: 'Catálogos, recorridos y presentaciones controladas por el usuario.',
            icon: MonitorPlay,
            color: C.morado,
            slot: SLOT,
          },
          {
            titulo: 'Experiencias a la medida',
            texto: 'Promociones, patrocinios y activaciones que combinan recursos según el objetivo.',
            icon: Sparkles,
            color: C.morado,
            slot: SLOT,
          },
        ],
      }}
      cierre={{
        h2: 'Crea una experiencia que invite a tu audiencia a participar y conectar con tu marca.',
        texto:
          'Cuéntanos dónde ocurrirá la interacción, a quién quieres involucrar y qué acción deseas generar. Diseñaremos la experiencia, la dinámica y la tecnología que mejor respondan al objetivo de tu marca.',
        ctaPrimary: 'Cuéntanos qué experiencia quieres crear',
        ctaPrimaryTo: BRIEF_EXPERIENCE,
        ctaSecondary: 'Conversar con GEC',
        ctaSecondaryHref: WHATSAPP,
      }}
    />
  );
}
