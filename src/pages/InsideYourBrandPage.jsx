import { useState } from 'react';
import { Lightbulb, Wrench, MessagesSquare, Sparkles, FileQuestion } from 'lucide-react';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { WHATSAPP, insideVideo, iybVideosSeed } from '../data/site';
import { P } from '../utils/textStyles';
import { Eyebrow, CtaPrimary, CtaSecondary } from '../components/PilarPage';
import VideoCarousel from '../components/VideoCarousel';
import useCanalVideos from '../hooks/useCanalVideos';
import { track } from '../utils/analytics';

const DORADO = '#F5B301';

// IYB-02 · Tipos de contenido — contenido aprobado, textual.
const TIPOS = [
  { titulo: 'Ideas para crecer', icon: Lightbulb },
  { titulo: 'Herramientas para aplicar', icon: Wrench },
  { titulo: 'Conversaciones', icon: MessagesSquare },
  { titulo: 'Innovaciones con nuestros clientes', icon: Sparkles },
];

// IYB-02 · Temas — contenido aprobado, textual.
const TEMAS = ['Marketing', 'Marca', 'Creatividad', 'Inteligencia artificial', 'Tecnología', 'Liderazgo', 'Crecimiento empresarial'];

function TipoCard({ titulo, icon: Icon }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/[.08] bg-[#10161D] p-6">
      <div className="grid h-11 w-11 flex-none place-items-center rounded-xl" style={{ background: `${DORADO}29`, color: DORADO }}>
        <Icon size={20} strokeWidth={2} />
      </div>
      <div className="text-[15px] font-bold text-white" style={P}>
        {titulo}
      </div>
    </div>
  );
}

// Sin publicaciones ni innovaciones reales todavía (ver CLAUDE.md) — en vez
// de simular tarjetas de contenido que no existe, se muestra un estado
// honesto con el mismo lenguaje visual de slot punteado que usan las
// páginas de pilar para media pendiente.
function EstadoVacio({ texto }) {
  return (
    <div
      className="flex flex-col items-center gap-3 rounded-2xl border border-dashed p-10 text-center"
      style={{ borderColor: `${DORADO}40`, background: `linear-gradient(160deg, ${DORADO}0d, transparent 75%)` }}
    >
      <FileQuestion size={26} style={{ color: `${DORADO}99` }} />
      <p className="m-0 max-w-[46ch] text-[13.5px] leading-[1.7]" style={{ ...P, color: 'rgba(242,239,233,.55)' }}>
        {texto}
      </p>
    </div>
  );
}

function BloqueComunidad() {
  const [correo, setCorreo] = useState('');
  const [estado, setEstado] = useState('idle'); // idle · enviando · ok · error

  const suscribir = async (e) => {
    e.preventDefault();
    if (estado === 'enviando' || estado === 'ok') return;
    setEstado('enviando');
    track('iyb_subscription_clicked');
    try {
      const res = await fetch('/api/suscribir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo }),
      });
      if (!res.ok) throw new Error('correo');
      setEstado('ok');
    } catch {
      setEstado('error');
    }
  };

  return (
    <section id="comunidad" className="border-t border-white/[.07] px-[clamp(20px,4vw,40px)] py-[clamp(56px,7vw,96px)]">
      <div className="mx-auto max-w-[760px] text-center">
        <h2 className="m-0 mb-8 text-[clamp(24px,3vw,36px)] leading-[1.15] font-bold text-white" style={{ ...P, letterSpacing: '-.02em' }}>
          Sigue descubriendo nuevas formas de hacer crecer tu marca.
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-3.5">
          <CtaSecondary href={WHATSAPP}>Unirme al canal</CtaSecondary>
          <CtaSecondary href={insideVideo.channelUrl}>Ver en YouTube</CtaSecondary>
        </div>

        <form onSubmit={suscribir} className="mx-auto mt-8 flex max-w-[420px] flex-wrap items-center justify-center gap-2.5">
          {estado === 'ok' ? (
            <p className="m-0 text-[13.5px] font-medium" style={{ ...P, color: DORADO }}>
              Listo — te avisaremos por correo.
            </p>
          ) : (
            <>
              <input
                type="email"
                required
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="tu@correo.com"
                aria-label="Correo electrónico"
                className="min-w-0 flex-1 rounded-full border border-white/20 bg-transparent px-5 py-3 text-[14px] text-white placeholder:text-white/35 focus:border-white/40 focus:outline-none"
                style={P}
              />
              <button
                type="submit"
                disabled={estado === 'enviando'}
                className="cursor-pointer rounded-full px-6 py-3 text-[14px] font-bold text-[#10131A] transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-60"
                style={{ ...P, background: DORADO }}
              >
                {estado === 'enviando' ? 'Enviando…' : 'Suscribirme'}
              </button>
            </>
          )}
        </form>
        {estado === 'error' && (
          <p className="m-0 mt-3 text-[12.5px]" style={{ ...P, color: 'rgba(242,239,233,.5)' }}>
            No se pudo enviar. Intenta de nuevo en un momento.
          </p>
        )}
      </div>
    </section>
  );
}

