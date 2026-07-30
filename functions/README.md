# Endpoints del sitio (Cloudflare Pages Functions)

Todo lo que hay en `functions/` se publica solo con cada despliegue: no hay que
crear ni desplegar nada aparte. `functions/api/otp/enviar.js` queda en
`/api/otp/enviar`, y así con el resto.

## Verificación del correo por código

Impide que alguien entre al catálogo con un correo empresarial inventado. Son
dos pasos: se pide el código, llega por correo, se comprueba.

| Endpoint | Qué hace |
|---|---|
| `POST /api/otp/enviar` | Valida que el correo sea empresarial, genera 6 dígitos, los manda con Resend y devuelve un *token* firmado |
| `POST /api/otp/verificar` | Comprueba el código contra el token y, solo si cuadra, avisa a Telegram |

No hay base de datos. El código nunca se guarda: el token lleva una firma HMAC
calculada sobre `datos + código`, y para verificar se recalcula. Está explicado
en `shared/otp.js`, incluido **lo que no cubre**.

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

## El remitente

Se envía desde `no-reply@updates.grupoespaciocreativo.com`, que es el subdominio
ya verificado en Resend (tiene su DKIM en el DNS). **Si algún día se cambia el
subdominio de envío en Resend, hay que cambiar `REMITENTE` en `enviar.js`** o
los correos dejarán de salir.

## Recomendado: limitar los intentos

El código son 6 dígitos y caduca a los 10 minutos, pero al no haber almacén el
servidor no puede contar intentos. Para cerrar esa puerta, en **Cloudflare →
Security → WAF → Rate limiting rules**:

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
