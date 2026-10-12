# Endpoints del sitio (Cloudflare Pages Functions)

Todo lo que hay en `functions/` se publica solo con cada despliegue: no hay que
crear ni desplegar nada aparte. `functions/api/otp/enviar.js` queda en
`/api/otp/enviar`, y así con el resto.

## Brief empresarial

| Endpoint | Qué hace |
|---|---|
| `POST /api/brief` | Recibe las respuestas del brief (`/cuentanos-tu-reto/`) y avisa a Telegram |

No pide correo verificado — a diferencia del catálogo de Educa, el brief no
protege contenido, así que no hay OTP de por medio. La recuperación opcional
del avance requiere los bindings y variables de la sección siguiente.
La clasificación interna (Prioritaria / En evaluación / Para
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

## Recuperación del brief

El correo aparece en la tercera pregunta. La persona puede aceptar, mediante
una casilla sin marcar, guardar su avance y recibir un recordatorio. Si no
acepta, no se guarda un borrador ni se programa correo; puede completar el brief.
Cada apertura normal empieza limpia. Un enlace explícito del correo restaura
sus propias respuestas y el paso pendiente. Los borradores vencen a los 14 días.

| Endpoint | Función |
|---|---|
| `POST /api/brief/draft` | Crea o actualiza un borrador con permiso; `clientId` hace idempotente la creación |
| `GET /api/brief/draft` | Recupera mediante `Authorization: Bearer <token>` |
| `POST /api/brief/cancel` | Retira el permiso y borra las respuestas del borrador |
| `POST /api/brief/reminders` | Procesa los recordatorios; requiere autorización del programador |
| `POST /api/brief` | Confirma la finalización y cancela el recordatorio antes de responder |

Bindings de Pages: `BRIEF_DB` (D1), `BRIEF_RECOVERY_SECRET` (secreto nuevo) y
`RESEND_API_KEY` (configuración de envío existente). `BRIEF_SITE_URL` define el
origen de los enlaces. El script de configuración modifica exclusivamente
variables `BRIEF_*`; nunca debe volver a enviar claves existentes redactadas.

El Worker de `workers/brief-reminders/` consulta el endpoint protegido cada
15 minutos. Se envía un recordatorio por borrador después de 24 horas sin
actividad, siempre que siga pendiente y autorizado. SQL evita ejecuciones
concurrentes; la clave de idempotencia de Resend evita repetir un envío incierto.
Los reintentos de ese mismo envío se detienen antes de vencer esa garantía.

Para Preview hay una base independiente. El filtro `BRIEF_TEST_RECIPIENT`
limita los correos a la dirección de prueba autorizada. El intervalo reducido
`BRIEF_REMINDER_DELAY_MS=60000` solo se acepta en un origen `.pages.dev`;
producción siempre usa 24 horas. El token viaja en el fragmento del enlace y
se elimina antes de analytics; no se envía en la URL del endpoint de lectura.

Comprobaciones:

```bash
node --test tests/backend/brief-recovery.test.js
npm run build
wrangler deploy --dry-run --config workers/brief-reminders/wrangler.jsonc
```

La configuración local `wrangler.local.jsonc` no es la configuración de
despliegue de Pages; sus bindings siguen gestionados en el proyecto remoto.
La base de producción está preparada, pero se conecta y se publica solo
después de la aprobación del usuario. La prueba real de correo requiere una
clave de envío utilizable en el entorno donde se ejecute.

Las copias privadas y los archivos `*.local` no se suben a Git. Los scripts
de `scripts/brief-recovery/` usan la sesión OAuth de Wrangler sin imprimir
credenciales. `prepare-preview.py` conserva los medios fuente locales y
excluye del artefacto los archivos públicos que no están versionados.

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
