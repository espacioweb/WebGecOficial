// Módulo interno GEC IA — datos extraídos del bosquejo
// "Landing educativo con tabs animadas/GEC IA Landing.dc.html"

export const C = {
  turquesa: '#3CBFAE',
  amarillo: '#F5B301',
  naranja: '#E8762B',
  azul: '#5B8FF9',
};

export const FASES = [
  {
    n: '01',
    name: 'ENTENDER',
    color: C.turquesa,
    desc: 'Abrir la conversación sobre IA y alinear la visión del liderazgo.',
    items: [
      { pilar: 'Educa', name: 'Inspira Teams IA' },
      { pilar: 'Educa', name: '60 Minutos IA para Líderes' },
    ],
  },
  {
    n: '02',
    name: 'ORDENAR',
    color: C.amarillo,
    desc: 'Conocer la realidad del equipo y definir herramientas antes de capacitar.',
    items: [
      { pilar: 'Educa', name: 'IA Scan' },
      { pilar: 'Soluciona', name: 'Diseño del Ecosistema IA' },
    ],
  },
  {
    n: '03',
    name: 'FORMAR',
    color: C.naranja,
    desc: 'Capacitar con las herramientas correctas y consolidar la adopción.',
    items: [
      { pilar: 'Educa', name: 'IA Productiva' },
      { pilar: 'Educa', name: 'Sprint Audiovisual con IA' },
      { pilar: 'Educa', name: 'Inspira Teams de cierre' },
    ],
  },
  {
    n: '04',
    name: 'APLICAR',
    color: C.azul,
    desc: 'Resolver problemas concretos y construir las soluciones que la operación necesita.',
    items: [
      { pilar: 'Educa', name: 'IA Aplicada' },
      { pilar: 'Soluciona', name: 'Soluciones GEC Soluciona' },
    ],
  },
];

export const PROG = {
  inspira: { name: 'Inspira Teams IA', fase: 0, pilar: 'Educa' },
  lideres: { name: '60 Minutos IA para Líderes', fase: 0, pilar: 'Educa' },
  scan: { name: 'IA Scan', fase: 1, pilar: 'Educa' },
  eco: { name: 'Diseño del Ecosistema IA', fase: 1, pilar: 'Soluciona' },
  productiva: { name: 'IA Productiva', fase: 2, pilar: 'Educa' },
  sprint: { name: 'Sprint Audiovisual con IA', fase: 2, pilar: 'Educa' },
  cierre: { name: 'Inspira Teams IA de cierre', fase: 2, pilar: 'Educa' },
  aplicada: { name: 'IA Aplicada', fase: 3, pilar: 'Educa' },
  soluciona: { name: 'Soluciones con GEC Soluciona', fase: 3, pilar: 'Soluciona' },
};

