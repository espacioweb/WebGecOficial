// Contenido del sitio GEC — extraído del bosquejo
// "Estructura Hero con Personajes Meraki/GEC Website.dc.html"

export const brand = {
  accent: '#F5B301',
  accentSoft: '#FFD24A',
  ink: '#EDEAE4',
  bg: '#060607',
  navy: '#13314F',
};

const dark = (bg) => ({
  bg,
  fg: '#FFFFFF',
  muted: 'rgba(237,234,228,.6)',
  meta: 'rgba(255,255,255,.45)',
  chipBg: 'rgba(255,255,255,.06)',
  chipBorder: 'rgba(255,255,255,.14)',
});

export const heroSteps = [
  { kicker: 'Grupo Espacio Creativo', hint: 'Desliza para encender la idea' },
  { text: 'El crecimiento que buscas ', em: 'afuera' },
  { text: 'inicia cuando lo construyes' },
  { text: 'desde adentro.' },
];

export const pilares = [
  {
    id: 'p-marketing',
    ruta: '/marketing/',
    solid: '#1A0F06',
    num: '01',
    kicker: 'Pilar uno',
    name: 'Marketing',
    scene: 2,
    // Centro horizontal del personaje dentro del cuadro 16:9. En móvil el
    // video va en una franja vertical y `cover` recorta por los lados: sin
    // este encuadre el personaje queda fuera de cámara.
    // Este es el que más se desplaza dentro del bucle — estira el brazo para
    // enseñar el teléfono y vuelve —, así que el valor cubre TODO el recorrido
    // (del 30% al 80% del cuadro). En reposo queda tirado a la derecha, y con
    // el brazo extendido, centrado; al revés se cortaba y dejaba hueco.
    focus: 58,
    img: '/assets/pilares/marketing.webp',
    tagline: 'Estrategia, campañas y comunicación comercial.',
    blurb:
      'Construimos dirección, posicionamiento y comunicación estratégica que impulsa el crecimiento de tu marca.',
    // Mismas cuatro áreas de la página interna (/marketing/) — el chip es
    // un adelanto de lo que el pilar realmente entrega, no una lista aparte.
    items: ['Branding y posicionamiento', 'Campañas', 'Marketing digital', 'Optimización de canales'],
    ...dark('linear-gradient(140deg,#1A0F06 0%,#2A1408 45%,#0B0705 100%)'),
  },
  {
    id: 'p-studio',
    ruta: '/studio/',
    solid: '#0C1C2E',
    num: '02',
    kicker: 'Pilar dos',
    name: 'Studio',
    scene: 3,
    // Centro horizontal del personaje dentro del cuadro 16:9. En móvil el
    // video va en una franja vertical y `cover` recorta por los lados: sin
    // este encuadre el personaje queda fuera de cámara.
    focus: 84,
    img: '/assets/pilares/studio.webp',
    tagline: 'Producción audiovisual, diseño y contenido visual.',
    blurb:
      'Convertimos ideas en piezas visuales y audiovisuales que elevan tu marca y comunican con impacto.',
    // Mismas cinco áreas de la página interna (/studio/).
    items: ['Dirección creativa', 'Diseño gráfico', 'Fotografía', 'Animación', 'Producción audiovisual'],
    ...dark('linear-gradient(140deg,#0C1C2E 0%,#13314F 52%,#070D15 100%)'),
  },
  {
    id: 'p-educa',
    ruta: '/educa/',
    solid: '#0C332C',
    num: '03',
    kicker: 'Pilar tres',
    name: 'Educa',
    scene: 4,
    // Centro horizontal del personaje dentro del cuadro 16:9. En móvil el
    // video va en una franja vertical y `cover` recorta por los lados: sin
    // este encuadre el personaje queda fuera de cámara.
    focus: 71,
    img: '/assets/pilares/educa.webp',
    tagline: 'Formación, inspiración y desarrollo de equipos.',
    blurb:
      'Desarrollamos capacidades, inspiramos a las personas y diseñamos experiencias que transforman la forma de trabajar.',
    items: ['Formación Ejecutiva IA', 'Formación Especializada IA', 'Comunidad IA'],
    // Panel GEC IA desactivado a pedido del usuario (2026-09-27): no quiere
    // catálogo detrás de un formulario de correo. Para reactivarlo, devolver
    // estas dos líneas y el <PanelEduca /> en pages/Home.jsx.
    // panel: 'educa',
    // ctaLabel: 'Explorar GEC IA',
    ...dark('linear-gradient(140deg,#0C332C 0%,#0F4A3D 52%,#04120F 100%)'),
  },
  {
    id: 'p-soluciona',
    ruta: '/soluciona/',
    solid: '#071A33',
    num: '04',
    kicker: 'Pilar cuatro',
    name: 'Soluciona',
    scene: 5,
    // Centro horizontal del personaje dentro del cuadro 16:9. En móvil el
    // video va en una franja vertical y `cover` recorta por los lados: sin
    // este encuadre el personaje queda fuera de cámara.
    focus: 96,
    img: '/assets/pilares/soluciona.webp',
    tagline: 'Sistemas, herramientas y soluciones empresariales.',
    blurb:
      'Transformamos retos en herramientas y sistemas que optimizan tu operación, mejoran tu gestión y fidelizan a tus clientes.',
    // Mismas cuatro áreas de la página interna (/soluciona/).
    items: ['Configuración de plataformas', 'Productos desarrollados por GEC', 'Sistemas a la medida', 'Soluciones con IA'],
    ...dark('linear-gradient(140deg,#071A33 0%,#0B2545 52%,#040B16 100%)'),
  },
  {
    id: 'p-experience',
    ruta: '/experience/',
    solid: '#1A0B2E',
    num: '05',
    kicker: 'Pilar cinco',
    name: 'Experience',
    scene: 6,
    // Centro horizontal del personaje dentro del cuadro 16:9. En móvil el
    // video va en una franja vertical y `cover` recorta por los lados: sin
    // este encuadre el personaje queda fuera de cámara.
    focus: 80,
    img: '/assets/pilares/experience.webp',
    tagline: 'Experiencias, eventos e interacción con clientes.',
    blurb:
      'Creamos experiencias memorables y medibles que conectan con tus audiencias.',
    // Mismas cinco áreas de la página interna (/experience/).
    items: ['XP Event', 'Juegos y dinámicas', 'Encuestas y votaciones', 'Presentaciones interactivas', 'Experiencias a la medida'],
    ...dark('linear-gradient(140deg,#1A0B2E 0%,#2A1147 52%,#0B0518 100%)'),
  },
];

