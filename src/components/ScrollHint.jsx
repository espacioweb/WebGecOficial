const P = { fontFamily: 'Poppins, sans-serif' };

/**
 * Indicador de scroll.
 *
 * Va en las secciones donde el avance NO es evidente: el hero y las dos de
 * tarjetas que se mueven en horizontal pero se conducen con scroll vertical.
 * Sin esto la gente se queda mirando la tarjeta esperando poder arrastrarla.
 *
 * Tres señales sumadas, porque una sola se pasa por alto: la rueda cayendo
 * dentro de la cápsula, las flechas latiendo en cascada hacia abajo, y el halo
 * respirando alrededor. `prefers-reduced-motion` las apaga todas (la regla
 * global de index.css) y queda un icono quieto, que sigue comunicando.
 */
export default function ScrollHint({ label = 'Desliza', className = '', tone = 'light' }) {
  const color = tone === 'light' ? 'rgba(237,234,228,.55)' : 'rgba(11,11,12,.55)';

  return (
    <div
      className={`pointer-events-none flex flex-col items-center gap-2.5 ${className}`}
      aria-hidden="true"
    >
      {label && (
        <span
          className="text-[10px] whitespace-nowrap uppercase"
          style={{ ...P, letterSpacing: '.3em', color }}
        >
          {label}
        </span>
      )}

      {/* Cápsula tipo rueda de ratón */}
      <span
        className="relative flex h-[34px] w-[21px] justify-center rounded-full border pt-[6px]"
        style={{
          borderColor: 'rgba(245,179,1,.45)',
          background: 'rgba(245,179,1,.05)',
          animation: 'gecScrollHalo 2.4s ease-out infinite',
        }}
      >
        <span
          className="block h-[5px] w-[3px] rounded-full bg-[#F5B301]"
          style={{ animation: 'gecScrollDot 2.4s cubic-bezier(.4,0,.2,1) infinite' }}
        />
      </span>

      {/* Dos flechas en cascada: marcan dirección, no solo presencia */}
      <span className="-mt-0.5 flex flex-col items-center">
        {[0, 1].map((i) => (
          <svg
            key={i}
            width="11"
            height="7"
            viewBox="0 0 11 7"
            fill="none"
            className="-mb-[3px]"
            style={{
              animation: 'gecScrollChevron 2.4s ease-in-out infinite',
              animationDelay: `${i * 0.22}s`,
            }}
          >
            <path
              d="M1 1L5.5 5.5L10 1"
              stroke="#F5B301"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ))}
      </span>
    </div>
  );
}
