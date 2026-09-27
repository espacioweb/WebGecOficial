import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import { Check, ArrowLeft, X, ArrowRight } from 'lucide-react';
import { gsap } from '../utils/gsapSetup';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { WHATSAPP, pilares } from '../data/site';
import { PAISES, formatTelefono, validarCorreoEmpresarial } from '../data/paises';
import { P } from '../utils/textStyles';
import { Eyebrow, CtaPrimary } from '../components/PilarPage';
import { track } from '../utils/analytics';

const NOMBRE_PILAR = {
  marketing: 'Marketing',
  studio: 'Studio',
  educa: 'Educa',
  soluciona: 'Soluciona',
  experience: 'Experience',
};

const RUTA_PILAR = {
  marketing: '/marketing/',
  studio: '/studio/',
  educa: '/educa/',
  soluciona: '/soluciona/',
  experience: '/experience/',
};

// B-02 · Filtro — las cinco áreas mapean 1:1 a los cinco pilares; "Necesito
// orientación" es exclusiva (deselecciona el resto) y no lleva a B-03.
const AREAS = [
  { id: 'marketing', label: 'Marca, marketing o comunicación' },
  { id: 'studio', label: 'Diseño, foto, animación o audiovisual' },
  { id: 'educa', label: 'Formación en IA, marca, audiovisual o habilidades' },
  { id: 'soluciona', label: 'Plataformas o soluciones a la medida' },
  { id: 'experience', label: 'Experiencias para eventos, punto de venta, promociones o patrocinios' },
  { id: 'orientacion', label: 'Necesito orientación', exclusiva: true },
];

// B-03 · Pregunta por pilar — solo se profundiza en el pilar prioritario.
const PREGUNTAS_PILAR = {
  marketing: ['Estrategia o posicionamiento', 'Campaña o comunicación', 'Marketing o canales digitales', 'Otra necesidad'],
  studio: ['Identidad o piezas', 'Fotografía', 'Animación o video', 'Otra necesidad'],
  educa: ['Adopción o aplicación de IA', 'Aprender audiovisual con IA', 'Marca o marketing', 'Otras habilidades'],
  soluciona: ['Configurar, conectar o automatizar', 'Producto GEC', 'Sistema a la medida o con IA', 'Otra necesidad'],
  experience: [
    'Gestionar un evento',
    'Involucrar audiencia en un evento',
    'Activación de punto de venta, promoción o patrocinio',
    'Otra experiencia',
  ],
};
const OTRA_OPCION = {
  marketing: 'Otra necesidad',
  studio: 'Otra necesidad',
  educa: 'Otras habilidades',
  soluciona: 'Otra necesidad',
  experience: 'Otra experiencia',
};

// tema= en la URL viene de los CTA de CompañIA/Audiovisual en /educa/ — precarga
// la respuesta de B-03 en vez de dejar a la persona elegirla otra vez.
const TEMA_A_NECESIDAD = { companiia: 'Adopción o aplicación de IA', audiovisual: 'Aprender audiovisual con IA' };

const ETAPAS = ['Exploración', 'Necesidad clara', 'Evaluación', 'Listo para iniciar', 'Mejora de una iniciativa existente'];
const TIEMPOS = ['30 días', '1 a 3 meses', '3 a 6 meses', 'Sin fecha definida'];
const INVERSIONES = ['Ya está definida', 'Necesito una estimación', 'Estoy evaluando', 'Aún no está asignada'];
const ROLES = ['Decisor final', 'Influye en la decisión', 'Recopila información'];
const CANALES = ['WhatsApp', 'Correo', 'Llamada'];
const LETRAS = ['A', 'B', 'C', 'D', 'E', 'F'];

const STORAGE_KEY = 'gec-brief-progreso';

const campoBase =
  'rounded-xl border bg-[#10161D] px-5 py-4 text-[17px] text-[#EDEAE4] outline-none transition-colors placeholder:text-[rgba(237,234,228,.3)] focus:border-[#F5B301]';

// Cursor parpadeante al final de cada pregunta — la firma visual de un
// formulario "conversacional" tipo Typeform. Respeta prefers-reduced-motion
// por la regla global en index.css (fuerza duration a ~0 ahí).
function Pregunta({ children, contexto }) {
  return (
    <>
      {contexto && (
        <div className="mb-2.5 text-[12px] font-bold uppercase" style={{ ...P, letterSpacing: '.18em', color: '#F5B301' }}>
          {contexto}
        </div>
      )}
      <h2
        className="m-0 mb-9 max-w-[22ch] text-[clamp(24px,3.6vw,38px)] leading-[1.28] font-bold text-white"
        style={{ ...P, letterSpacing: '-.02em' }}
      >
        {children}
        <span
          aria-hidden="true"
          className="ml-[6px] inline-block w-[4px] animate-[blink_1.1s_linear_infinite] bg-[#F5B301] align-middle"
          style={{ height: '0.8em' }}
        />
      </h2>
    </>
  );
}

