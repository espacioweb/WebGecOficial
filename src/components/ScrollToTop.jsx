import { useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { LenisContext } from '../context/LenisContext';

// Sin esto, navegar entre rutas con el router conserva la posición de scroll
// de la página anterior — normal en un SPA, pero desorientador al entrar a
// una página nueva a mitad de scroll. Usamos Lenis para el salto si está
// activo (respeta prefers-reduced-motion, que lo deja sin instanciar).
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const lenisRef = useContext(LenisContext);

  useEffect(() => {
    if (hash) return; // deja que el navegador resuelva el ancla (#contacto, etc.)
    const lenis = lenisRef?.current;
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [pathname, hash, lenisRef]);

  return null;
}
