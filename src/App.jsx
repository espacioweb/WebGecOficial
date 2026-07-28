import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './utils/gsapSetup';
import Header from './components/Header';
import Hero from './components/Hero';
import NavOverlay from './components/NavOverlay';
import ScrollRail from './components/ScrollRail';
import PanelEduca from './components/PanelEduca';
import {
  Manifiesto,
  Pilares,
  InsideYourBrand,
  ValorHorizontal,
  Portafolio,
  Marcas,
  Testimonios,
  Familia,
  Contacto,
  Footer,
} from './components/Sections';

function App() {
  const lenisRef = useRef(null);
  const [panel, setPanel] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Lenis + GSAP
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return undefined;

    const lenis = new Lenis({ autoRaf: false });
    lenisRef.current = lenis;
    const onTick = (time) => lenis.raf(time * 1000);

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Las secciones se montan con imágenes y videos que aún no cargaron, así que
  // la altura del documento sigue creciendo después del primer render y los
  // ScrollTrigger quedan calculados sobre posiciones viejas. Refrescamos al
  // terminar la carga y ante cualquier cambio real de tamaño.
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();

    const t = setTimeout(refresh, 600);
    window.addEventListener('load', refresh);

    const ro = new ResizeObserver(() => {
      clearTimeout(ro._t);
      ro._t = setTimeout(refresh, 150);
    });
    ro.observe(document.body);

    return () => {
      clearTimeout(t);
      window.removeEventListener('load', refresh);
      ro.disconnect();
    };
  }, []);

  // El panel y el menú bloquean el scroll de fondo
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (panel || menuOpen) lenis.stop();
    else lenis.start();
  }, [panel, menuOpen]);

  return (
    <>
      <Header menuOpen={menuOpen} onToggleMenu={() => setMenuOpen((v) => !v)} />
      <NavOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
      <ScrollRail />
      <main>
        <Hero />
        <Manifiesto />
        <Pilares onOpenPanel={setPanel} />
        <InsideYourBrand />
        <ValorHorizontal />
        <Portafolio />
        <Marcas />
        <Testimonios />
        <Familia />
        <Contacto />
      </main>
      <Footer />
      <PanelEduca open={panel === 'educa'} onClose={() => setPanel(null)} />
    </>
  );
}

export default App;
