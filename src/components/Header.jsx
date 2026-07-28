const PILL =
  'rounded-full border border-white/10 bg-[rgba(12,12,14,0.55)] backdrop-blur-[14px]';

function Burger({ open, onClick }) {
  const bar =
    'block h-[1.5px] w-[18px] rounded-full bg-current transition-transform duration-300 [transition-timing-function:cubic-bezier(.22,1,.36,1)]';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
      aria-expanded={open}
      className={`${PILL} grid h-[52px] w-[52px] cursor-pointer place-items-center transition-colors duration-300`}
      style={{
        borderColor: open ? 'rgba(245,179,1,.6)' : undefined,
        color: open ? '#F5B301' : 'rgba(237,234,228,.9)',
      }}
    >
      <span className="flex flex-col items-center gap-[5px]">
        <span
          className={bar}
          style={{ transform: open ? 'translateY(3.25px) rotate(45deg)' : 'none' }}
        />
        <span
          className={bar}
          style={{ transform: open ? 'translateY(-3.25px) rotate(-45deg)' : 'none' }}
        />
      </span>
    </button>
  );
}

export default function Header({ menuOpen, onToggleMenu }) {
  return (
    // Contenedor transparente: cada elemento flota como isla, sin barra central.
    <header className="pointer-events-none fixed top-[18px] left-1/2 z-[130] flex w-[min(1560px,calc(100vw-40px))] -translate-x-1/2 items-center justify-between gap-4">
      <a
        href="#top"
        className={`${PILL} pointer-events-auto flex items-center px-6 py-3.5`}
        aria-label="Grupo Espacio Creativo — inicio"
      >
        <img
          src="/logos/gec-invertido.png"
          alt="Grupo Espacio Creativo"
          className="block h-[26px] w-auto opacity-95"
        />
      </a>

      <div className="pointer-events-auto flex items-center gap-2.5">
        <a
          href="#contacto"
          className="rounded-full px-7 py-[15px] text-[13.5px] font-semibold text-[#0B0B0C] transition-colors duration-300 hover:bg-[#FFD24A]"
          style={{ background: '#F5B301', fontFamily: 'Poppins, sans-serif' }}
        >
          Hablemos
        </a>
        <Burger open={menuOpen} onClick={onToggleMenu} />
      </div>
    </header>
  );
}
