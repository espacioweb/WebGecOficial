import { useMemo, useState } from 'react';
import { Lock, Check } from 'lucide-react';
import { PAISES, formatTelefono, validarCorreoEmpresarial } from '../data/paises';
import { AREAS, PUERTAS, C } from '../data/gecIA';

const P = { fontFamily: 'Poppins, sans-serif' };
const NOTIFY_URL = 'https://palabras-gec.operaciones-659.workers.dev/notify';
const STORAGE_KEY = 'gec-ia-acceso';

export function leerAcceso() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
}

const campoBase =
  'rounded-xl border bg-white px-4 py-3 text-[14.5px] text-[#101720] outline-none transition-colors placeholder:text-[rgba(20,24,31,.38)] focus:border-[#101720]';

function Campo({ label, error, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span
        className="text-[11px] font-bold uppercase"
        style={{ ...P, letterSpacing: '.14em', color: 'rgba(20,24,31,.5)' }}
      >
        {label}
      </span>
      {children}
      {error && (
        <span className="text-[12.5px] font-medium" style={{ color: '#C2410C' }}>
          {error}
        </span>
      )}
    </label>
  );
}

export default function GateForm({ onUnlock }) {
  const [f, setF] = useState({
    nombre: '',
    email: '',
    empresa: '',
    cargo: '',
    pais: 'HN',
    tel: '',
    area: '',
    puerta: '',
  });
  const [errs, setErrs] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [fallo, setFallo] = useState('');

  const pais = useMemo(() => PAISES.find((p) => p.code === f.pais) || PAISES[0], [f.pais]);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const onTel = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, pais.len);
    setF((s) => ({ ...s, tel: digits }));
  };

  const validar = () => {
    const next = {};
    if (!f.nombre.trim()) next.nombre = 'Escribe tu nombre.';

    const mail = validarCorreoEmpresarial(f.email);
    if (!mail.ok) next.email = mail.motivo;

    if (!f.empresa.trim()) next.empresa = 'Escribe el nombre de tu empresa.';
    if (!f.cargo.trim()) next.cargo = 'Escribe tu cargo.';
    if (f.tel.replace(/\D/g, '').length !== pais.len) {
      next.tel = `El número de ${pais.label} lleva ${pais.len} dígitos.`;
    }
    if (!f.area) next.area = 'Elige el área.';
    if (!f.puerta) next.puerta = 'Elige el punto de partida.';

    setErrs(next);
    return Object.keys(next).length === 0;
  };

  const enviar = async (e) => {
    e.preventDefault();
    setFallo('');
    if (!validar()) return;
    setEnviando(true);

    const area = AREAS.find((a) => a.badge === f.area);
    const puerta = PUERTAS.find((p) => p.badge === f.puerta);
    const telefono = `+${pais.dial} ${formatTelefono(f.tel, pais.mask)}`;

    const message = `🔓 *ACCESO GEC IA*

👤 ${f.nombre}
🏢 ${f.empresa} — ${f.cargo}
📧 ${f.email}
📱 ${telefono}

🗂️ Área: *${area ? area.label : f.area}*
🚪 Punto de partida: *${puerta ? puerta.label : f.puerta}*
🧭 Ruta sugerida: ${puerta ? puerta.ruta.length : 0} programas

_Grupo Espacio Creativo · módulo interno_`;

    const datos = { ...f, telefono, areaLabel: area?.label, puertaLabel: puerta?.label, ts: Date.now() };

    try {
      const res = await fetch(NOTIFY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'custom', message }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
      } catch {
        /* modo privado: se desbloquea igual, solo no persiste */
      }
      onUnlock(datos);
    } catch {
      setFallo('No pudimos registrar tu acceso. Revisa tu conexión e inténtalo de nuevo.');
      setEnviando(false);
    }
  };

  return (
    <div className="mx-auto max-w-[860px]">
      <div
        className="relative overflow-hidden rounded-[clamp(20px,2.4vw,30px)] border border-[rgba(20,24,31,.1)] bg-white px-[clamp(24px,4vw,54px)] py-[clamp(30px,4vw,48px)]"
        style={{ boxShadow: '0 26px 60px rgba(16,23,32,.10)' }}
      >
        <div className="absolute inset-x-0 top-0 h-[5px]" style={{ background: C.turquesa }} />

        <div className="mb-8 flex flex-col gap-3">
          <span
            className="inline-flex w-fit items-center gap-2 rounded-lg px-3 py-1.5 text-[10.5px] font-bold uppercase"
            style={{
              ...P,
              letterSpacing: '.16em',
              background: `${C.turquesa}22`,
              color: '#0F6F63',
            }}
          >
            <Lock size={13} /> Contenido para empresas
          </span>
          <h3
            className="m-0 text-[clamp(22px,2.8vw,32px)] leading-[1.14] font-bold text-[#101720]"
            style={{ ...P, letterSpacing: '-.03em' }}
          >
            Desbloquea el catálogo completo
          </h3>
          <p
            className="m-0 max-w-[58ch] text-[15px] leading-[1.65]"
            style={{ color: 'rgba(20,24,31,.62)' }}
          >
            Déjanos tus datos con tu <strong className="font-semibold">correo empresarial</strong> y
            te abrimos las tres guías del módulo: por punto de partida, por programa y por área.
          </p>
        </div>

        <form onSubmit={enviar} noValidate className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Campo label="Nombre y apellido" error={errs.nombre}>
              <input
                type="text"
                value={f.nombre}
                onChange={set('nombre')}
                placeholder="María Fernández"
                autoComplete="name"
                className={`${campoBase} w-full`}
                style={{ borderColor: errs.nombre ? '#C2410C' : 'rgba(20,24,31,.14)' }}
              />
            </Campo>

            <Campo label="Correo empresarial" error={errs.email}>
              <input
                type="email"
                value={f.email}
                onChange={set('email')}
                placeholder="nombre@tuempresa.com"
                autoComplete="email"
                className={`${campoBase} w-full`}
                style={{ borderColor: errs.email ? '#C2410C' : 'rgba(20,24,31,.14)' }}
              />
            </Campo>

            <Campo label="Empresa" error={errs.empresa}>
              <input
                type="text"
                value={f.empresa}
                onChange={set('empresa')}
                placeholder="Nombre de la empresa"
                autoComplete="organization"
                className={`${campoBase} w-full`}
                style={{ borderColor: errs.empresa ? '#C2410C' : 'rgba(20,24,31,.14)' }}
              />
            </Campo>

            <Campo label="Cargo" error={errs.cargo}>
              <input
                type="text"
                value={f.cargo}
                onChange={set('cargo')}
                placeholder="Gerente de Marketing"
                autoComplete="organization-title"
                className={`${campoBase} w-full`}
                style={{ borderColor: errs.cargo ? '#C2410C' : 'rgba(20,24,31,.14)' }}
              />
            </Campo>
          </div>

          <Campo label="WhatsApp" error={errs.tel}>
            <div className="flex gap-2.5">
              <select
                value={f.pais}
                onChange={(e) => setF((s) => ({ ...s, pais: e.target.value, tel: '' }))}
                aria-label="País"
                className={`${campoBase} w-[136px] flex-none cursor-pointer`}
                style={{ borderColor: 'rgba(20,24,31,.14)' }}
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
                value={formatTelefono(f.tel, pais.mask)}
                onChange={onTel}
                placeholder={pais.mask.replace(/0/g, '0')}
                autoComplete="tel-national"
                className={`${campoBase} w-full`}
                style={{ borderColor: errs.tel ? '#C2410C' : 'rgba(20,24,31,.14)' }}
              />
            </div>
          </Campo>

          <div className="grid gap-5 sm:grid-cols-2">
            <Campo label="Tu área" error={errs.area}>
              <select
                value={f.area}
                onChange={set('area')}
                className={`${campoBase} w-full cursor-pointer`}
                style={{ borderColor: errs.area ? '#C2410C' : 'rgba(20,24,31,.14)' }}
              >
                <option value="">Selecciona un área…</option>
                {AREAS.map((a) => (
                  <option key={a.badge} value={a.badge}>
                    {a.label} — {a.meta}
                  </option>
                ))}
              </select>
            </Campo>

            <Campo label="¿Dónde está la empresa hoy?" error={errs.puerta}>
              <select
                value={f.puerta}
                onChange={set('puerta')}
                className={`${campoBase} w-full cursor-pointer`}
                style={{ borderColor: errs.puerta ? '#C2410C' : 'rgba(20,24,31,.14)' }}
              >
                <option value="">Selecciona tu punto de partida…</option>
                {PUERTAS.map((p) => (
                  <option key={p.badge} value={p.badge}>
                    {p.badge} · {p.label}
                  </option>
                ))}
              </select>
            </Campo>
          </div>

          {fallo && (
            <p className="m-0 text-[13.5px] font-medium" style={{ color: '#C2410C' }}>
              {fallo}
            </p>
          )}

          <div className="mt-1 flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={enviando}
              className="inline-flex cursor-pointer items-center gap-2.5 rounded-full border-0 px-8 py-4 text-[15px] font-bold text-[#10131A] transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70"
              style={{ ...P, background: C.amarillo }}
            >
              {enviando ? 'Abriendo…' : 'Ver el catálogo'} <span className="text-[17px]">→</span>
            </button>
            <span
              className="inline-flex items-center gap-1.5 text-[12.5px]"
              style={{ color: 'rgba(20,24,31,.5)' }}
            >
              <Check size={14} /> Solo lo usamos para contactarte sobre el módulo.
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
