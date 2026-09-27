import { useContext, useEffect, useState } from 'react';
import { LenisContext } from '../context/LenisContext';
import Hero from '../components/Hero';
import ScrollRail from '../components/ScrollRail';
import PanelEduca from '../components/PanelEduca';
import {
  Manifiesto,
  Pilares,
  BriefCTA,
  Autoridad,
  Familia,
  Contacto,
} from '../components/Sections';

// Marcas y Testimonios quedan fuera del render: la guía prohíbe mostrar
// testimonios sin ser reales y autorizados, y marcas/logos sin autorización
// confirmada — ninguno de los dos existe todavía (ver CLAUDE.md, "Riesgo de
// contenido sin autorizar"). El componente y los datos siguen en
// `Sections.jsx`/`site.js` sin tocar: reactivarlos es solo reinsertar estas
// dos líneas cuando GEC entregue testimonios y logos reales.
//
// ValorHorizontal (las "6 fuerzas" en inglés, con fotos de stock genéricas)
// quedó reemplazado por Autoridad (H-05 de la guía): mismo criterio, el
// componente y sus datos (`fuerzas`) siguen intactos en Sections.jsx/site.js
// por si algún día se necesita ese formato de nuevo.
//
// InsideYourBrand y Portafolio quedaron ocultos a pedido del usuario
// (2026-09-21) — ninguno de los dos calza con el contenido aprobado de la
// guía (InsideYourBrand no trae los 4 tipos aprobados; Portafolio usa la
// palabra "Blog", que la guía prohíbe, y fotos de stock genéricas). Código y
// datos siguen intactos en Sections.jsx/site.js.

export default function Home() {
  const lenisRef = useContext(LenisContext);
  const [panel, setPanel] = useState(null);

  // El panel del catálogo GEC IA bloquea el scroll de fondo mientras está abierto.
  useEffect(() => {
    const lenis = lenisRef?.current;
    if (!lenis) return;
    if (panel) lenis.stop();
    else lenis.start();
  }, [panel, lenisRef]);

  return (
    <>
      <ScrollRail />
      <main>
        <Hero />
        <Manifiesto />
        <Pilares onOpenPanel={setPanel} />
        <BriefCTA />
        <Autoridad />
        <Familia />
        <Contacto />
      </main>
      <PanelEduca open={panel === 'educa'} onClose={() => setPanel(null)} />
    </>
  );
}