export const PUERTAS = [
  {
    badge: 'A',
    label: 'Apenas están explorando la IA',
    meta: 'Sin criterio ni herramientas definidas',
    fase: 0,
    lead: 'Nadie en la empresa sabe todavía qué puede hacer la IA en su trabajo. Primero se inspira, luego se ordena.',
    ruta: ['inspira', 'lideres', 'scan', 'eco', 'productiva'],
    left: [
      'La conversación arranca por cultura, no por herramientas.',
      'El liderazgo define reglas de uso responsable desde el inicio.',
      'El diagnóstico evita comprar licencias que nadie usará.',
    ],
    right: [
      ['Duración total', '6 a 10 semanas'],
      ['Primer entregable', 'Hallazgos del IA Scan'],
      ['Pilares', 'Educa + Soluciona'],
    ],
    footnote: 'Es la puerta más común en empresas que nunca han capacitado en IA.',
  },
  {
    badge: 'B',
    label: 'El liderazgo ya tiene claridad, el equipo no',
    meta: 'Falta bajar la visión al equipo',
    fase: 0,
    lead: 'La dirección ya decidió apostar por IA, pero el equipo no sabe cómo aplicarla. Hay que traducir la visión en práctica.',
    ruta: ['lideres', 'scan', 'productiva', 'aplicada'],
    left: [
      'Se alinea el mensaje del liderazgo antes de formar.',
      'El IA Scan revela la brecha real entre discurso y práctica.',
      'La formación aterriza en tareas del día a día.',
    ],
    right: [
      ['Duración total', '5 a 8 semanas'],
      ['Primer entregable', 'Reglas de uso + ruta'],
      ['Pilares', 'Educa'],
    ],
    footnote: 'Ideal cuando ya existe presupuesto aprobado pero no plan de adopción.',
  },
  {
    badge: 'C',
    label: 'Ya decidieron capacitar al equipo',
    meta: 'Listos para formación aplicada',
    fase: 1,
    lead: 'La decisión está tomada. Se salta la sensibilización y se entra directo a ordenar herramientas y formar.',
    ruta: ['scan', 'productiva', 'aplicada'],
    left: [
      'Se confirma qué herramientas usará cada área.',
      'La formación se dicta sobre casos reales de la empresa.',
      'Cada sesión cierra con un entregable utilizable.',
    ],
    right: [
      ['Duración total', '4 a 6 semanas'],
      ['Primer entregable', 'Recomendación de ruta'],
      ['Pilares', 'Educa'],
    ],
    footnote: 'La ruta más corta hacia resultados visibles.',
  },
  {
    badge: 'D',
    label: 'Equipo creativo, marketing o audiovisual',
    meta: 'Producción de contenido con IA',
    fase: 2,
    lead: 'El foco no es entender la IA: es producir más y mejor. Se entra por el sprint creativo.',
    ruta: ['scan', 'sprint', 'aplicada'],
    left: [
      'De la idea al concepto con prompts visuales.',
      'Producción de video con IA y flujo de revisión.',
      'Edición de IA Aplicada para Marketing y Creatividad.',
    ],
    right: [
      ['Duración total', '4 a 5 semanas'],
      ['Primer entregable', 'Pieza audiovisual con IA'],
      ['Pilares', 'Educa'],
    ],
    footnote: 'Es la puerta con resultado más demostrable ante dirección.',
  },
  {
    badge: 'E',
    label: 'Hay resistencia cultural al cambio',
    meta: 'El bloqueo es humano, no técnico',
    fase: 0,
    lead: 'La herramienta no es el problema. Se trabaja percepción, miedo y hábito antes de cualquier capacitación técnica.',
    ruta: ['inspira', 'lideres', 'cierre'],
    left: [
      'La IA se presenta como apoyo, no como reemplazo.',
      'El liderazgo comunica reglas claras y límites.',
      'El taller de cierre convierte la IA en hábito de equipo.',
    ],
    right: [
      ['Duración total', '4 a 6 semanas'],
      ['Primer entregable', 'Taller Inspira Teams'],
      ['Pilares', 'Educa'],
    ],
    footnote: 'Sin este paso, cualquier capacitación posterior se desperdicia.',
  },
  {
    badge: 'F',
    label: 'El equipo ya está capacitado',
    meta: 'Toca implementar sistemas',
    fase: 3,
    lead: 'Ya saben usar IA. Lo que falta es infraestructura: automatizaciones, agentes e integraciones.',
    ruta: ['eco', 'soluciona'],
    left: [
      'Mapa de herramientas, licencias y prioridades.',
      'Automatizaciones e integraciones sobre procesos reales.',
      'Agentes, dashboards, CRM y desarrollos a medida.',
    ],
    right: [
      ['Duración total', 'Según alcance'],
      ['Primer entregable', 'Documento de ecosistema'],
      ['Pilares', 'Soluciona'],
    ],
    footnote: 'Aquí el módulo pasa de formar a construir.',
  },
];

