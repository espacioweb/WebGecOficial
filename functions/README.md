# Endpoints del sitio (Cloudflare Pages Functions)

Todo lo que hay en `functions/` se publica solo con cada despliegue: no hay que
crear ni desplegar nada aparte. `functions/api/otp/enviar.js` queda en
`/api/otp/enviar`, y así con el resto.

## Brief empresarial

| Endpoint | Qué hace |
|---|---|
| `POST /api/brief` | Recibe las respuestas del brief (`/cuentanos-tu-reto/`) y avisa a Telegram |

No pide correo verificado — a diferencia del catálogo de Educa, el brief no
protege contenido, así que no hay OTP de por medio ni variables de entorno que
configurar. La clasificación interna (Prioritaria / En evaluación / Para
desarrollar) se calcula **aquí, server-side**, precisamente para que nunca
viaje de vuelta al navegador ni se pueda ver desde las herramientas de
desarrollador del cliente.

## Comunidad de Inside Your Brand

| Endpoint | Qué hace |
|---|---|
| `POST /api/suscribir` | Recibe el correo del botón "Suscribirme" (IYB-06, `/inside-your-brand/`) y avisa a Telegram |

Mismo patrón que `/api/brief`: sin base de datos propia ni variables de
entorno, solo valida el formato del correo y reusa el worker de Telegram
como bandeja de entrada. Si el aviso a Telegram falla no bloquea al usuario
(mismo criterio que el resto de estos endpoints) — pero si la petición en sí
falla (ej. 404 en `npm run dev`, ver "Probar en local" más abajo) el
formulario sí lo muestra como error, porque a diferencia del brief no hay un
paso previo del que el usuario ya haya visto confirmación.

## Verificación del correo por código

Impide que alguien entre al catálogo con un correo empresarial inventado. Son
dos pasos: se pide el código, llega por correo, se comprueba.

| Endpoint | Qué hace |
|---|---|
| `POST /api/otp/enviar` | Valida que el correo sea empresarial, genera 6 dígitos, los manda con Resend y devuelve un *token* firmado |
| `POST /api/otp/verificar` | Comprueba el código contra el token y, solo si cuadra, avisa a Telegram |

No hay base de datos. El código nunca se guarda: el token lleva una firma HMAC
calculada sobre `datos + código`, y para verificar se recalcula.

**Caduca a los 90 segundos y admite 2 intentos.** Los dos números viven en
`shared/otp.js` (`VIDA_MS` y `MAX_INTENTOS`) y de ahí salen también el texto del
correo y la cuenta atrás del formulario — no hay que tocarlos en más sitios.
Si 90 s resulta demasiado justo en la práctica y empieza a bloquear a gente
legítima, `VIDA_MS` es lo único que hay que subir.

El contador de intentos funciona porque el token va con **dos firmas** separadas:
una sobre el código (que el servidor no puede recalcular) y otra sobre el
contador (que sí). Así puede reemitir el token con un intento más sin conocer el
código. Está explicado en `shared/otp.js`, incluido **lo que no cubre**.

## Variables que hay que configurar

En **Cloudflare Pages → el proyecto → Settings → Environment variables**, para
Production y para Preview:

| Nombre | Valor | Marcar como secreto |
|---|---|---|
| `RESEND_API_KEY` | La clave de Resend (`re_…`) | Sí |
| `OTP_SECRET` | Cualquier cadena larga y aleatoria | Sí |

Para generar el secreto:

```bash
openssl rand -base64 32
```

Sin estas dos variables los endpoints responden 500 con un mensaje claro, y el
formulario no deja pasar a nadie. Es a propósito: preferimos que no abra a que
abra sin verificar.

> **Ojo, esto muerde:** Cloudflare Pages **no aplica las variables al
> guardarlas**, las inyecta en el siguiente despliegue. Si las agregas después
> del último build, el sitio sigue corriendo sin ellas y el formulario responde
> *«El verificador aún no está configurado»* aunque en el panel se vean puestas.
> Basta con relanzar el despliegue (Deployments → el último → Retry deployment)
> o empujar cualquier commit.

### GA4 — distinta de las anteriores, no la mezcles en la misma lógica

| Nombre | Valor | Marcar como secreto |
|---|---|---|
| `VITE_GA_MEASUREMENT_ID` | El Measurement ID de la propiedad GA4 (`G-XXXXXXX`) | No — es público, viaja en el HTML de cualquier página igual |

Se configura en el mismo panel que `RESEND_API_KEY`/`OTP_SECRET`, pero es de un
tipo distinto: la lee **Vite al compilar** (`import.meta.env.VITE_...`,
`src/utils/analytics.js`), no una Function en tiempo de ejecución. Aplica el
mismo "ojo, esto muerde" de arriba — sin relanzar el despliegue después de
agregarla, el build ya hecho sigue sin ella. Sin configurar, el sitio no
manda nada a GA4: `track()` no hace nada, no hay error, no hay nada que
arreglar antes de desplegar.

## El remitente

Se envía desde `no-reply@updates.grupoespaciocreativo.com`, que es el subdominio
ya verificado en Resend (tiene su DKIM en el DNS). **Si algún día se cambia el
subdominio de envío en Resend, hay que cambiar `REMITENTE` en `enviar.js`** o
los correos dejarán de salir.

## Recomendado: limitar los intentos

El límite de 2 intentos es real para el uso normal, pero al no haber almacén
nadie impide reenviar una copia del token anterior con el contador a cero. La
ventana de 90 s deja muy poco margen para intentarlo; para cerrarlo del todo, en
**Cloudflare → Security → WAF → Rate limiting rules**:

- Si `http.request.uri.path eq "/api/otp/verificar"`
- Más de **10 peticiones por minuto** desde la misma IP
- Acción: bloquear 1 minuto

Con eso, adivinar el código a ciegas deja de ser viable.

## Probar en local

El servidor de Vite (`npm run dev`, puerto 5173) **no ejecuta estas funciones**:
`/api/...` dará 404 y el formulario mostrará un error de envío. Para probarlas
hay que levantar el runtime de Cloudflare:

```bash
npm run build
npx wrangler pages dev dist --port 8788 \
  --binding OTP_SECRET=lo-que-sea RESEND_API_KEY=re_tu_clave
```

Con una clave falsa, `enviar` responde 502 (que es correcto: Resend la rechaza)
y el resto de comprobaciones sí se puede probar entera.
