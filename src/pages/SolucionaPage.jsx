import { CheckCircle2, Users, Settings2, Settings, Package, Wrench, Compass, Megaphone, ClipboardList, Wallet } from 'lucide-react';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { WHATSAPP } from '../data/site';
import { C } from '../data/gecIA';
import { P } from '../utils/textStyles';
import PilarPage, { SlotCard, HeroCharacter } from '../components/PilarPage';

const BRIEF_SOLUCIONA = '/cuentanos-tu-reto/?pilar=soluciona';
const SLOT = 'captura / video';

// SO-04 · Productos GEC: cuatro productos propios, con Agencia siempre con
// su descriptor completo (no usar "Meraki" como nombre del producto).
function BloqueProductosGEC() {
  const productos = [
    { titulo: 'Orienta', texto: 'Guía comercial para avanzar cada oportunidad.', icon: Compass, color: C.azul, slot: SLOT },
    { titulo: 'Agencia', texto: 'Sistema para la gestión del marketing digital.', icon: Megaphone, color: C.azul, slot: SLOT },
    {
      titulo: 'Gestor Operativo',
      texto: 'Control administrativo desde la cotización hasta el cobro.',
      icon: ClipboardList,
      color: C.azul,
      slot: SLOT,
    },
    {
      titulo: 'Bolsillo',
      texto: 'Fidelización para mantener activa la relación con el cliente.',
      icon: Wallet,
      color: C.azul,
      slot: SLOT,
    },
  ];
  return (
    <section id="productos-gec" className="border-t border-white/[.07] px-[clamp(20px,4vw,40px)] py-[clamp(56px,7vw,96px)]">
      <div className="mx-auto max-w-[1100px]">
        <h2
          className="m-0 mb-10 max-w-[26ch] text-[clamp(24px,3vw,36px)] leading-[1.15] font-bold text-white"
          style={{ ...P, letterSpacing: '-.02em' }}
        >
          Productos GEC.
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {productos.map((p) => (
            <SlotCard key={p.titulo} item={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function SolucionaPage() {
  useDocumentMeta({
    title: 'Soluciona — Plataformas y sistemas a la medida | Grupo Espacio Creativo',
    description:
      'Convertimos necesidades operativas en herramientas digitales que ordenan procesos, conectan información y facilitan decisiones.',
    path: '/soluciona/',
  });

  return (
    <PilarPage
      pilarId="p-soluciona"
      hero={{
        eyebrow: 'Soluciona',
        color: C.azul,
        h1: 'Soluciona',
        descriptor:
          'Convertimos necesidades operativas en herramientas digitales que ordenan procesos, conectan información y facilitan decisiones.',
        explicacion:
          'Analizamos cómo trabaja la empresa para configurar mejor sus plataformas, integrar herramientas, automatizar tareas o desarrollar soluciones a la medida cuando lo existente no responde a sus necesidades.',
        ctaPrimary: 'Optimiza tus procesos con tecnología',
        ctaPrimaryTo: BRIEF_SOLUCIONA,
        ctaSecondary: 'Explora nuestras soluciones',
        ctaSecondaryHref: '#areas',
        media: (
          <HeroCharacter img="/assets/pilares/soluciona.webp" video="/assets/videos/scene_5.mp4" focus={68} color={C.azul} alt="Meraki Soluciona" />
        ),
      }}
      valor={{
        h2: 'Soluciones digitales construidas desde la necesidad del negocio.',
        items: [
          { titulo: 'La solución adecuada', icon: CheckCircle2, color: C.azul, slot: SLOT },
          { titulo: 'Diseñada para quienes la utilizan', icon: Users, color: C.azul, slot: SLOT },
          { titulo: 'Criterio empresarial y técnico', icon: Settings2, color: C.azul, slot: SLOT },
        ],
      }}
      alcance={{
        h2: 'Distintas formas de construir la solución que necesita tu empresa.',
        items: [
          {
            titulo: 'Configuración de plataformas',
            texto: 'Setup Inteligente integra configuración, conexión y automatización de las plataformas que ya usas.',
            icon: Settings,
            color: C.azul,
            slot: SLOT,
          },
          {
            titulo: 'Productos con IA por GEC',
            icon: Package,
            color: C.azul,
            slot: SLOT,
            href: '#productos-gec',
            linkLabel: 'Ver los productos',
          },
          {
            titulo: 'Sistemas a la medida',
            texto: 'Cuando lo existente no responde, desarrollamos la solución desde cero.',
            icon: Wrench,
            color: C.azul,
            slot: SLOT,
          },
        ],
      }}
      extra={<BloqueProductosGEC />}
      cierre={{
        h2: 'No necesitas saber qué tecnología utilizar para comenzar.',
        ctaPrimary: 'Optimiza tus procesos con tecnología',
        ctaPrimaryTo: BRIEF_SOLUCIONA,
        ctaSecondary: 'Conversar con GEC',
        ctaSecondaryHref: WHATSAPP,
      }}
    />
  );
}
