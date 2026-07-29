import { useMemo, useState } from 'react';
import { Lock, Check } from 'lucide-react';
import { PAISES, formatTelefono, validarCorreoEmpresarial } from '../data/paises';
import { AREAS, PUERTAS, C } from '../data/gecIA';

const P = { fontFamily: 'Poppins, sans-serif' };
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

/**
 * Segundo paso: el código que llegó al correo.
 *
 * Un solo campo de 6 dígitos en vez de seis casillas sueltas — pegar el código
 * desde el correo funciona a la primera, que es como lo va a hacer casi todo el
 * mundo. `inputMode numeric` saca el teclado de números en el teléfono.
 */
function CodigoPaso({
  codigo,
  setCodigo,
  enviando,
  fallo,
  reenviado,
  onVerificar,
  onReenviar,
  onCambiarCorreo,
}) {
  return (
    <form onSubmit={onVerificar} noValidate className="flex flex-col gap-5">
      <Campo label="Código de verificación">
        <input
          type="text"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          autoFocus
          className={`${campoBase} w-full max-w-[260px] text-center text-[26px] font-bold`}
          style={{
            ...P,
            letterSpacing: '.42em',
            textIndent: '.42em',
            borderColor: fallo ? '#C2410C' : 'rgba(20,24,31,.14)',
          }}
        />
      </Campo>

      {fallo && (
        <p className="m-0 text-[13.5px] font-medium" style={{ color: '#C2410C' }}>
          {fallo}
        </p>
      )}
      {reenviado && !fallo && (
        <p className="m-0 text-[13.5px] font-medium" style={{ color: '#0F6F63' }}>
          Te mandamos un código nuevo.
        </p>
      )}

      <div className="mt-1 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={enviando || codigo.length !== 6}
          className="inline-flex cursor-pointer items-center gap-2.5 rounded-full border-0 px-8 py-4 text-[15px] font-bold text-[#10131A] transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ ...P, background: C.amarillo }}
        >
          {enviando ? 'Comprobando…' : 'Verificar y entrar'} <span className="text-[17px]">→</span>
        </button>
        <button
          type="button"
          onClick={onReenviar}
          disabled={enviando}
          className="cursor-pointer border-0 bg-transparent p-0 text-[13px] font-semibold underline underline-offset-4 disabled:opacity-50"
          style={{ ...P, color: '#0F6F63' }}
        >
          Reenviar código
        </button>
        <button
          type="button"
          onClick={onCambiarCorreo}
          disabled={enviando}
          className="cursor-pointer border-0 bg-transparent p-0 text-[13px] disabled:opacity-50"
          style={{ ...P, color: 'rgba(20,24,31,.5)' }}
        >
          Usar otro correo
        </button>
      </div>

      <p className="m-0 text-[12.5px] leading-[1.6]" style={{ color: 'rgba(20,24,31,.45)' }}>
        El código caduca en 10 minutos. Si no lo ves, revisa la carpeta de spam.
      </p>
    </form>
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
  // 'datos' → se piden los campos · 'codigo' → se comprueba el correo
  const [paso, setPaso] = useState('datos');
  const [token, setToken] = useState('');
  const [codigo, setCodigo] = useState('');
  const [reenviado, setReenviado] = useState(false);

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

  const datosCompletos = () => {
    const area = AREAS.find((a) => a.badge === f.area);
    const puerta = PUERTAS.find((p) => p.badge === f.puerta);
    return {
      ...f,
      telefono: `+${pais.dial} ${formatTelefono(f.tel, pais.mask)}`,
      areaLabel: area?.label ?? f.area,
      puertaLabel: puerta?.label ?? f.puerta,
      ts: Date.now(),
    };
  };

  // Paso 1 — pedir el código al correo indicado.
  const pedirCodigo = async (e) => {
    e?.preventDefault();
    setFallo('');
    if (!validar()) return;
    setEnviando(true);
    try {
      const res = await fetch('/api/otp/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: f.email, nombre: f.nombre }),
      });
      const cuerpo = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(cuerpo.mensaje || `HTTP ${res.status}`);
      setToken(cuerpo.token);
      setCodigo('');
      setPaso('codigo');
    } catch (err) {
      setFallo(err.message || 'No pudimos enviar el código. Inténtalo de nuevo.');
    }
    setEnviando(false);
  };

  // Paso 2 — comprobar el código. El aviso interno lo manda el servidor, y solo
  // si el correo quedó verificado.
  const verificar = async (e) => {
    e.preventDefault();
    setFallo('');
    if (codigo.replace(/\D/g, '').length !== 6) {
      setFallo('El código son 6 dígitos.');
      return;
    }
    setEnviando(true);
    const datos = datosCompletos();
    try {
      const res = await fetch('/api/otp/verificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, codigo, datos }),
      });
      const cuerpo = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(cuerpo.mensaje || `HTTP ${res.status}`);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...datos, verificado: true }));
      } catch {
        /* modo privado: se desbloquea igual, solo no persiste */
      }
      onUnlock(datos);
    } catch (err) {
      setFallo(err.message || 'No pudimos verificar el código.');
      setEnviando(false);
    }
  };

  const reenviar = async () => {
    setReenviado(false);
    await pedirCodigo();
    setReenviado(true);
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
            {paso === 'datos' ? 'Desbloquea el catálogo completo' : 'Confirma tu correo'}
          </h3>
          <p
            className="m-0 max-w-[58ch] text-[15px] leading-[1.65]"
            style={{ color: 'rgba(20,24,31,.62)' }}
          >
            {paso === 'datos' ? (
              <>
                Déjanos tus datos con tu{' '}
                <strong className="font-semibold">correo empresarial</strong> y te abrimos las tres
                guías del módulo: por punto de partida, por programa y por área.
              </>
            ) : (
              <>
                Enviamos un código de 6 dígitos a{' '}
                <strong className="font-semibold text-[#101720]">{f.email}</strong>. Escríbelo aquí
                para abrir el catálogo.
              </>
            )}
          </p>
        </div>

        {paso === 'codigo' ? (
          <CodigoPaso
            codigo={codigo}
            setCodigo={setCodigo}
            enviando={enviando}
            fallo={fallo}
            reenviado={reenviado}
            onVerificar={verificar}
            onReenviar={reenviar}
            onCambiarCorreo={() => {
              setPaso('datos');
              setFallo('');
              setReenviado(false);
            }}
          />
        ) : (
        <form onSubmit={pedirCodigo} noValidate className="flex flex-col gap-5">
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
              {enviando ? 'Enviando código…' : 'Enviarme el código'}{' '}
              <span className="text-[17px]">→</span>
            </button>
            <span
              className="inline-flex items-center gap-1.5 text-[12.5px]"
              style={{ color: 'rgba(20,24,31,.5)' }}
            >
              <Check size={14} /> Solo lo usamos para contactarte sobre el módulo.
            </span>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