export default function InsideYourBrandPage() {
  const videos = useCanalVideos(iybVideosSeed);

  useDocumentMeta({
    title: 'Inside Your Brand — Centro de conocimiento e innovación | Grupo Espacio Creativo',
    description:
      'Conocimiento para comprender el cambio, tomar mejores decisiones y descubrir nuevas posibilidades de crecimiento para las marcas.',
    path: '/inside-your-brand/',
  });

  return (
    <main className="bg-[#0A0E13]" style={{ paddingTop: '110px' }}>
      {/* IYB-01 · Hero */}
      <section className="px-[clamp(20px,4vw,40px)] pt-[clamp(20px,4vw,40px)] pb-[clamp(56px,7vw,96px)]">
        <div className="mx-auto max-w-[820px] text-center">
          <Eyebrow color={DORADO}>Centro de conocimiento e innovación de Grupo Espacio Creativo</Eyebrow>
          <h1
            className="m-0 mt-4 mb-6 text-[clamp(34px,5.4vw,60px)] leading-[1.08] font-extrabold text-white"
            style={{ ...P, letterSpacing: '-.03em' }}
          >
            Inside Your Brand
          </h1>
          <p className="m-0 mb-10 text-[15.5px] leading-[1.75]" style={{ ...P, color: 'rgba(242,239,233,.68)' }}>
            Conocimiento para comprender el cambio, tomar mejores decisiones y descubrir nuevas posibilidades de crecimiento para las
            marcas.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3.5">
            <CtaPrimary to="#tipos" color={DORADO}>
              Explora los contenidos
            </CtaPrimary>
            <CtaSecondary href="#innovaciones">Conoce nuestras innovaciones</CtaSecondary>
          </div>
        </div>
      </section>

      {/* IYB-02 · Tipos de contenido */}
      <section id="tipos" className="border-t border-white/[.07] px-[clamp(20px,4vw,40px)] py-[clamp(56px,7vw,96px)]">
        <div className="mx-auto max-w-[1100px]">
          <h2 className="m-0 mb-10 max-w-[28ch] text-[clamp(24px,3vw,36px)] leading-[1.15] font-bold text-white" style={{ ...P, letterSpacing: '-.02em' }}>
            Conocimiento para comprender, aplicar y crear.
          </h2>
          <div className="mb-10 grid gap-4 sm:grid-cols-2">
            {TIPOS.map((t) => (
              <TipoCard key={t.titulo} {...t} />
            ))}
          </div>
          <Eyebrow>Temas</Eyebrow>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {TEMAS.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/[.12] px-4 py-2 text-[13px] font-medium text-[#EDEAE4]"
                style={P}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* IYB-03 · Archivo — episodios reales del canal de YouTube (ver
          functions/api/youtube.js: se leen solos del feed del canal, un
          episodio nuevo aparece en la siguiente visita sin tocar código) */}
      <section id="archivo" className="border-t border-white/[.07] px-[clamp(20px,4vw,40px)] py-[clamp(56px,7vw,96px)]">
        <div className="mx-auto max-w-[1100px]">
          <Eyebrow color={DORADO}>Archivo</Eyebrow>
          <h2 className="m-0 mt-4 mb-10 max-w-[28ch] text-[clamp(22px,2.6vw,30px)] leading-[1.2] font-bold text-white" style={{ ...P, letterSpacing: '-.02em' }}>
            Publicaciones destacadas y recientes.
          </h2>
          <VideoCarousel videos={videos} color={DORADO} />
        </div>
      </section>

      {/* IYB-04 · Innovaciones — sin casos reales autorizados todavía */}
      <section id="innovaciones" className="border-t border-white/[.07] px-[clamp(20px,4vw,40px)] py-[clamp(56px,7vw,96px)]">
        <div className="mx-auto max-w-[1100px]">
          <Eyebrow color={DORADO}>Innovaciones con nuestros clientes</Eyebrow>
          <h2 className="m-0 mt-4 mb-10 max-w-[28ch] text-[clamp(22px,2.6vw,30px)] leading-[1.2] font-bold text-white" style={{ ...P, letterSpacing: '-.02em' }}>
            Soluciones reales que construimos junto a nuestros clientes.
          </h2>
          <EstadoVacio texto="Todavía no tenemos casos publicados con autorización de nuestros clientes. En cuanto los tengamos, aparecerán aquí con su contexto, reto y resultado." />
        </div>
      </section>

      {/* IYB-06 · Comunidad */}
      <BloqueComunidad />
    </main>
  );
}
