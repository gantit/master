# Entrevista Zapato Feroz — encuesta en Vercel

Encuesta del máster (mapa de empatía). El que responde solo pulsa **Enviar**.
El servidor te avisa por **email** y, opcionalmente, por **WhatsApp**.

## Estructura

- `public/index.html` — el formulario (página estática)
- `api/submit.js` — función serverless: recibe las respuestas y te notifica

## Variables de entorno

En Vercel: **Project → Settings → Environment Variables**.

| Variable           | Obligatoria | Para qué sirve                                         |
| ------------------ | ----------- | ------------------------------------------------------ |
| `RESEND_API_KEY`   | Sí          | Enviar el email con las respuestas                     |
| `NOTIFY_EMAIL`     | Sí          | Tu email de destino (ej. `joh.calvino@gmail.com`)      |
| `CALLMEBOT_APIKEY` | No          | Aviso por WhatsApp a tu teléfono                       |
| `WHATSAPP_PHONE`   | No          | Tu número con prefijo de país, sin `+` (ej. `34600…`)  |

Si no cargás las dos últimas, todo funciona igual solo por email.

## Pasos

### 1. Email (Resend)

1. Crea una cuenta gratis en https://resend.com con tu email de destino.
2. Ve a **API Keys → Create API Key**, cópiala.
3. Cárgala en Vercel como `RESEND_API_KEY` y pon tu email en `NOTIFY_EMAIL`.

> El remitente es `onboarding@resend.dev`, que ya viene listo y puede
> entregarte a ti sin verificar ningún dominio.

### 2. WhatsApp (CallMeBot, opcional)

1. Sigue la activación de una vez aquí:
   https://www.callmebot.com/blog/free-api-whatsapp-messages/
   (agendas su número, le mandas un WhatsApp y te devuelve tu `apikey`).
2. Carga `CALLMEBOT_APIKEY` y `WHATSAPP_PHONE` en Vercel.

### 3. Desplegar

1. Sube esta carpeta a un repo de GitHub.
2. En https://vercel.com → **Add New → Project** → importa el repo.
3. Sin configuración extra: Vercel sirve `public/` y detecta `api/`.
4. Carga las variables de entorno y haz **Redeploy**.

## Probar en local (opcional)

```bash
npm i -g vercel
vercel dev
```
