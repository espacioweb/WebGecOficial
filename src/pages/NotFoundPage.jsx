import { Link } from 'react-router-dom';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { META_404 } from '../data/seo';
import { P } from '../utils/textStyles';

// Destino de cualquier dirección que no existe. Con el HTML por página que
// genera el build, Cloudflare Pages responde estas direcciones con estado 404
// real (antes devolvían el Home con 200 y Google las contaba como "soft 404").
// noindex para que, aun si algún día se sirviera con 200, no se indexe.
export default function NotFoundPage() {
  useDocumentMeta({ ...META_404, noindex: true });

  return (
    <main
      className="flex min-h-[70dvh] flex-col items-start justify-center gap-6 bg-[#0A0E13] px-[clamp(24px,5vw,90px)] pt-[130px] pb-[clamp(56px,7vw,96px)]"
    >
      <div className="mx-auto w-full max-w-[1100px]">
        <p className="m-0 mb-4 text-[12px] font-semibold uppercase" style={{ ...P, letterSpacing: '.34em', color: '#F5B301' }}>
          404
        </p>
        <h1
          className="m-0 mb-8 text-[clamp(32px,5vw,64px)] leading-[1.05] font-bold text-white"
          style={{ ...P, letterSpacing: '-.03em' }}
        >
          Página no encontrada
        </h1>
        <Link
          to="/"
          className="inline-block rounded-full bg-[#F5B301] px-7 py-[15px] text-sm font-semibold text-[#0B0B0C] transition-colors hover:bg-[#FFD24A]"
          style={P}
        >
          Ir al inicio
        </Link>
      </div>
    </main>
  );
}