export const proceso = [
  {
    i: 0,
    word: 'Tendencias',
    img: '/ref/estudio-ambiente.jpg',
    desc: 'Contenido breve que explica los cambios del mercado y ayuda a la empresa a anticiparse, adaptarse y tomar mejores decisiones desde adentro.',
  },
  {
    i: 1,
    word: 'Herramientas',
    img: '/ref/pose-celular.webp',
    desc: 'Recursos explicados de forma práctica para que los equipos aprendan a utilizarlos y los conviertan en soluciones aplicables a su trabajo.',
  },
  {
    i: 2,
    word: 'Ideas',
    img: '/ref/studio-color.webp',
    desc: 'Conceptos, enfoques y oportunidades que inspiran al equipo a innovar, resolver problemas y crear nuevas soluciones desde el conocimiento interno.',
  },
  {
    i: 3,
    word: 'Ver canal',
    img: '/ref/escenario-real.jpg',
    desc: 'Cada episodio de Inside Your Brand en un solo lugar. Mira un capítulo y descubre cómo llevamos estos temas a tu equipo.',
    action: 'youtube',
  },
];

// Episodio destacado que se abre en el modal de Inside Your Brand
export const insideVideo = {
  id: 'M0oM2eSGRNk',
  title: 'Inside Your Brand — episodio destacado',
  channelUrl: 'https://www.youtube.com/@grupoespaciocreativo',
};

