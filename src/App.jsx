import { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './utils/gsapSetup';
import { LenisContext } from './context/LenisContext';
import Header from './components/Header';
import NavOverlay from './components/NavOverlay';
import { Footer } from './components/Sections';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import MarketingPage from './pages/MarketingPage';
import StudioPage from './pages/StudioPage';
import EducaPage from './pages/EducaPage';
import SolucionaPage from './pages/SolucionaPage';
import ExperiencePage from './pages/ExperiencePage';
import BriefPage from './pages/BriefPage';
import InsideYourBrandPage from './pages/InsideYourBrandPage';
import { initAnalytics } from './utils/analytics';

function App() {
  const lenisRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Sin Measurement ID configurado (VITE_GA_MEASUREMENT_ID) no hace nada —
  // ver src/utils/analytics.js.
  useEffect(() => {
    initAnalytics();
  }, []);

  // Lenis + GSAP, una sola vez para todo el sitio.
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

  // El menú a pantalla completa bloquea el scroll de fondo.
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (menuOpen) lenis.stop();
    else lenis.start();
  }, [menuOpen]);

  return (
    <BrowserRouter>
      <LenisContext.Provider value={lenisRef}>
        <ScrollToTop />
        <Header menuOpen={menuOpen} onToggleMenu={() => setMenuOpen((v) => !v)} />
        <NavOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/marketing/" element={<MarketingPage />} />
          <Route path="/studio/" element={<StudioPage />} />
          <Route path="/educa/" element={<EducaPage />} />
          <Route path="/soluciona/" element={<SolucionaPage />} />
          <Route path="/experience/" element={<ExperiencePage />} />
          <Route path="/cuentanos-tu-reto/" element={<BriefPage />} />
          <Route path="/inside-your-brand/" element={<InsideYourBrandPage />} />
        </Routes>
        <Footer />
      </LenisContext.Provider>
    </BrowserRouter>
  );
}

export default App;
