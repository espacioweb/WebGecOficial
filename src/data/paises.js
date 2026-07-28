// Códigos de país para el WhatsApp del formulario. Honduras primero: es el
// mercado principal de GEC y queda preseleccionado.
export const PAISES = [
  { code: 'HN', dial: '504', label: 'Honduras', flag: '🇭🇳', len: 8, mask: '0000-0000' },
  { code: 'GT', dial: '502', label: 'Guatemala', flag: '🇬🇹', len: 8, mask: '0000-0000' },
  { code: 'SV', dial: '503', label: 'El Salvador', flag: '🇸🇻', len: 8, mask: '0000-0000' },
  { code: 'NI', dial: '505', label: 'Nicaragua', flag: '🇳🇮', len: 8, mask: '0000-0000' },
  { code: 'CR', dial: '506', label: 'Costa Rica', flag: '🇨🇷', len: 8, mask: '0000-0000' },
  { code: 'PA', dial: '507', label: 'Panamá', flag: '🇵🇦', len: 8, mask: '0000-0000' },
  { code: 'MX', dial: '52', label: 'México', flag: '🇲🇽', len: 10, mask: '000-000-0000' },
  { code: 'CO', dial: '57', label: 'Colombia', flag: '🇨🇴', len: 10, mask: '000-000-0000' },
  { code: 'US', dial: '1', label: 'Estados Unidos', flag: '🇺🇸', len: 10, mask: '(000) 000-0000' },
  { code: 'ES', dial: '34', label: 'España', flag: '🇪🇸', len: 9, mask: '000-000-000' },
  { code: 'DO', dial: '1', label: 'Rep. Dominicana', flag: '🇩🇴', len: 10, mask: '(000) 000-0000' },
  { code: 'PE', dial: '51', label: 'Perú', flag: '🇵🇪', len: 9, mask: '000-000-000' },
  { code: 'CL', dial: '56', label: 'Chile', flag: '🇨🇱', len: 9, mask: '0-0000-0000' },
  { code: 'AR', dial: '54', label: 'Argentina', flag: '🇦🇷', len: 10, mask: '00-0000-0000' },
  { code: 'EC', dial: '593', label: 'Ecuador', flag: '🇪🇨', len: 9, mask: '00-000-0000' },
];

// Aplica la máscara del país sobre los dígitos escritos.
export function formatTelefono(digits, mask) {
  let out = '';
  let i = 0;
  for (const ch of mask) {
    if (i >= digits.length) break;
    if (ch === '0') {
      out += digits[i];
      i += 1;
    } else {
      out += ch;
    }
  }
  return out;
}

// Dominios que NO se aceptan: el módulo es para empresas.
const DOMINIOS_PERSONALES = new Set([
  'gmail.com', 'googlemail.com', 'hotmail.com', 'hotmail.es', 'outlook.com',
  'outlook.es', 'live.com', 'live.com.mx', 'msn.com', 'yahoo.com', 'yahoo.es',
  'yahoo.com.mx', 'icloud.com', 'me.com', 'mac.com', 'aol.com', 'proton.me',
  'protonmail.com', 'gmx.com', 'zoho.com', 'mail.com', 'yandex.com',
  'tutanota.com', 'hushmail.com', 'inbox.com', 'fastmail.com',
]);

/**
 * Valida que el correo sea corporativo.
 * Devuelve { ok, motivo } para poder explicar el rechazo al usuario.
 */
export function validarCorreoEmpresarial(valor) {
  const email = String(valor || '').trim().toLowerCase();
  if (!email) return { ok: false, motivo: 'Escribe tu correo.' };

  // Formato: algo@algo.tld — sin espacios, con punto en el dominio
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) {
    return { ok: false, motivo: 'Ese correo no tiene un formato válido.' };
  }

  const dominio = email.split('@')[1];
  if (DOMINIOS_PERSONALES.has(dominio)) {
    return {
      ok: false,
      motivo: 'Usa el correo de tu empresa: los dominios personales no dan acceso.',
    };
  }
  return { ok: true, motivo: '' };
}
