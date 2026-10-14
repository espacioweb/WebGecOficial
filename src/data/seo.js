// Fuente única de título, descripción y ruta de cada página pública.
//
// La leen dos lados, y por eso vive en un módulo de datos puro (sin JSX):
//  · las páginas, vía useDocumentMeta, para fijar el <head> en el navegador;
//  · scripts/postbuild.mjs, que al compilar escribe un HTML por ruta con ese
//    mismo <head> y genera sitemap.xml. Así Google ve el título, la
//    descripción y el canonical correctos desde el HTML inicial, sin depender
//    de ejecutar JavaScript (antes toda URL arrancaba diciendo ser el Home).
//
// Para agregar una página: una entrada aquí + su <Route> en App.jsx. El
// sitemap y el HTML estático salen solos en el siguiente build.
// `fuentes` = archivos que, al cambiar, cambian la página; se usan para
// calcular el <lastmod> del sitemap con git.

export const SITE_URL = 'https://grupoespaciocreativo.com';

export const RUTAS = [
  {
    path: '/',
    title: 'Grupo Espacio Creativo — Crecimiento Creativo Empresarial',
    description:
      'Ayudamos a las empresas a crecer desde adentro hacia afuera con estrategia, producción, formación, soluciones y experiencias en un solo ecosistema. Tegucigalpa, Honduras.',
    priority: '1.0',
    fuentes: ['src/pages/Home.jsx', 'src/components/Sections.jsx', 'src/components/Hero.jsx'],
  },
  {
    path: '/marketing/',
    title: 'Marketing — Estrategia y comunicación | Grupo Espacio Creativo',
    description: 'Estrategia y comunicación para impulsar el negocio y construir marcas sólidas.',
    priority: '0.8',
    fuentes: ['src/pages/MarketingPage.jsx', 'src/components/PilarPage.jsx'],
  },
  {
    path: '/studio/',
    title: 'Studio — Producción visual y audiovisual | Grupo Espacio Creativo',
    description:
      'Producimos ideas con criterio y las convertimos en soluciones visuales y audiovisuales que agregan valor a la marca.',
    priority: '0.8',
    fuentes: ['src/pages/StudioPage.jsx', 'src/components/PilarPage.jsx'],
  },
  {
    path: '/educa/',
    title: 'Educa — Formación en IA y crecimiento creativo | Grupo Espacio Creativo',
    description:
      'Formación para adoptar la IA y desarrollar habilidades estratégicas, creativas y tecnológicas que impulsen el crecimiento creativo empresarial.',
    priority: '0.8',
    fuentes: ['src/pages/EducaPage.jsx', 'src/components/PilarPage.jsx'],
  },
  {
    path: '/soluciona/',
    title: 'Soluciona — Plataformas y sistemas a la medida | Grupo Espacio Creativo',
    description:
      'Convertimos necesidades operativas en herramientas digitales que ordenan procesos, conectan información y facilitan decisiones.',
    priority: '0.8',
    fuentes: ['src/pages/SolucionaPage.jsx', 'src/components/PilarPage.jsx'],
  },
  {
    path: '/experience/',
    title: 'Experience — Eventos y experiencias interactivas | Grupo Espacio Creativo',
    description:
      'Creamos experiencias interactivas para eventos, puntos de venta y entornos digitales que conectan a las marcas con las personas.',
    priority: '0.8',
    fuentes: ['src/pages/ExperiencePage.jsx', 'src/components/PilarPage.jsx'],
  },
  {
    path: '/inside-your-brand/',
    title: 'Inside Your Brand — Centro de conocimiento e innovación | Grupo Espacio Creativo',
    description:
      'Conocimiento para comprender el cambio, tomar mejores decisiones y descubrir nuevas posibilidades de crecimiento para las marcas.',
    priority: '0.7',
    fuentes: ['src/pages/InsideYourBrandPage.jsx'],
  },
  {
    path: '/cuentanos-tu-reto/',
    title: 'Cuéntanos qué necesita tu empresa | Grupo Espacio Creativo',
    description:
      'Responde unas preguntas breves y te orientamos hacia la solución de GEC más adecuada. Menos de 90 segundos.',
    priority: '0.6',
    fuentes: ['src/pages/BriefPage.jsx'],
  },
];

export const META = Object.fromEntries(RUTAS.map((r) => [r.path, r]));

// Página 404: sin canonical y fuera del sitemap. Su <head> lo pone el script
// de postbuild y useDocumentMeta (noindex) al montarse NotFoundPage.
export const META_404 = {
  title: 'Página no encontrada | Grupo Espacio Creativo',
  description: 'La página que buscas no existe o cambió de dirección.',
};