// Respaldo del carrusel de Inside Your Brand (IYB-03) — se usa en dev (donde
// /api/youtube da 404, como el resto de estos endpoints) y como base mínima
// si la petición en vivo falla o si algún episodio viejo sale de la ventana
// de los 15 videos más recientes que trae el feed del canal (ver comentario
// en functions/api/youtube.js). Títulos verbatim, verificados vía oEmbed de
// YouTube el 2026-09-21 — no editorializar.
export const iybVideosSeed = [
  { id: 'sQvwFH1gfX4', title: 'Episodio 1| Canales de WhatsApp | Tutorial y Estrategia | Inside Your Brand – Grupo Espacio Creativo' },
  {
    id: '0Viti3t10xs',
    title: 'Episodio 4 | 5 Claves de Producción Audiovisual | Inside Your Brand | Grupo Espacio Creativo',
  },
  {
    id: 'h2tfCmXtX9Y',
    title: 'Episodio 6 | 4 Claves para Evaluar tu Primer Semestre | Inside Your Brand | Grupo Espacio Creativo',
  },
  {
    id: 'M0oM2eSGRNk',
    title: 'Cómo Liderar Equipos con Inteligencia Artificial | Capacitación Digital | Inside Your Brand – GEC',
  },
].map((v) => ({ ...v, thumbnail: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg` }));

export const fuerzas = [
  { n: '01', en: 'Strategy', es: 'Estrategia que dirige y posiciona tu marca.', img: '/ref/estudio-ambiente.jpg' },
  { n: '02', en: 'Content', es: 'Contenidos que comunican y conectan.', img: '/ref/studio-color.webp' },
  { n: '03', en: 'Teams', es: 'Equipos que aprenden, crecen e inspiran.', img: '/ref/pose-celular.webp' },
  { n: '04', en: 'Systems', es: 'Sistemas que optimizan, fidelizan y generan valor.', img: '/ref/celular.webp' },
  { n: '05', en: 'Experience', es: 'Experiencias que se viven, se recuerdan y generan resultados.', img: '/ref/escenario-real.jpg' },
  { n: '06', en: 'Learn', es: 'Contenido educativo que acompaña la evolución de tu marca.', img: '/ref/fondo-combinacion.jpg' },
];

// H-05 de la guía — "Sectores" es contenido aprobado, textual.
export const sectores = [
  'Automotriz',
  'Educación',
  'Salud',
  'Servicios financieros',
  'ONGs y cooperación',
  'Retail y supermercados',
  'Gastronomía y restaurantes',
];

export const abanico = [
  { i: 0, kicker: 'Casos', t: 'Portafolio', img: '/ref/fondo-combinacion.jpg', desc: 'Proyectos, campañas y producciones que muestran el ecosistema GEC en acción.' },
  { i: 1, kicker: 'Ideas', t: 'Blog', img: '/ref/pose-celular.webp', desc: 'Artículos sobre creatividad, IA aplicada y crecimiento empresarial.' },
  { i: 2, kicker: 'Audio', t: 'Podcast', img: '/ref/escenario-real.jpg', desc: 'Conversaciones con quienes están construyendo marcas desde adentro.' },
  { i: 3, kicker: 'Formación', t: 'Inside Your Brand', img: '/ref/studio-color.webp', desc: 'La línea educativa que acompaña a nuestros clientes con contenidos de valor.' },
  { i: 4, kicker: 'Producción', t: 'Behind the scenes', img: '/ref/estudio-ambiente.jpg', desc: 'Cómo se hace: sets, luces, cámaras y el equipo detrás de cada pieza.' },
];

export const marcas = [
  'Grupo Flores', 'Toyota', 'Ford', 'Supermercados La Colonia', 'UJCV',
  'ENS', 'NDA', 'LCM', 'UNICEF', 'BCH', 'BCIE',
];

export const testimonios = [
  {
    id: 't1',
    quote:
      'GEC no nos entregó una campaña: nos ordenó la forma de comunicar. Hoy el equipo sabe qué decir, cuándo y por qué.',
    name: 'Dirección de Marca',
    role: 'Grupo Flores',
    initials: 'GF',
  },
  {
    id: 't2',
    quote:
      'La Formación Especializada IA: Audiovisual cambió nuestro ritmo de producción. Pasamos de semanas a días sin perder criterio.',
    name: 'Gerencia de Marketing',
    role: 'Supermercados La Colonia',
    initials: 'LC',
  },
  {
    id: 't3',
    quote:
      'Lo que más valoramos fue el Escaneo IA. Nos mostró dónde estábamos parados antes de invertir en herramientas.',
    name: 'Coordinación Académica',
    role: 'UJCV',
    initials: 'UJ',
  },
  {
    id: 't4',
    quote:
      'Las experiencias que diseñaron para nuestros eventos siguen siendo tema de conversación entre los asistentes.',
    name: 'Comunicación Institucional',
    role: 'BCIE',
    initials: 'BC',
  },
];

// Enlace único de WhatsApp, con el mensaje pre-cargado
export const WHATSAPP =
  'https://api.whatsapp.com/send?phone=50498283018&text=%C2%A1Buenos%20d%C3%ADas!%20%C2%BFEn%20que%20podemos%20ayudarte%3F';

export const contacto = {
  direccion: 'Comayagüela, Fco. Morazán, Honduras',
  detalle: 'Centro Comercial Plaza Roble, Local 15',
  telefono: '(504) 2234-8414',
  telefonoHref: 'tel:+50422348414',
  celular: '(504) 9828-3018',
  celularHref: 'tel:+50498283018',
};

export const redes = [
  { id: 'youtube', label: 'YouTube', href: 'https://www.youtube.com/Grupoespaciocreativo' },
  { id: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/espaciocreativo/' },
  { id: 'behance', label: 'Behance', href: 'https://www.behance.net/GrupoEspacioCreativo' },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/company/grupo-espacio-creativo' },
  { id: 'spotify', label: 'Spotify', href: 'https://open.spotify.com/show/1nZxk3zAlFguE9RJcOQu1P' },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    href: WHATSAPP,
  },
];

// Cada enlace lleva su destino: ancla interna, o URL externa cuando aplica.
export const footerCols = [
  {
    t: 'Ecosistema',
    links: [
      { label: 'Marketing', href: '/marketing/' },
      { label: 'Studio', href: '/studio/' },
      { label: 'Educa', href: '/educa/' },
      { label: 'Soluciona', href: '/soluciona/' },
      { label: 'Experience', href: '/experience/' },
    ],
  },
  {
    // Portafolio sigue sin sección/ruta propia (ver nota en Home.jsx) — el
    // enlace quedaría sin destino. Inside Your Brand sí tiene página propia
    // ahora (`/inside-your-brand/`, IYB-01 a IYB-06 de la guía).
    t: 'Contenido',
    links: [
      { label: 'Inside Your Brand', href: '/inside-your-brand/' },
      { label: 'La familia Meraki', href: '#familia' },
      { label: 'YouTube GEC', href: 'https://www.youtube.com/Grupoespaciocreativo', externo: true },
    ],
  },
  {
    // "Valor integrado" salió con ValorHorizontal (reemplazado por
    // Autoridad, que no reusa el id `#valor` — son contenidos distintos).
    // "Nosotros" salió con Pilares (llevaba a `#ecosistema`, el id vivía en
    // esa sección — ver nota en Home.jsx).
    t: 'Agencia',
    links: [
      { label: 'Contacto', href: '#contacto' },
      { label: 'WhatsApp', href: WHATSAPP, externo: true },
    ],
  },
];

// Vacío desde que Pilares (única entrada, "Ecosistema" → `#ecosistema`)
// salió del Home — ver nota ahí. NavOverlay.jsx ya maneja un `nav` vacío sin
// romperse (usa `...nav`, no un índice fijo).
export const nav = [];
