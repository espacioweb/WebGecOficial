import { Compass, Megaphone, ClipboardList, Wallet, Image as ImageIcon } from 'lucide-react';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { WHATSAPP } from '../data/site';
import { C } from '../data/gecIA';
import { P } from '../utils/textStyles';
import PilarPage, { Eyebrow, HeroCharacter } from '../components/PilarPage';

const BRIEF_SOLUCIONA = '/cuentanos-tu-reto/?pilar=soluciona';

// SO-B · Tres formas de construir la solución, en orden de menor a mayor
// esfuerzo (Configurar → Adoptar → Desarrollar) — reemplaza el "Alcance"
// genérico de tarjetas con caja de media vacía. Texto tal cual el mockup del
// usuario ("Soluciona Landing v2"): el nivel + los 3 puntos comunican la
// escala de esfuerzo, y "cuándo conviene" ayuda a elegir sin tener que
// entender de tecnología primero.
const formas = [
  {
    nivel: 'CONFIGURAR',
    activos: 1,
    t: 'Configuración de plataformas',
    d: 'Setup Inteligente: integra, conecta y automatiza las plataformas que ya usas.',
    cuando: 'Conviene si ya tienes herramientas y no les sacas provecho.',
  },
  {
    nivel: 'ADOPTAR',
    activos: 2,
    t: 'Productos con IA por GEC',
    d: 'Sistemas listos para usar, creados por GEC para procesos comerciales y administrativos.',
    cuando: 'Conviene si tu proceso encaja con un producto existente.',
  },
  {
    nivel: 'DESARROLLAR',
    activos: 3,
    t: 'Sistemas a la medida',
    d: 'Cuando lo existente no responde, desarrollamos la solución desde cero.',
    cuando: 'Conviene si tu operación es única o muy específica.',
  },
];

