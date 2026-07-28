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
    solid: '#1A0F06',
    num: '01',
    kicker: 'Pilar uno',
    name: 'Marketing',
    scene: 2,
    img: '/assets/pilares/marketing.webp',
    tagline: 'Estrategia, campañas y comunicación comercial.',
    blurb:
      'Construimos dirección, posicionamiento y comunicación estratégica que impulsa el crecimiento de tu marca.',
    items: [
      'Estrategia de marca',
      'Campañas publicitarias',
      'Planificación de contenido',
      'Marketing digital',
      'Comunicación comercial',
      'Lanzamientos',
      'Análisis de resultados',
      'Recomendaciones de mejora',
    ],
    ...dark('linear-gradient(140deg,#1A0F06 0%,#2A1408 45%,#0B0705 100%)'),
  },
  {
    id: 'p-studio',
    solid: '#0C1C2E',
    num: '02',
    kicker: 'Pilar dos',
    name: 'Studio',
    scene: 3,
    img: '/assets/pilares/studio.webp',
    tagline: 'Producción audiovisual, diseño y contenido visual.',
    blurb:
      'Convertimos ideas en piezas visuales y audiovisuales que elevan tu marca y comunican con impacto.',
    items: [
      'Producción audiovisual',
      'Diseño gráfico',
      'Fotografía',
      'Animación',
      'Motion graphics',
      'Edición de video',
      'Reels y contenido digital',
      'Presentaciones',
      'Piezas digitales e impresas',
    ],
    ...dark('linear-gradient(140deg,#0C1C2E 0%,#13314F 52%,#070D15 100%)'),
  },
  {
    id: 'p-educa',
    solid: '#0C332C',
    num: '03',
    kicker: 'Pilar tres',
    name: 'Educa',
    scene: 4,
    img: '/assets/pilares/educa.webp',
    tagline: 'Formación, inspiración y desarrollo de equipos.',
    blurb:
      'Desarrollamos capacidades, inspiramos a las personas y diseñamos experiencias que transforman la forma de trabajar.',
    items: ['IA Productiva', 'Sprint Audiovisual', 'Inspira Teams by GEC'],
    panel: 'educa',
    ctaLabel: 'Explorar GEC IA',
    ...dark('linear-gradient(140deg,#0C332C 0%,#0F4A3D 52%,#04120F 100%)'),
  },
  {
    id: 'p-soluciona',
    solid: '#071A33',
    num: '04',
    kicker: 'Pilar cuatro',
    name: 'Soluciona',
    scene: 5,
    img: '/assets/pilares/soluciona.webp',
    tagline: 'Sistemas, herramientas y soluciones empresariales.',
    blurb:
      'Transformamos retos en herramientas y sistemas que optimizan tu operación, mejoran tu gestión y fidelizan a tus clientes.',
    items: [
      'Agencia · Sistema IA de contenidos',
      'Orienta · Leads y seguimiento',
      'Setup Inteligente',
      'Bolsillo Match B2C',
      'Beneficio Match B2B',
    ],
    ...dark('linear-gradient(140deg,#071A33 0%,#0B2545 52%,#040B16 100%)'),
  },
  {
    id: 'p-experience',
    solid: '#1A0B2E',
    num: '05',
    kicker: 'Pilar cinco',
    name: 'Experience',
    scene: 6,
    img: '/assets/pilares/experience.webp',
    tagline: 'Experiencias, eventos e interacción con clientes.',
    blurb:
      'Creamos experiencias memorables y medibles que conectan con tus audiencias.',
    items: ['XP Event Check-in', 'XP Event Table', 'XP Play'],
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

export const fuerzas = [
  { n: '01', en: 'Strategy', es: 'Estrategia que dirige y posiciona tu marca.', img: '/ref/estudio-ambiente.jpg' },
  { n: '02', en: 'Content', es: 'Contenidos que comunican y conectan.', img: '/ref/studio-color.webp' },
  { n: '03', en: 'Teams', es: 'Equipos que aprenden, crecen e inspiran.', img: '/ref/pose-celular.webp' },
  { n: '04', en: 'Systems', es: 'Sistemas que optimizan, fidelizan y generan valor.', img: '/ref/celular.webp' },
  { n: '05', en: 'Experience', es: 'Experiencias que se viven, se recuerdan y generan resultados.', img: '/ref/escenario-real.jpg' },
  { n: '06', en: 'Learn', es: 'Contenido educativo que acompaña la evolución de tu marca.', img: '/ref/fondo-combinacion.jpg' },
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
      'El Sprint Audiovisual con IA cambió nuestro ritmo de producción. Pasamos de semanas a días sin perder criterio.',
    name: 'Gerencia de Marketing',
    role: 'Supermercados La Colonia',
    initials: 'LC',
  },
  {
    id: 't3',
    quote:
      'Lo que más valoramos fue el IA Scan. Nos mostró dónde estábamos parados antes de invertir en herramientas.',
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
      { label: 'Marketing', href: '#p-marketing' },
      { label: 'Studio', href: '#p-studio' },
      { label: 'Educa', href: '#p-educa' },
      { label: 'Soluciona', href: '#p-soluciona' },
      { label: 'Experience', href: '#p-experience' },
    ],
  },
  {
    t: 'Contenido',
    links: [
      { label: 'Inside Your Brand', href: '#inside' },
      { label: 'Portafolio', href: '#portafolio' },
      { label: 'La familia Meraki', href: '#familia' },
      { label: 'YouTube GEC', href: 'https://www.youtube.com/Grupoespaciocreativo', externo: true },
    ],
  },
  {
    t: 'Agencia',
    links: [
      { label: 'Nosotros', href: '#ecosistema' },
      { label: 'Valor integrado', href: '#valor' },
      { label: 'Contacto', href: '#contacto' },
      { label: 'WhatsApp', href: WHATSAPP, externo: true },
    ],
  },
];

