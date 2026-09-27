import Hero from '../components/Hero';
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

export default function Home() {
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