export const PROGRAMAS = [
  {
    key: 'inspira',
    meta: 'Taller · 90 min',
    lead: 'Taller para sensibilizar e inspirar al equipo: la IA como una nueva forma de trabajar, decidir, crear y ordenar procesos.',
    left: ['Sensibiliza sin tecnicismos.', 'Rompe el miedo inicial al cambio.', 'Deja al equipo con ganas de probar.'],
    right: [['Para quién', 'Todo el equipo'], ['Entregable', 'Ejercicios y acuerdos iniciales'], ['Formato', 'Presencial o virtual']],
    footnote: 'Suele ser el primer contacto de la empresa con GEC IA.',
  },
  {
    key: 'lideres',
    meta: 'Sesión ejecutiva · 60 min',
    lead: 'Sesión para alinear visión, identificar oportunidades y riesgos, y definir reglas iniciales de uso responsable.',
    left: ['Enfocada en decisiones, no en herramientas.', 'Define qué sí y qué no se permite.', 'Prepara el presupuesto de adopción.'],
    right: [['Para quién', 'Dirección y jefaturas'], ['Entregable', 'Reglas de uso responsable'], ['Formato', 'Sesión cerrada']],
    footnote: 'Sin liderazgo alineado, la adopción se estanca.',
  },
  {
    key: 'scan',
    meta: 'Diagnóstico · 60–90 min',
    lead: 'Diagnóstico con colaboradores clave: nivel actual, herramientas, tareas y barreras reales.',
    left: ['Evita capacitar a ciegas.', 'Identifica tareas de alto impacto.', 'Prioriza por área y presupuesto.'],
    right: [['Para quién', 'Colaboradores clave'], ['Entregable', 'Hallazgos + recomendación de ruta'], ['Formato', 'Entrevistas guiadas']],
    footnote: 'Es el punto de entrada recomendado para casi todas las empresas.',
  },
  {
    key: 'eco',
    meta: 'Documento estratégico',
    lead: 'Mapa de herramientas, recomendaciones, licencias, prioridades y ruta por fases según áreas y presupuesto.',
    left: ['Ordena el gasto en licencias.', 'Define responsables por herramienta.', 'Traza la ruta por fases.'],
    right: [['Para quién', 'Dirección y TI'], ['Entregable', 'Documento de ecosistema IA'], ['Formato', 'Consultoría']],
    footnote: 'Único programa de la fase Ordenar que pertenece a Soluciona.',
  },
  {
    key: 'productiva',
    meta: '4 sesiones',
    lead: 'Usar IA con criterio en tareas reales: comunicación, reportes, análisis, presentaciones, organización e ideas.',
    left: ['Práctica sobre trabajo real, no ejemplos genéricos.', 'Criterio para revisar lo que la IA produce.', 'Hábitos que quedan después del curso.'],
    right: [['Para quién', 'Equipos operativos'], ['Entregable', 'Kit de prompts del equipo'], ['Formato', '4 sesiones semanales']],
    footnote: 'El programa más solicitado del pilar Educa.',
  },
  {
    key: 'sprint',
    meta: '4 sesiones creativas',
    lead: 'Para equipos creativos: de la idea al concepto, prompts visuales, producción de video con IA y flujo de revisión.',
    left: ['Enfocado en producción audiovisual.', 'Incluye flujo de revisión y aprobación.', 'Resultado tangible al terminar.'],
    right: [['Para quién', 'Marketing y creativos'], ['Entregable', 'Piezas producidas con IA'], ['Formato', 'Sprint de 4 sesiones']],
    footnote: 'Se puede combinar con IA Aplicada · Marketing.',
  },
  {
    key: 'aplicada',
    meta: '3 sesiones · 1 problema real',
    lead: 'Tres sesiones, un problema real, un entregable práctico. Con ediciones por área de la empresa.',
    left: ['Ediciones: Protocolo Empresarial, Marketing, Ventas.', 'También Servicio al Cliente, Administración y Producción.', 'Cierra con una solución en uso.'],
    right: [['Para quién', 'Un área específica'], ['Entregable', 'Solución aplicada al proceso'], ['Formato', '3 sesiones + acompañamiento']],
    footnote: 'Es el puente natural hacia GEC Soluciona.',
  },
  {
    key: 'soluciona',
    meta: 'Implementación',
    lead: 'Configuración de plataformas, automatizaciones, integraciones, agentes avanzados, dashboards, CRM y desarrollos a medida.',
    left: ['Construye lo que la formación dejó identificado.', 'Integra las herramientas ya contratadas.', 'Deja sistemas operando, no recomendaciones.'],
    right: [['Para quién', 'Empresa con equipo formado'], ['Entregable', 'Sistemas en producción'], ['Formato', 'Proyecto por alcance']],
    footnote: 'Alcance y tiempos se definen tras el Diseño del Ecosistema IA.',
  },
];