const EDU = { tag: 'EDUCA', tagBg: '#F5B301', tagFg: '#0B0B0C' };
const SOL = { tag: 'SOLUCIONA', tagBg: '#13314F', tagFg: '#FFFFFF' };

export const fases = [
  {
    n: '01',
    t: 'Entender',
    d: 'Abrir la conversación sobre IA en la organización y alinear la visión del liderazgo.',
    progs: [
      { ...EDU, t: 'Inspira Teams IA', d: 'Taller de 90 minutos para sensibilizar e inspirar al equipo: la IA como una nueva forma de trabajar, decidir, crear y ordenar procesos.' },
      { ...EDU, t: '60 Minutos IA para Líderes', d: 'Sesión ejecutiva para alinear visión, identificar oportunidades y riesgos, y definir reglas iniciales de uso responsable.' },
    ],
  },
  {
    n: '02',
    t: 'Ordenar',
    d: 'Conocer la realidad del equipo y definir las herramientas correctas antes de capacitar.',
    progs: [
      { ...EDU, t: 'IA Scan', d: 'Diagnóstico con colaboradores clave (60–90 min): nivel actual, herramientas, tareas y barreras. Entregable: hallazgos y recomendación de ruta.' },
      { ...SOL, t: 'Diseño del Ecosistema IA', d: 'Documento estratégico con mapa de herramientas, recomendaciones, licencias, prioridades y ruta por fases según áreas y presupuesto.' },
    ],
  },
  {
    n: '03',
    t: 'Formar',
    d: 'Capacitar al equipo con las herramientas correctas y consolidar la adopción.',
    progs: [
      { ...EDU, t: 'IA Productiva', d: '4 sesiones para usar IA con criterio en tareas reales: comunicación, reportes, análisis, presentaciones, organización e ideas.' },
      { ...EDU, t: 'Sprint Audiovisual con IA', d: '4 sesiones para equipos creativos: de la idea al concepto, prompts visuales, producción de video con IA y flujo de revisión.' },
      { ...EDU, t: 'Inspira Teams IA de cierre', d: 'Taller que consolida cultura y hábitos: IA como hábito, creatividad con criterio humano y trabajo más claro.' },
    ],
  },
  {
    n: '04',
    t: 'Aplicar e implementar',
    d: 'Resolver problemas concretos y construir las soluciones que la operación necesita.',
    progs: [
      { ...EDU, t: 'IA Aplicada', d: '3 sesiones, 1 problema real, 1 entregable práctico. Ediciones por área: Protocolo Empresarial, Marketing, Ventas, Servicio al Cliente, Administración, Producción y Creatividad.' },
      { ...SOL, t: 'Soluciones con GEC Soluciona', d: 'Configuración de plataformas, automatizaciones, integraciones, agentes avanzados, dashboards, CRM y desarrollos a medida.' },
    ],
  },
];

export const rutas = [
  { i: 0, perfil: 'Apenas están explorando la IA', pasos: ['Inspira Teams IA', '60 Minutos IA para Líderes', 'IA Scan', 'Diseño del Ecosistema IA', 'IA Productiva'] },
  { i: 1, perfil: 'El liderazgo ya tiene claridad, el equipo no', pasos: ['60 Minutos IA para Líderes', 'IA Scan', 'IA Productiva o Sprint Audiovisual', 'IA Aplicada'] },
  { i: 2, perfil: 'Ya decidieron capacitar al equipo', pasos: ['IA Productiva', 'Diseño del Ecosistema IA', 'Inspira Teams IA de cierre', 'IA Aplicada'] },
  { i: 3, perfil: 'Equipo creativo, marketing o audiovisual', pasos: ['IA Scan o 60 Minutos IA', 'Diseño del Ecosistema IA', 'Sprint Audiovisual con IA', 'IA Aplicada: Marketing'] },
  { i: 4, perfil: 'Hay resistencia cultural al cambio', pasos: ['Inspira Teams IA', '60 Minutos IA para Líderes', 'IA Scan', 'IA Productiva', 'Inspira Teams IA de cierre'] },
  { i: 5, perfil: 'El equipo ya está capacitado', pasos: ['IA Aplicada', 'Diseño del Ecosistema IA', 'Soluciones con GEC Soluciona'] },
];

export const nav = [
  { href: '#ecosistema', label: 'Ecosistema' },
  { href: '#inside', label: 'Inside Your Brand' },
  { href: '#valor', label: 'Valor' },
  { href: '#portafolio', label: 'Portafolio' },
];
