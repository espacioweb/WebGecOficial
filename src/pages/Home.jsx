import { useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../components/Hero';
import { LenisContext } from '../context/LenisContext';
import { irATarjeta } from '../utils/retorno';
import useDocumentMeta from '../hooks/useDocumentMeta';
import ScrollRail from '../components/ScrollRail';
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
//
// El panel GEC IA (`PanelEduca`, catálogo detrás de un formulario de correo)
// se desactivó a pedido del usuario (2026-09-27). `PanelEduca.jsx`,
// `GateForm.jsx` y `/api/otp/*` siguen intactos. Para reactivarlo: devolver
// `panel`/`ctaLabel` al pilar Educa en site.js, montar <PanelEduca open
// onClose /> aquí con un `useState`, pasar `onOpenPanel` a <Pilares /> y
// parar Lenis mientras esté abierto (`lenis.stop()`/`start()`).
//
// Pilares (2026-09-28): el usuario pidió quitar "los bloques con personajes"
// y se entendió como la sección entera — se sacó del Home. Corregido el
// mismo día: el pedido real era solo quitar las pastillas con texto (los
// chips `b.items`) dentro de cada tarjeta, no la sección. Pilares vuelve al
// render; las pastillas se quitaron dentro de `Sections.jsx` (ver ahí). El
// hito "Ecosistema" del riel y los enlaces "Nosotros"/"Ecosistema" de
// footer/nav vuelven también (ver site.js/ScrollRail.jsx).

export default function Home() {
  const { state } = useLocation();
  const lenisRef = useContext(LenisContext);

  // Mismo título/descripción que index.html. Sin esto, al volver al Home
  // desde una página de pilar la pestaña seguía diciendo "Educa — …" (el SPA
  // no recarga el <head>).
  useDocumentMeta({
    title: 'Grupo Espacio Creativo — Crecimiento Creativo Empresarial',
    description:
      'Ayudamos a las empresas a crecer desde adentro hacia afuera con estrategia, producción, formación, soluciones y experiencias en un solo ecosistema. Tegucigalpa, Honduras.',
    path: '/',
  });

  // "Volver a <pilar>" desde una página de pilar (VolverAlHome en
  // PilarPage.jsx) llega con `state.volverA` = id de la tarjeta: se baja
  // hasta ella en vez de quedarse en el inicio. Se limpia el state del
  // historial para que recargar la página no repita el salto.
  useEffect(() => {
    const id = state?.volverA;
    if (!id) return;
    irATarjeta(id, lenisRef?.current);
    window.history.replaceState({ ...window.history.state, usr: null }, '');
  }, [state, lenisRef]);

  return (
    <>
      <ScrollRail />
      <main>
        <Hero />
        <Manifiesto />
        <Pilares />
        <BriefCTA />
        <Autoridad />
        <Familia />
        <Contacto />
      </main>
    </>
  );
}