// Tarjeta seleccionable con badge de letra — el patrón que pide B-01 para
// toda pregunta de opción única o múltiple.
function Opcion({ letra, active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-4 rounded-2xl border px-5 py-4 text-left text-[16px] font-medium transition-all duration-200 hover:-translate-y-0.5"
      style={{
        ...P,
        borderColor: active ? '#F5B301' : 'rgba(255,255,255,.12)',
        background: active ? 'rgba(245,179,1,.12)' : '#10161D',
        color: active ? '#FFFFFF' : '#EDEAE4',
        boxShadow: active ? '0 10px 28px rgba(245,179,1,.14)' : 'none',
      }}
    >
      <span
        className="grid h-9 w-9 flex-none place-items-center rounded-lg border text-[13px] font-bold transition-colors"
        style={{
          borderColor: active ? '#F5B301' : 'rgba(255,255,255,.18)',
          background: active ? '#F5B301' : 'transparent',
          color: active ? '#10131A' : 'rgba(237,234,228,.42)',
        }}
      >
        {letra}
      </span>
      <span className="flex-1">{children}</span>
    </button>
  );
}

function BarraProgreso({ actual, total }) {
  return (
    <div className="fixed inset-x-0 top-0 z-[100] h-[3px] bg-white/[.06]">
      <div
        className="h-full bg-[#F5B301] transition-[width] duration-500 ease-out"
        style={{ width: `${Math.min(100, (actual / total) * 100)}%` }}
      />
    </div>
  );
}

function Atras({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-[13px] font-semibold"
      style={{ ...P, color: 'rgba(237,234,228,.45)' }}
    >
      <ArrowLeft size={14} /> Atrás
    </button>
  );
}

function Siguiente({ onClick, children = 'Continuar', disabled, type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex cursor-pointer items-center gap-2.5 rounded-full border-0 px-8 py-4 text-[15px] font-bold text-[#10131A] transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
      style={{ ...P, background: '#F5B301' }}
    >
      {children} <span className="text-[17px]">→</span>
    </button>
  );
}

// Un campo del resumen final — se omite solo si de verdad no hay valor
// (el paso correspondiente no se recorrió, p. ej. "orientación" sin pilar).
function ResumenCampo({ label, valor }) {
  if (!valor) return null;
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase" style={{ ...P, letterSpacing: '.14em', color: 'rgba(237,234,228,.45)' }}>
        {label}
      </div>
      <p className="m-0 mt-1 text-[15px] text-white" style={P}>
        {valor}
      </p>
    </div>
  );
}

// Pantalla genérica de opción única con avance automático al tocar — para
// las cinco preguntas cuya lista de opciones es fija (no depende de
// respuestas previas). Prioridad y pilar quedan aparte por su mapeo dinámico.
function PasoOpcion({ contexto, pregunta, opciones, valor, onSeleccionar, onAtras }) {
  return (
    <div>
      <Pregunta contexto={contexto}>{pregunta}</Pregunta>
      <div className="flex flex-col gap-3">
        {opciones.map((op, i) => (
          <Opcion key={op} letra={LETRAS[i]} active={valor === op} onClick={() => onSeleccionar(op)}>
            {op}
          </Opcion>
        ))}
      </div>
      <div className="mt-8">
        <Atras onClick={onAtras} />
      </div>
    </div>
  );
}

// Pantalla genérica de un solo campo de texto — Enter envía igual que el
// botón, foco automático al entrar a la pregunta.
function PasoTexto({ contexto, pregunta, placeholder, valor, onChange, onContinuar, onAtras, error, tipo = 'text', autoComplete, opcional }) {
  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onContinuar();
      }}
    >
      <Pregunta contexto={contexto}>{pregunta}</Pregunta>
      <input
        ref={inputRef}
        type={tipo}
        value={valor}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`${campoBase} w-full`}
        style={{ borderColor: error ? '#E8762B' : 'rgba(255,255,255,.14)' }}
      />
      {error && (
        <p className="m-0 mt-3 text-[13.5px] font-medium" style={{ color: '#E8762B' }}>
          {error}
        </p>
      )}
      <div className="mt-8 flex items-center justify-between">
        <Atras onClick={onAtras} />
        <Siguiente type="submit">{opcional ? 'Continuar' : 'OK'}</Siguiente>
      </div>
      <p className="m-0 mt-5 text-[12px]" style={{ ...P, color: 'rgba(237,234,228,.28)' }}>
        Presiona Enter ↵
      </p>
    </form>
  );
}