function BloqueFormas() {
  return (
    <section id="formas" className="border-t border-white/[.07] px-[clamp(20px,4vw,40px)] py-[clamp(56px,7vw,96px)]">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-10">
        <div data-reveal className="flex max-w-[62ch] flex-col gap-4">
          <Eyebrow color={C.azul}>Cómo trabajamos</Eyebrow>
          <h2
            className="m-0 text-[clamp(24px,3vw,36px)] leading-[1.15] font-bold text-white"
            style={{ ...P, letterSpacing: '-.02em' }}
          >
            Tres formas de construir la solución que necesita tu empresa.
          </h2>
          <p className="m-0 max-w-[52ch] text-[15px] leading-[1.6]" style={{ ...P, color: 'rgba(242,239,233,.6)' }}>
            Empezamos por lo más simple. Solo desarrollamos desde cero cuando es necesario.
          </p>
        </div>
        <div data-reveal className="grid gap-4 sm:grid-cols-3">
          {formas.map((f) => (
            <div key={f.t} className="flex flex-col gap-5 rounded-2xl border border-white/[.08] bg-[#10161D] p-7">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold" style={{ ...P, letterSpacing: '.12em', color: C.azul }}>
                  {f.nivel}
                </span>
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-[5px] w-[16px] rounded-full"
                      style={{ background: i < f.activos ? C.azul : 'rgba(255,255,255,.14)' }}
                    />
                  ))}
                </div>
              </div>
              <h3 className="m-0 text-[19px] leading-[1.2] font-bold text-white" style={{ ...P, letterSpacing: '-.01em' }}>
                {f.t}
              </h3>
              <p className="m-0 flex-1 text-[13.5px] leading-[1.6]" style={{ ...P, color: 'rgba(242,239,233,.6)' }}>
                {f.d}
              </p>
              <span
                className="border-t border-white/[.08] pt-4 text-[12.5px] leading-[1.5]"
                style={{ ...P, color: 'rgba(242,239,233,.45)' }}
              >
                {f.cuando}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// SO-04 · Productos GEC: cuatro productos propios, con Agencia siempre con
// su descriptor completo (no usar "Meraki" como nombre del producto). El
// mockup pide media grande y real aquí ("aquí sí hacen falta imágenes, no un
// ícono con miniatura vacía") — sigue siendo un slot honesto (no hay
// capturas reales todavía), pero a todo el ancho de la tarjeta en vez de una
// caja lateral pequeña, listo para recibir las capturas cuando existan.
const productos = [
  { id: 'prod-orienta', titulo: 'Orienta', categoria: 'Comercial', texto: 'Guía comercial para avanzar cada oportunidad.', icon: Compass },
  { id: 'prod-agencia', titulo: 'Agencia', categoria: 'Marketing', texto: 'Sistema para la gestión del marketing digital.', icon: Megaphone },
  {
    id: 'prod-gestor',
    titulo: 'Gestor Operativo',
    categoria: 'Administración',
    texto: 'Control administrativo desde la cotización hasta el cobro.',
    icon: ClipboardList,
  },
  { id: 'prod-bolsillo', titulo: 'Bolsillo', categoria: 'Fidelización', texto: 'Fidelización para mantener activa la relación con el cliente.', icon: Wallet },
];

function BloqueProductosGEC() {
  return (
    <section id="productos" className="border-t border-white/[.07] bg-[#0A0E13]/60 px-[clamp(20px,4vw,40px)] py-[clamp(56px,7vw,96px)]">
      <div className="mx-auto max-w-[1100px]">
        <h2
          data-reveal
          className="m-0 mb-10 max-w-[26ch] text-[clamp(24px,3vw,36px)] leading-[1.15] font-bold text-white"
          style={{ ...P, letterSpacing: '-.02em' }}
        >
          Productos GEC.
        </h2>
        <div data-reveal className="grid gap-5 sm:grid-cols-2">
          {productos.map((p) => (
            <div key={p.titulo} className="flex flex-col overflow-hidden rounded-2xl border border-white/[.08] bg-[#10161D]">
              <div
                className="grid aspect-video place-items-center border-b border-dashed"
                style={{ borderColor: `${C.azul}55`, background: `linear-gradient(160deg, ${C.azul}14, transparent 75%)` }}
              >
                <div className="flex flex-col items-center gap-2 px-4 text-center">
                  <ImageIcon size={22} style={{ color: `${C.azul}99` }} />
                  <span className="text-[11.5px] leading-tight" style={{ ...P, color: 'rgba(242,239,233,.4)' }}>
                    captura de {p.titulo}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6">
                <div className="flex-1">
                  <div className="mb-1 flex flex-wrap items-baseline gap-2.5">
                    <h3 className="m-0 text-[19px] font-bold text-white" style={{ ...P, letterSpacing: '-.01em' }}>
                      {p.titulo}
                    </h3>
                    <span className="text-[12px] font-semibold" style={{ ...P, color: C.azul }}>
                      {p.categoria}
                    </span>
                  </div>
                  <p className="m-0 text-[13.5px] leading-[1.55]" style={{ ...P, color: 'rgba(242,239,233,.6)' }}>
                    {p.texto}
                  </p>
                </div>
                <span className="mt-1 flex-none text-[18px]" style={{ color: '#F5B301' }}>
                  →
                </span>
              </div>
            </div>
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
        // "Soluciona" pasa de H1 a etiqueta y el titular comunica el
        // beneficio — mismo tipo de mejora que ya se aplicó al hero de
        // Educa. Un solo párrafo (se retira `explicacion`) y CTA en fila,
        // texto tal cual el mockup del usuario ("Soluciona Landing v2").
        eyebrow: 'Soluciona · Plataformas y sistemas',
        color: C.azul,
        h1: (
          <>
            Herramientas digitales que <span style={{ color: C.azul }}>ordenan tu operación</span>
          </>
        ),
        descriptor: 'Configuramos tus plataformas, automatizamos tareas o desarrollamos a la medida cuando lo existente no alcanza.',
        ctaPrimary: 'Optimiza tus procesos',
        ctaPrimaryTo: BRIEF_SOLUCIONA,
        // Antes iba a "#areas" (Alcance genérico) — esa sección la reemplazó
        // "Formas" (#formas) y "Productos GEC" (#productos); el mockup lleva
        // el CTA secundario a Productos.
        ctaSecondary: 'Ver productos GEC',
        ctaSecondaryHref: '#productos',
        media: (
          <HeroCharacter img="/assets/pilares/soluciona.webp" video="/assets/videos/scene_5.mp4" focus={68} color={C.azul} alt="Meraki Soluciona" />
        ),
      }}
      valor={{
        h2: 'Soluciones digitales construidas desde la necesidad del negocio.',
        items: [
          {
            titulo: 'La solución adecuada',
            texto: 'Primero entendemos cómo trabaja tu empresa; después elegimos la herramienta.',
          },
          {
            titulo: 'Diseñada para quienes la utilizan',
            texto: 'Interfaces claras para el equipo que las usa todos los días.',
          },
          {
            titulo: 'Criterio empresarial y técnico',
            texto: 'Cada decisión considera costo, escalabilidad y mantenimiento.',
          },
        ],
      }}
      extra={
        <>
          <BloqueFormas />
          <BloqueProductosGEC />
        </>
      }
      cierre={{
        h2: 'No necesitas saber qué tecnología utilizar para comenzar.',
        texto: 'Cuéntanos cómo trabaja tu equipo y te decimos por dónde empezar.',
        ctaPrimary: 'Optimiza tus procesos',
        ctaPrimaryTo: BRIEF_SOLUCIONA,
        ctaSecondary: 'WhatsApp',
        ctaSecondaryHref: WHATSAPP,
      }}
    />
  );
}
