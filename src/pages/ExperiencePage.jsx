import { CalendarCheck, Gamepad2, Vote, MonitorPlay, Sparkles, Target, MousePointerClick, ClipboardList } from 'lucide-react';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { WHATSAPP } from '../data/site';
import { C } from '../data/gecIA';
import PilarPage, { B, HeroCharacter } from '../components/PilarPage';

const BRIEF_EXPERIENCE = '/cuentanos-tu-reto/?pilar=experience';

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
        // Copy "CAMBIOS WEBSITE GEC · octubre 2026" (lámina 27) — literal.
        descriptor: 'Una interacción puede llamar la atención y aun así perder la oportunidad de conectar.',
        explicacion: (
          <>
            Un evento, una activación o un punto de contacto tiene más valor cuando provoca una acción, facilita la
            participación y permite conocer mejor a la audiencia. En GEC diseñamos la dinámica, el contenido y la
            tecnología alrededor de ese objetivo para que la experiencia{' '}
            <B>no termine en el momento: deje participación, información y oportunidades para continuar la relación.</B>
          </>
        ),
        ctaPrimary: 'Cuéntanos qué quieres activar',
        ctaPrimaryTo: BRIEF_EXPERIENCE,
        ctaSecondary: 'Activa la participación de tu audiencia',
        ctaSecondaryHref: '#areas',
        media: (
          <HeroCharacter img="/assets/pilares/experience.webp" video="/assets/videos/scene_6.mp4" focus={80} color={C.morado} alt="Meraki Experience" />
        ),
      }}
      // Lámina 28.
      valor={{
        h2: 'Una experiencia funciona cuando la persona quiere participar y la marca sabe qué hacer después.',
        items: [
          {
            titulo: 'Tiene un propósito claro',
            icon: Target,
            texto: 'Cada interacción parte de una acción que queremos provocar: descubrir, responder, registrarse, elegir, participar o conectar.',
          },
          {
            titulo: 'Se siente fácil y natural',
            icon: MousePointerClick,
            texto: 'Diseñamos dinámicas intuitivas para que la tecnología facilite la experiencia en lugar de convertirse en una barrera.',
          },
          {
            titulo: 'Deja algo útil para continuar',
            icon: ClipboardList,
            texto: 'La interacción puede generar respuestas, preferencias o información que ayude a la marca a conocer mejor a su audiencia y dar el siguiente paso.',
          },
        ],
      }}
      // Lámina 29.
      alcance={{
        h2: 'Soluciones para convertir cada interacción en una oportunidad.',
        intro:
          'Elegimos la experiencia según lo que quieres provocar: organizar, activar, conocer, explicar o crear algo diferente para tu audiencia.',
        items: [
          {
            titulo: 'XP Event',
            lead: 'Para organizar mejor la experiencia de un evento.',
            texto: 'Integra invitación, registro, QR, asistencia, comunicación e información para seguimiento antes, durante y después.',
            icon: CalendarCheck,
            color: C.morado,
            href: 'https://xpevent.app',
            linkLabel: 'Conocer XP Event',
            // Login de la plataforma (ruta /auth de xpevent.app).
            sistema: { label: 'Ir al sistema', href: 'https://xpevent.app/auth' },
            // Promo de XP Event (dado por el usuario, oct. 2026), en dos
            // cortes: horizontal para escritorio y vertical para celular.
            // Codificados para web desde los .mov originales de ~139 MB
            // (que no entran al repo): 12.3 MB y 7.9 MB.
            video: {
              titulo: 'XP Event — Una experiencia de principio a fin',
              desktop: {
                src: '/assets/videos/xpevent-desktop.mp4',
                poster: '/assets/videos/xpevent-desktop-poster.webp',
              },
              celular: {
                src: '/assets/videos/xpevent-celular.mp4',
                poster: '/assets/videos/xpevent-celular-poster.webp',
              },
            },
          },
          {
            titulo: 'Juegos y dinámicas',
            lead: 'Para pasar de observar a participar.',
            texto: 'Trivias, ruletas, retos y otras dinámicas que activan a la audiencia y generan momentos de interacción con la marca.',
            icon: Gamepad2,
            color: C.morado,
          },
          {
            titulo: 'Encuestas y votaciones',
            lead: 'Para escuchar mientras la experiencia está ocurriendo.',
            texto: 'Recoge opiniones, preferencias y respuestas que ayudan a conocer mejor a la audiencia y tomar decisiones con información.',
            icon: Vote,
            color: C.morado,
          },
          {
            titulo: 'Presentaciones interactivas',
            lead: 'Para que las personas exploren la información, no solo la reciban.',
            texto: 'Creamos catálogos, recorridos y presentaciones interactivas para eventos, puntos de venta y otros espacios de marca.',
            icon: MonitorPlay,
            color: C.morado,
          },
          {
            titulo: 'Experiencias a la medida',
            lead: 'Cuando la idea necesita algo que todavía no existe.',
            texto: 'Combinamos dinámicas, contenido y tecnología para desarrollar activaciones, promociones o experiencias según un objetivo específico.',
            icon: Sparkles,
            color: C.morado,
          },
        ],
      }}
      cierre={{
        // Lámina 30.
        h2: 'Haz que cada punto de contacto deje algo más que un buen momento.',
        texto:
          'Cuéntanos dónde ocurrirá, con quién quieres conectar y qué quieres lograr. En GEC definimos la dinámica y los recursos necesarios para convertir esa oportunidad en una experiencia que tenga sentido para tu marca.',
        ctaPrimary: 'Diseñemos la experiencia',
        ctaPrimaryTo: BRIEF_EXPERIENCE,
        ctaSecondary: 'Conversar con GEC',
        ctaSecondaryHref: WHATSAPP,
      }}
    />
  );
}