export const AREAS = [
  {
    badge: 'MK',
    label: 'Marketing',
    meta: 'Contenido, campañas y análisis',
    fase: 2,
    lead: 'El área que más rápido muestra resultados con IA: volumen de contenido, velocidad de campaña y análisis de desempeño.',
    tareas: ['Redacción de campañas y copies', 'Conceptos y prompts visuales', 'Análisis de resultados y reportes'],
    ruta: ['scan', 'sprint', 'aplicada'],
    footnote: 'Combinar Sprint Audiovisual con la edición Marketing de IA Aplicada.',
  },
  {
    badge: 'VT',
    label: 'Ventas',
    meta: 'Prospección y seguimiento',
    fase: 3,
    lead: 'IA para preparar reuniones, responder más rápido y no perder seguimiento de oportunidades.',
    tareas: ['Investigación previa de clientes', 'Propuestas y correos de seguimiento', 'Resúmenes de reunión y próximos pasos'],
    ruta: ['scan', 'productiva', 'aplicada'],
    footnote: 'La edición Ventas de IA Aplicada trabaja sobre el pipeline real.',
  },
  {
    badge: 'SC',
    label: 'Servicio al Cliente',
    meta: 'Respuesta y consistencia',
    fase: 3,
    lead: 'Respuestas más rápidas y consistentes, con criterio humano en los casos que lo requieren.',
    tareas: ['Respuestas a consultas frecuentes', 'Tono y plantillas de atención', 'Clasificación de casos'],
    ruta: ['productiva', 'aplicada', 'soluciona'],
    footnote: 'Suele derivar en automatizaciones con GEC Soluciona.',
  },
  {
    badge: 'AD',
    label: 'Administración',
    meta: 'Documentos y control',
    fase: 2,
    lead: 'Ordenar información, redactar documentos y controlar procesos administrativos con menos fricción.',
    tareas: ['Redacción de documentos internos', 'Resúmenes y actas', 'Control de reportes recurrentes'],
    ruta: ['scan', 'productiva', 'aplicada'],
    footnote: 'Edición Protocolo Empresarial de IA Aplicada.',
  },
  {
    badge: 'PR',
    label: 'Producción',
    meta: 'Procesos y coordinación',
    fase: 3,
    lead: 'Coordinar mejor, documentar procesos y anticipar cuellos de botella en la operación.',
    tareas: ['Documentación de procesos', 'Planificación y checklists', 'Reportes de avance'],
    ruta: ['scan', 'aplicada', 'soluciona'],
    footnote: 'Buen candidato para automatizaciones e integraciones.',
  },
  {
    badge: 'CR',
    label: 'Creatividad',
    meta: 'Ideación y producción',
    fase: 2,
    lead: 'Más exploración creativa en menos tiempo, manteniendo criterio y sello propio.',
    tareas: ['Ideación y variantes de concepto', 'Prompts visuales y storyboards', 'Producción de video con IA'],
    ruta: ['sprint', 'aplicada'],
    footnote: 'La IA amplía las opciones; el criterio sigue siendo humano.',
  },
];