// Modal para "elegir otro servicio" desde el resultado — mismo lenguaje que
// el VideoModal de Inside Your Brand (fadeIn/modalIn ya definidos en
// index.css): fondo con blur, Escape cierra, click fuera cierra.
function ModalServicios({ open, onClose, actual }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      role="presentation"
      className="fixed inset-0 z-[200] grid animate-[fadeIn_.22s_ease_both] place-items-center bg-[rgba(4,7,10,.85)] p-4 backdrop-blur-[6px] sm:p-8"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Explorar otros servicios"
        className="relative w-full max-w-[720px] animate-[modalIn_.3s_cubic-bezier(.2,.8,.3,1)_both] rounded-[28px] border border-white/10 bg-[#0A0E13] p-[clamp(20px,3vw,36px)]"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase" style={{ ...P, letterSpacing: '.16em', color: '#F5B301' }}>
              La familia Meraki
            </div>
            <h3 className="m-0 mt-2 text-[clamp(20px,2.4vw,26px)] font-bold text-white" style={{ ...P, letterSpacing: '-.02em' }}>
              ¿Necesitas explorar otro servicio?
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="grid h-9 w-9 flex-none cursor-pointer place-items-center rounded-full border border-white/20 bg-transparent text-white/75 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {pilares.map((p) => {
            const activo = p.id === `p-${actual}`;
            return (
              <Link
                key={p.id}
                to={p.ruta}
                onClick={onClose}
                className="group flex items-center gap-4 rounded-2xl border px-4 py-3.5 text-left transition-colors"
                style={{
                  borderColor: activo ? 'rgba(245,179,1,.5)' : 'rgba(255,255,255,.1)',
                  background: activo ? 'rgba(245,179,1,.08)' : '#10161D',
                }}
              >
                <img
                  src={p.img}
                  alt={p.name}
                  loading="lazy"
                  className="h-12 w-12 flex-none rounded-full object-cover"
                  style={{ objectPosition: `${p.focus ?? 50}% 50%` }}
                />
                <span className="flex flex-col gap-0.5">
                  <span className="text-[14.5px] font-bold text-white" style={P}>
                    {p.name}
                  </span>
                  <span className="text-[12.5px] leading-[1.4]" style={{ ...P, color: 'rgba(237,234,228,.55)' }}>
                    {p.tagline}
                  </span>
                </span>
                <ArrowRight size={16} className="ml-auto flex-none text-white/30 transition-colors group-hover:text-[#F5B301]" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const RESPUESTAS_INICIALES = {
  areas: [],
  orientacionTexto: '',
  prioridad: null,
  necesidad: null,
  necesidadOtra: '',
  etapa: null,
  tiempo: null,
  inversion: null,
  empresa: { nombre: '', sector: '', ubicacion: '', tamano: '', web: '' },
  persona: { nombre: '', cargo: '', rol: '', correo: '', pais: 'HN', telefono: '', canal: '' },
  consentimiento: false,
};

export default function BriefPage() {
  const [params] = useSearchParams();
  const pilarParam = params.get('pilar');
  const temaParam = params.get('tema');

  useDocumentMeta({
    title: 'Cuéntanos qué necesita tu empresa | Grupo Espacio Creativo',
    description: 'Responde unas preguntas breves y te orientamos hacia la solución de GEC más adecuada. Menos de 90 segundos.',
    path: '/cuentanos-tu-reto/',
  });

  const leerGuardado = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    } catch {
      return null;
    }
  };

  const [paso, setPaso] = useState(() => {
    const g = leerGuardado();
    return g?.paso && g.paso !== 'resultado' ? g.paso : 'intro';
  });
  const [r, setR] = useState(() => {
    const g = leerGuardado();
    if (g?.r) return { ...RESPUESTAS_INICIALES, ...g.r };
    if (pilarParam && NOMBRE_PILAR[pilarParam]) {
      return { ...RESPUESTAS_INICIALES, areas: [pilarParam], prioridad: pilarParam, necesidad: TEMA_A_NECESIDAD[temaParam] ?? null };
    }
    return RESPUESTAS_INICIALES;
  });
  const [errores, setErrores] = useState({});
  const [modalAbierto, setModalAbierto] = useState(false);
  const enviado = useRef(false);
  const contentRef = useRef(null);

  const utm = useMemo(
    () =>
      Object.fromEntries(
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
          .map((k) => [k, params.get(k)])
          .filter(([, v]) => v),
      ),
    [params],
  );

  useEffect(() => {
    // "resultado" no se guarda: si se guardara, el removeItem() de
    // enviarBrief() quedaría pisado por este mismo efecto un instante
    // después (el cambio a "resultado" también dispara este efecto).
    if (paso === 'intro' || paso === 'resultado') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ paso, r }));
    } catch {
      /* modo privado: no pasa nada, solo no persiste */
    }
  }, [paso, r]);

  // Transición entre preguntas: la firma de un formulario conversacional. Sin
  // esto cada cambio de paso se siente como una recarga, no como avanzar.
  useGSAP(
    () => {
      if (!contentRef.current) return undefined;
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(contentRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
      });
      return () => mm.revert();
    },
    { dependencies: [paso], scope: contentRef },
  );

  const pais = useMemo(() => PAISES.find((p) => p.code === r.persona.pais) || PAISES[0], [r.persona.pais]);

  const setEmpresa = (k) => (e) => setR((s) => ({ ...s, empresa: { ...s.empresa, [k]: e.target.value } }));
  const setPersona = (k) => (e) => setR((s) => ({ ...s, persona: { ...s.persona, [k]: e.target.value } }));

  const toggleArea = (id) => {
    setR((s) => {
      if (id === 'orientacion') {
        const activo = s.areas.includes('orientacion');
        return { ...s, areas: activo ? [] : ['orientacion'] };
      }
      const sinOrientacion = s.areas.filter((a) => a !== 'orientacion');
      const activo = sinOrientacion.includes(id);
      const areas = activo ? sinOrientacion.filter((a) => a !== id) : [...sinOrientacion, id];
      return { ...s, areas };
    });
  };

  const esOrientacion = r.areas.length === 1 && r.areas[0] === 'orientacion';
  const necesitaPrioridad = r.areas.length > 1;
  const secuencia = useMemo(() => {
    const s = ['filtro'];
    if (necesitaPrioridad) s.push('prioridad');
    if (!esOrientacion) s.push('pilar');
    s.push(
      'etapa',
      'tiempo',
      'inversion',
      'empresa-nombre',
      'empresa-sector',
      'empresa-ubicacion',
      'empresa-tamano',
      'empresa-web',
      'persona-nombre',
      'persona-cargo',
      'persona-correo',
      'persona-telefono',
      'persona-rol',
      'persona-canal',
      'persona-consentimiento',
      'resultado',
    );
    return s;
  }, [necesitaPrioridad, esOrientacion]);
  const pasoActual = Math.max(1, secuencia.indexOf(paso) + 1);
  const totalPasos = secuencia.length - 1; // sin contar "resultado"

  const ir = (siguiente) => {
    if (paso === 'intro') track('brief_started');
    else if (paso !== 'resultado') track('brief_step_completed', { paso });
    setErrores({});
    setPaso(siguiente);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // "Abandonado" = se fue de la pestaña (o cerró) sin llegar al resultado,
  // habiendo ya empezado. `visibilitychange` es más confiable que
  // `beforeunload` para mandar el evento a tiempo, sobre todo en móvil.
  useEffect(() => {
    const onHidden = () => {
      if (document.visibilityState !== 'hidden') return;
      if (paso === 'intro' || paso === 'resultado') return;
      track('brief_abandoned', { paso });
    };
    document.addEventListener('visibilitychange', onHidden);
    return () => document.removeEventListener('visibilitychange', onHidden);
  }, [paso]);

  const siguienteDesde = (actual) => {
    const i = secuencia.indexOf(actual);
    return secuencia[i + 1] ?? 'resultado';
  };
  const anteriorDesde = (actual) => {
    const i = secuencia.indexOf(actual);
    return i <= 0 ? 'intro' : secuencia[i - 1];
  };

  // Auto-avance: fija la respuesta y, un instante después (para que se vea
  // el estado activo antes de saltar), pasa a la siguiente pregunta.
  const elegirYAvanzar = (actualizar) => {
    actualizar();
    setTimeout(() => ir(siguienteDesde(paso)), 260);
  };

  const validarFiltro = () => {
    if (r.areas.length === 0) return { ok: false, msg: 'Elige al menos un área.' };
    if (esOrientacion && !r.orientacionTexto.trim()) return { ok: false, msg: 'Cuéntanos brevemente qué necesitas.' };
    return { ok: true };
  };

  const necesidadesComplementarias = r.areas.filter((a) => a !== r.prioridad && a !== 'orientacion').map((a) => NOMBRE_PILAR[a]);

  const necesidadFinal = esOrientacion
    ? r.orientacionTexto
    : r.necesidad === OTRA_OPCION[r.prioridad]
      ? r.necesidadOtra
      : r.necesidad;

  const enviarBrief = () => {
    if (enviado.current) return;
    enviado.current = true;
    const payload = {
      areas: r.areas,
      prioridad: r.prioridad,
      necesidad: necesidadFinal,
      etapa: r.etapa,
      tiempo: r.tiempo,
      inversion: r.inversion,
      empresa: r.empresa,
      persona: { ...r.persona, telefono: `+${pais.dial} ${formatTelefono(r.persona.telefono, pais.mask)}` },
      fuente: { pilar: pilarParam, tema: temaParam, utm, url: window.location.href },
      ts: Date.now(),
    };
    track('brief_submitted', { pilar: r.prioridad || 'orientacion', ...utm });
    fetch('/api/brief', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch((e) => {
      console.error('Envío del brief falló', e);
    });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* no-op */
    }
  };

  const avanzarTexto = () => {
    const errs = {};
    if (paso === 'empresa-nombre' && !r.empresa.nombre.trim()) errs.campo = 'Escribe el nombre de la empresa.';
    if (paso === 'empresa-sector' && !r.empresa.sector.trim()) errs.campo = 'Escribe el sector.';
    if (paso === 'empresa-ubicacion' && !r.empresa.ubicacion.trim()) errs.campo = 'Escribe la ubicación.';
    if (paso === 'empresa-tamano' && !r.empresa.tamano.trim()) errs.campo = 'Escribe el tamaño aproximado.';
    if (paso === 'persona-nombre' && !r.persona.nombre.trim()) errs.campo = 'Escribe tu nombre.';
    if (paso === 'persona-cargo' && !r.persona.cargo.trim()) errs.campo = 'Escribe tu cargo.';
    if (paso === 'persona-correo') {
      const mail = validarCorreoEmpresarial(r.persona.correo);
      if (!mail.ok) errs.campo = mail.motivo;
    }
    if (Object.keys(errs).length) return setErrores(errs);
    ir(siguienteDesde(paso));
  };

  return (
    <main className="relative min-h-[100dvh] bg-[#0A0E13]">
      {paso !== 'intro' && paso !== 'resultado' && <BarraProgreso actual={pasoActual} total={totalPasos} />}
      <div className="flex min-h-[100dvh] items-center justify-center px-[clamp(20px,5vw,60px)] py-[130px]">
        <div ref={contentRef} className="w-full max-w-[600px]">
          {paso === 'intro' && (
            <div className="text-center">
              <Eyebrow color="#F5B301">Cuéntanos qué necesita tu empresa</Eyebrow>
              <h1
                className="m-0 mt-4 mb-6 text-[clamp(30px,4vw,46px)] leading-[1.1] font-extrabold text-white"
                style={{ ...P, letterSpacing: '-.03em' }}
              >
                Cuéntanos qué necesita tu empresa
              </h1>
              <p className="m-0 mb-3 text-[15.5px] leading-[1.7]" style={{ ...P, color: 'rgba(242,239,233,.65)' }}>
                Responde unas preguntas breves para ayudarnos a comprender tu necesidad y orientarte hacia la
                solución de GEC más adecuada.
              </p>
              <p className="m-0 mb-10 text-[13px] font-semibold uppercase" style={{ ...P, letterSpacing: '.14em', color: '#F5B301' }}>
                Menos de 90 segundos
              </p>
              <div className="flex justify-center">
                <Siguiente onClick={() => ir('filtro')}>Comenzar</Siguiente>
              </div>
            </div>
          )}

          {paso === 'filtro' && (
            <div>
              <Pregunta>¿En cuáles de estas áreas necesita apoyo tu empresa?</Pregunta>
              <div className="mb-3 flex flex-col gap-3">
                {AREAS.map((a, i) => (
                  <Opcion key={a.id} letra={LETRAS[i]} active={r.areas.includes(a.id)} onClick={() => toggleArea(a.id)}>
                    {a.label}
                  </Opcion>
                ))}
              </div>
              {esOrientacion && (
                <div className="mt-5">
                  <textarea
                    value={r.orientacionTexto}
                    onChange={(e) => setR((s) => ({ ...s, orientacionTexto: e.target.value }))}
                    rows={3}
                    placeholder="En dos líneas, qué te gustaría resolver"
                    className={`${campoBase} w-full resize-none`}
                    style={{ borderColor: 'rgba(255,255,255,.14)' }}
                  />
                </div>
              )}
              {errores.filtro && (
                <p className="m-0 mt-4 text-[13.5px] font-medium" style={{ color: '#E8762B' }}>
                  {errores.filtro}
                </p>
              )}
              <div className="mt-8 flex items-center justify-between">
                <Atras onClick={() => ir('intro')} />
                <Siguiente
                  onClick={() => {
                    const v = validarFiltro();
                    if (!v.ok) return setErrores({ filtro: v.msg });
                    if (!necesitaPrioridad && !esOrientacion) setR((s) => ({ ...s, prioridad: s.areas[0] }));
                    ir(siguienteDesde('filtro'));
                  }}
                />
              </div>
            </div>
          )}

          {paso === 'prioridad' && (
            <div>
              <Pregunta>¿Cuál de estas necesita atender primero?</Pregunta>
              <div className="flex flex-col gap-3">
                {r.areas
                  .filter((a) => a !== 'orientacion')
                  .map((id, i) => (
                    <Opcion
                      key={id}
                      letra={LETRAS[i]}
                      active={r.prioridad === id}
                      onClick={() => elegirYAvanzar(() => setR((s) => ({ ...s, prioridad: id })))}
                    >
                      {AREAS.find((a) => a.id === id)?.label}
                    </Opcion>
                  ))}
              </div>
              <div className="mt-8">
                <Atras onClick={() => ir(anteriorDesde('prioridad'))} />
              </div>
            </div>
          )}

          {paso === 'pilar' && (
            <div>
              <Pregunta contexto={NOMBRE_PILAR[r.prioridad]}>¿Qué necesitas exactamente?</Pregunta>
              <div className="flex flex-col gap-3">
                {(PREGUNTAS_PILAR[r.prioridad] || []).map((op, i) => (
                  <Opcion
                    key={op}
                    letra={LETRAS[i]}
                    active={r.necesidad === op}
                    onClick={() => {
                      const esOtra = op === OTRA_OPCION[r.prioridad];
                      if (esOtra) {
                        setR((s) => ({ ...s, necesidad: op }));
                      } else {
                        elegirYAvanzar(() => setR((s) => ({ ...s, necesidad: op })));
                      }
                    }}
                  >
                    {op}
                  </Opcion>
                ))}
              </div>
              {r.necesidad === OTRA_OPCION[r.prioridad] && (
                <div className="mt-5">
                  <input
                    type="text"
                    autoFocus
                    value={r.necesidadOtra}
                    onChange={(e) => setR((s) => ({ ...s, necesidadOtra: e.target.value }))}
                    placeholder="En pocas palabras, qué necesitas"
                    className={`${campoBase} w-full`}
                    style={{ borderColor: 'rgba(255,255,255,.14)' }}
                  />
                  <div className="mt-5 flex justify-end">
                    <Siguiente
                      onClick={() => {
                        if (!r.necesidadOtra.trim()) return setErrores({ pilar: 'Cuéntanos brevemente qué necesitas.' });
                        ir(siguienteDesde('pilar'));
                      }}
                    />
                  </div>
                </div>
              )}
              {errores.pilar && (
                <p className="m-0 mt-4 text-[13.5px] font-medium" style={{ color: '#E8762B' }}>
                  {errores.pilar}
                </p>
              )}
              <div className="mt-8">
                <Atras onClick={() => ir(anteriorDesde('pilar'))} />
              </div>
            </div>
          )}

          {paso === 'etapa' && (
            <PasoOpcion
              contexto="Contexto"
              pregunta="¿En qué etapa está esta necesidad?"
              opciones={ETAPAS}
              valor={r.etapa}
              onSeleccionar={(v) => elegirYAvanzar(() => setR((s) => ({ ...s, etapa: v })))}
              onAtras={() => ir(anteriorDesde('etapa'))}
            />
          )}

          {paso === 'tiempo' && (
            <PasoOpcion
              contexto="Contexto"
              pregunta="¿En cuánto tiempo la necesitas resolver?"
              opciones={TIEMPOS}
              valor={r.tiempo}
              onSeleccionar={(v) => elegirYAvanzar(() => setR((s) => ({ ...s, tiempo: v })))}
              onAtras={() => ir(anteriorDesde('tiempo'))}
            />
          )}

          {paso === 'inversion' && (
            <PasoOpcion
              contexto="Contexto"
              pregunta="¿Cómo está la inversión para esto?"
              opciones={INVERSIONES}
              valor={r.inversion}
              onSeleccionar={(v) => elegirYAvanzar(() => setR((s) => ({ ...s, inversion: v })))}
              onAtras={() => ir(anteriorDesde('inversion'))}
            />
          )}

          {paso === 'empresa-nombre' && (
            <PasoTexto
              contexto="Sobre tu empresa"
              pregunta="¿Cómo se llama tu empresa?"
              placeholder="Nombre de la empresa"
              autoComplete="organization"
              valor={r.empresa.nombre}
              onChange={setEmpresa('nombre')}
              onContinuar={avanzarTexto}
              onAtras={() => ir(anteriorDesde('empresa-nombre'))}
              error={errores.campo}
            />
          )}

          {paso === 'empresa-sector' && (
            <PasoTexto
              contexto="Sobre tu empresa"
              pregunta="¿A qué sector pertenece?"
              placeholder="Retail, salud, educación…"
              valor={r.empresa.sector}
              onChange={setEmpresa('sector')}
              onContinuar={avanzarTexto}
              onAtras={() => ir(anteriorDesde('empresa-sector'))}
              error={errores.campo}
            />
          )}

          {paso === 'empresa-ubicacion' && (
            <PasoTexto
              contexto="Sobre tu empresa"
              pregunta="¿Dónde está ubicada?"
              placeholder="Ciudad, país"
              autoComplete="address-level2"
              valor={r.empresa.ubicacion}
              onChange={setEmpresa('ubicacion')}
              onContinuar={avanzarTexto}
              onAtras={() => ir(anteriorDesde('empresa-ubicacion'))}
              error={errores.campo}
            />
          )}

          {paso === 'empresa-tamano' && (
            <PasoTexto
              contexto="Sobre tu empresa"
              pregunta="¿Cuántas personas trabajan ahí, aproximadamente?"
              placeholder="Número aproximado"
              valor={r.empresa.tamano}
              onChange={setEmpresa('tamano')}
              onContinuar={avanzarTexto}
              onAtras={() => ir(anteriorDesde('empresa-tamano'))}
              error={errores.campo}
            />
          )}

          {paso === 'empresa-web' && (
            <PasoTexto
              contexto="Sobre tu empresa"
              pregunta="¿Cuál es su sitio web?"
              placeholder="tuempresa.com (opcional)"
              autoComplete="url"
              valor={r.empresa.web}
              onChange={setEmpresa('web')}
              onContinuar={() => ir(siguienteDesde('empresa-web'))}
              onAtras={() => ir(anteriorDesde('empresa-web'))}
              opcional
            />
          )}

          {paso === 'persona-nombre' && (
            <PasoTexto
              contexto="Sobre ti"
              pregunta="¿Cómo te llamas?"
              placeholder="Nombre y apellido"
              autoComplete="name"
              valor={r.persona.nombre}
              onChange={setPersona('nombre')}
              onContinuar={avanzarTexto}
              onAtras={() => ir(anteriorDesde('persona-nombre'))}
              error={errores.campo}
            />
          )}

          {paso === 'persona-cargo' && (
            <PasoTexto
              contexto="Sobre ti"
              pregunta="¿Cuál es tu cargo?"
              placeholder="Gerente de Marketing"
              autoComplete="organization-title"
              valor={r.persona.cargo}
              onChange={setPersona('cargo')}
              onContinuar={avanzarTexto}
              onAtras={() => ir(anteriorDesde('persona-cargo'))}
              error={errores.campo}
            />
          )}

          {paso === 'persona-correo' && (
            <PasoTexto
              contexto="Sobre ti"
              pregunta="¿Cuál es tu correo empresarial?"
              placeholder="nombre@tuempresa.com"
              tipo="email"
              autoComplete="email"
              valor={r.persona.correo}
              onChange={setPersona('correo')}
              onContinuar={avanzarTexto}
              onAtras={() => ir(anteriorDesde('persona-correo'))}
              error={errores.campo}
            />
          )}

          {paso === 'persona-telefono' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (r.persona.telefono.replace(/\D/g, '').length !== pais.len) {
                  return setErrores({ campo: `El número de ${pais.label} lleva ${pais.len} dígitos.` });
                }
                ir(siguienteDesde('persona-telefono'));
              }}
            >
              <Pregunta contexto="Sobre ti">¿Cuál es tu WhatsApp?</Pregunta>
              <div className="flex gap-3">
                <select
                  value={r.persona.pais}
                  onChange={(e) => setR((s) => ({ ...s, persona: { ...s.persona, pais: e.target.value, telefono: '' } }))}
                  aria-label="País"
                  className={`${campoBase} w-[116px] flex-none cursor-pointer`}
                  style={{ borderColor: 'rgba(255,255,255,.14)' }}
                >
                  {PAISES.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.flag} +{p.dial}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoFocus
                  value={formatTelefono(r.persona.telefono, pais.mask)}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, pais.len);
                    setR((s) => ({ ...s, persona: { ...s.persona, telefono: digits } }));
                  }}
                  placeholder={pais.mask}
                  autoComplete="tel-national"
                  className={`${campoBase} w-full`}
                  style={{ borderColor: errores.campo ? '#E8762B' : 'rgba(255,255,255,.14)' }}
                />
              </div>
              {errores.campo && (
                <p className="m-0 mt-3 text-[13.5px] font-medium" style={{ color: '#E8762B' }}>
                  {errores.campo}
                </p>
              )}
              <div className="mt-8 flex items-center justify-between">
                <Atras onClick={() => ir(anteriorDesde('persona-telefono'))} />
                <Siguiente type="submit">OK</Siguiente>
              </div>
              <p className="m-0 mt-5 text-[12px]" style={{ ...P, color: 'rgba(237,234,228,.28)' }}>
                Presiona Enter ↵
              </p>
            </form>
          )}

          {paso === 'persona-rol' && (
            <PasoOpcion
              contexto="Sobre ti"
              pregunta="¿Cuál es tu rol en esta decisión?"
              opciones={ROLES}
              valor={r.persona.rol}
              onSeleccionar={(v) => elegirYAvanzar(() => setR((s) => ({ ...s, persona: { ...s.persona, rol: v } })))}
              onAtras={() => ir(anteriorDesde('persona-rol'))}
            />
          )}

          {paso === 'persona-canal' && (
            <PasoOpcion
              contexto="Sobre ti"
              pregunta="¿Por dónde prefieres que te contactemos?"
              opciones={CANALES}
              valor={r.persona.canal}
              onSeleccionar={(v) => elegirYAvanzar(() => setR((s) => ({ ...s, persona: { ...s.persona, canal: v } })))}
              onAtras={() => ir(anteriorDesde('persona-canal'))}
            />
          )}

          {paso === 'persona-consentimiento' && (
            <div>
              <Pregunta>Antes de enviar.</Pregunta>
              <button
                type="button"
                onClick={() => setR((s) => ({ ...s, consentimiento: !s.consentimiento }))}
                className="flex w-full cursor-pointer items-start gap-4 rounded-2xl border px-5 py-5 text-left transition-colors"
                style={{
                  borderColor: r.consentimiento ? '#F5B301' : 'rgba(255,255,255,.14)',
                  background: r.consentimiento ? 'rgba(245,179,1,.1)' : '#10161D',
                }}
              >
                <span
                  className="mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-md border"
                  style={{
                    borderColor: r.consentimiento ? '#F5B301' : 'rgba(255,255,255,.25)',
                    background: r.consentimiento ? '#F5B301' : 'transparent',
                  }}
                >
                  {r.consentimiento && <Check size={15} color="#10131A" strokeWidth={3} />}
                </span>
                <span className="text-[15px] leading-[1.6]" style={{ ...P, color: '#EDEAE4' }}>
                  Acepto que GEC me contacte sobre esta necesidad y trate mis datos con ese fin.
                </span>
              </button>
              {errores.consentimiento && (
                <p className="m-0 mt-4 text-[13.5px] font-medium" style={{ color: '#E8762B' }}>
                  {errores.consentimiento}
                </p>
              )}
              <div className="mt-8 flex items-center justify-between">
                <Atras onClick={() => ir(anteriorDesde('persona-consentimiento'))} />
                <Siguiente
                  onClick={() => {
                    if (!r.consentimiento) return setErrores({ consentimiento: 'Marca la casilla para continuar.' });
                    enviarBrief();
                    ir('resultado');
                  }}
                >
                  Enviar
                </Siguiente>
              </div>
            </div>
          )}

          {paso === 'resultado' && (
            <div className="text-center">
              <Eyebrow color="#F5B301">Listo</Eyebrow>
              <h2
                className="m-0 mt-4 mb-6 text-[clamp(26px,3.2vw,38px)] leading-[1.15] font-extrabold text-white"
                style={{ ...P, letterSpacing: '-.03em' }}
              >
                Esto es lo que entendimos de tu empresa.
              </h2>

              <div className="mb-8 grid gap-x-8 gap-y-5 rounded-2xl border border-white/[.08] bg-[#10161D] p-6 text-left sm:grid-cols-2">
                <ResumenCampo label="Empresa" valor={r.empresa.nombre} />
                <ResumenCampo label="Contacto" valor={[r.persona.nombre, r.persona.cargo].filter(Boolean).join(' · ')} />
                <ResumenCampo label="Necesidad" valor={necesidadFinal} />
                {r.prioridad && r.prioridad !== 'orientacion' && (
                  <ResumenCampo label="Pilar recomendado" valor={NOMBRE_PILAR[r.prioridad]} />
                )}
                <ResumenCampo label="Etapa" valor={r.etapa} />
                <ResumenCampo label="Tiempo estimado" valor={r.tiempo} />
                {necesidadesComplementarias.length > 0 && (
                  <div className="sm:col-span-2">
                    <ResumenCampo label="También puede aportarte" valor={necesidadesComplementarias.join(' · ')} />
                    <button
                      type="button"
                      onClick={() => setModalAbierto(true)}
                      className="mt-2 inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-[13px] font-semibold"
                      style={{ ...P, color: '#F5B301' }}
                    >
                      Ver esos servicios <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3.5">
                {r.prioridad && r.prioridad !== 'orientacion' && (
                  <CtaPrimary to={RUTA_PILAR[r.prioridad]} color="#F5B301">
                    Conocer el pilar recomendado
                  </CtaPrimary>
                )}
                <button
                  type="button"
                  onClick={() => setModalAbierto(true)}
                  className="inline-flex cursor-pointer items-center gap-2.5 rounded-full border border-white/25 bg-transparent px-6 py-[15px] text-[15px] font-semibold text-[#F2EFE9] transition-colors hover:bg-white/[.08]"
                  style={P}
                >
                  Explorar otros servicios
                </button>
                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2.5 rounded-full border border-white/25 px-6 py-[15px] text-[15px] font-semibold text-[#F2EFE9] transition-colors hover:bg-white/[.08]"
                  style={P}
                >
                  Conversar con GEC
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      <ModalServicios open={modalAbierto} onClose={() => setModalAbierto(false)} actual={r.prioridad} />
    </main>
  );
}
