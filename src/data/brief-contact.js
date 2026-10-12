import { validarCorreoEmpresarial } from './paises.js';
export const VINCULOS_NEGOCIO = ['Propietario', 'Socio', 'Responsable', 'Colaborador'];
export const NECESIDADES_DIGITALES = ['Sí', 'Quiero orientación', 'Ya contamos con eso', 'Ahora no'];
const texto = (v) => typeof v === 'string' ? v.trim() : '';
export function validarCorreoContacto(email, tipo = 'corporativo') {
  if (tipo === 'corporativo') return validarCorreoEmpresarial(email);
  if (tipo !== 'personal') return { ok: false, motivo: 'Elige cómo contactarte.' };
  return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(texto(email)) && texto(email).length <= 254
    ? { ok: true, motivo: '' } : { ok: false, motivo: 'Escribe un correo válido.' };
}
export function enlaceComercialValido(value) {
  const input = texto(value);
  if (!input || input.length > 1000) return false;
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(input) ? input : `https://${input}`);
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password
      && /^[a-z\d](?:[a-z\d.-]*[a-z\d])?\.[a-z]{2,}$/i.test(url.hostname)
      && !url.hostname.includes('..');
  } catch { return false; }
}
export const validarEnlaceNegocio = enlaceComercialValido;
export function validarContactoBrief(answers, { requireProof = true } = {}) {
  const contacto = answers?.contacto || {};
  const correo = validarCorreoContacto(answers?.persona?.correo, contacto.tipo || 'corporativo');
  if (!correo.ok || (contacto.tipo || 'corporativo') === 'corporativo') return correo;
  if (texto(answers?.empresa?.nombre).length < 2) return { ok: false, motivo: 'Escribe el nombre de tu negocio.' };
  if (!VINCULOS_NEGOCIO.includes(answers?.persona?.vinculo)) return { ok: false, motivo: 'Indica tu relación con el negocio.' };
  if (!['enlace', 'ninguna'].includes(contacto.presencia)) return { ok: false, motivo: 'Indica si tu negocio tiene website o perfil comercial.' };
  if (contacto.presencia === 'enlace' && !enlaceComercialValido(answers?.empresa?.web)) return { ok: false, motivo: 'Escribe un dominio o enlace válido del negocio.' };
  if (!NECESIDADES_DIGITALES.includes(contacto.necesidadDigital)) return { ok: false, motivo: 'Indica si necesitas dominio, correo corporativo o website.' };
  const proof = texto(contacto.verificationProof);
  if (requireProof && (!/^[a-f0-9-]{36}\.\d{13}\.[a-f0-9]{64}$/.test(proof) || Number(proof.split('.')[1]) <= Date.now())) return { ok: false, motivo: 'Verifica tu correo para continuar.' };
  return { ok: true, motivo: '' };
}
