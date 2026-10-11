import { useContext, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { LenisContext } from '../context/LenisContext';
import { BriefForm } from '../pages/BriefPage';
import { P } from '../utils/textStyles';

export default function ProgramaModal({ titulo, pilar = '', tema = '', onClose, opener }) {
  const dialogRef = useRef(null);
  const lenisRef = useContext(LenisContext);

  useEffect(() => {
    const dialog = dialogRef.current;
    const origen = opener ?? document.activeElement;
    const lenis = lenisRef?.current;
    const yaDetenido = lenis?.isStopped;
    const overflow = document.body.style.overflow;
    const padding = document.body.style.paddingRight;
    const anchoBarra = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (anchoBarra) document.body.style.paddingRight = `${anchoBarra}px`;
    lenis?.stop();
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = padding;
      if (!yaDetenido) lenis?.start();
      if (origen?.isConnected) origen.focus({ preventScroll: true });
    };
  }, [lenisRef, opener]);

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby="programa-modal-titulo"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
      }}
      className="programa-modal fixed inset-0 m-auto w-[calc(100%-32px)] max-w-[1100px] max-h-[90dvh] overflow-hidden rounded-[24px] border border-white/25 bg-[#222831] p-0 text-[#EDEAE4] shadow-[0_32px_100px_rgba(0,0,0,.8),0_0_0_1px_rgba(255,255,255,.06)] backdrop:bg-black/85 backdrop:backdrop-blur-[12px]"
      style={P}
    >
      <div className="flex max-h-[90dvh] flex-col">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/20 bg-[#2B323C] px-5 py-4 sm:px-8">
          <h2 id="programa-modal-titulo" className="m-0 text-[clamp(18px,2vw,24px)] font-bold leading-tight">{titulo}</h2>
          <button
            type="button"
            autoFocus
            aria-label="Cerrar formulario"
            onClick={onClose}
            className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full border border-white/20 text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5B301]"
          >
            <X size={22} aria-hidden="true" />
          </button>
        </header>
        <div data-programa-scroll data-lenis-prevent className="min-h-0 overflow-y-auto overscroll-contain">
          <BriefForm embedded pilar={pilar} tema={tema} />
        </div>
      </div>
    </dialog>,
    document.body,
  );
}