export const COMPARATIVA = [
  { dim: 'Herramientas', antes: 'Cada persona usa la que encontró; nadie sabe qué se paga.', despues: 'Un ecosistema definido, con licencias y responsables claros.' },
  { dim: 'Capacitación', antes: 'Un taller aislado que se olvida en dos semanas.', despues: 'Ruta por fases con práctica sobre tareas reales.' },
  { dim: 'Criterio', antes: 'Se acepta lo que la IA produce sin revisarlo.', despues: 'El equipo revisa, corrige y firma con criterio propio.' },
  { dim: 'Resultados', antes: 'Sensación de novedad, cero impacto medible.', despues: 'Entregables aplicados a procesos de cada área.' },
  { dim: 'Cultura', antes: 'Miedo, resistencia y uso a escondidas.', despues: 'Reglas claras, uso responsable y hábito de equipo.' },
];

export const MODOS = [
  { id: 'puertas', label: 'Punto de partida' },
  { id: 'programas', label: 'Programas' },
  { id: 'areas', label: 'Por área' },
];

// Cadena de programas de una ruta, coloreada por la fase a la que pertenece
export const chips = (keys) =>
  keys.map((k, i) => ({
    label: PROG[k].name,
    color: FASES[PROG[k].fase].color,
    last: i === keys.length - 1,
  }));

export function buildDetail(mode, i) {
  if (mode === 'programas') {
    const p = PROGRAMAS[i];
    const base = PROG[p.key];
    const f = FASES[base.fase];
    return {
      color: f.color,
      eyebrow: base.pilar,
      eyebrowNote: `Fase ${f.n} · ${f.name} — ${p.meta}`,
      title: base.name,
      lead: p.lead,
      steps: null,
      stepsTitle: '',
      leftTitle: 'Qué lo hace distinto',
      left: p.left,
      rightTitle: 'Ficha rápida',
      right: p.right.map(([label, value]) => ({ label, value })),
      footnote: p.footnote,
    };
  }

  if (mode === 'areas') {
    const a = AREAS[i];
    const f = FASES[a.fase];
    return {
      color: f.color,
      eyebrow: 'Área',
      eyebrowNote: a.meta,
      title: a.label,
      lead: a.lead,
      steps: chips(a.ruta),
      stepsTitle: 'Programas recomendados',
      leftTitle: 'Tareas donde la IA rinde',
      left: a.tareas,
      rightTitle: 'Cómo se arma',
      right: [
        { label: 'Entrada sugerida', value: PROG[a.ruta[0]].name },
        { label: 'Fase dominante', value: `${f.n} · ${f.name}` },
        {
          label: 'Pilares',
          value: a.ruta.some((k) => PROG[k].pilar === 'Soluciona')
            ? 'Educa + Soluciona'
            : 'Educa',
        },
      ],
      footnote: a.footnote,
    };
  }

  const d = PUERTAS[i];
  const f = FASES[d.fase];
  return {
    color: f.color,
    eyebrow: `Puerta ${d.badge}`,
    eyebrowNote: `Entra en fase ${f.n} · ${f.name}`,
    title: d.label,
    lead: d.lead,
    steps: chips(d.ruta),
    stepsTitle: 'Ruta sugerida',
    leftTitle: 'Por qué esta ruta',
    left: d.left,
    rightTitle: 'Resumen',
    right: d.right.map(([label, value]) => ({ label, value })),
    footnote: d.footnote,
  };
}

export function navSource(mode) {
  if (mode === 'programas') {
    return PROGRAMAS.map((p) => ({
      badge: FASES[PROG[p.key].fase].n,
      label: PROG[p.key].name,
      meta: p.meta,
      fase: PROG[p.key].fase,
    }));
  }
  if (mode === 'areas') {
    return AREAS.map((a) => ({ badge: a.badge, label: a.label, meta: a.meta, fase: a.fase }));
  }
  return PUERTAS.map((p) => ({ badge: p.badge, label: p.label, meta: p.meta, fase: p.fase }));
}

export const navTitle = (mode) =>
  mode === 'programas'
    ? 'Los 9 programas'
    : mode === 'areas'
      ? 'Áreas de la empresa'
      : '¿Dónde está la empresa hoy?';
