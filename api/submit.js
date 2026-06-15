// Serverless function (Vercel) — receives survey answers and notifies the owner.
// No npm dependencies: uses the built-in fetch (Node 18+).
//
// Required env vars:
//   RESEND_API_KEY   -> from https://resend.com (free)
//   NOTIFY_EMAIL     -> where the answers are sent (e.g. joh.calvino@gmail.com)
// Optional env vars (WhatsApp notification via CallMeBot):
//   CALLMEBOT_APIKEY -> from https://www.callmebot.com/blog/free-api-whatsapp-messages/
//   WHATSAPP_PHONE   -> your number with country code, no "+" (e.g. 34600111222)

const LABELS = {
  nombre: "Nombre",
  edad: "Edad",
  perfil: "Perfil",
  d1_ve: "1) Qué VE",
  d2_escucha: "2) Qué ESCUCHA",
  d3_piensa: "3) Qué PIENSA y SIENTE",
  d4_hace: "4) Qué DICE y HACE",
  d5_esfuerzos: "5) ESFUERZOS (frustraciones)",
  d6_resultados: "6) RESULTADOS que espera",
  extra: "Comentario extra",
};

function buildSummary(answers) {
  const lines = ["ENTREVISTA MAPA DE EMPATÍA · ZAPATO FEROZ", ""];
  for (const [key, label] of Object.entries(LABELS)) {
    const value = (answers[key] || "").trim();
    if (value) lines.push(`${label}:\n${value}\n`);
  }
  return lines.join("\n");
}

async function sendEmail(answers, summary) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!apiKey || !to) throw new Error("RESEND_API_KEY or NOTIFY_EMAIL not set");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // onboarding@resend.dev works out of the box and can deliver to the
      // email you signed up with — no domain verification needed.
      from: "Entrevista Zapato Feroz <onboarding@resend.dev>",
      to: [to],
      subject: `Nueva entrevista — ${answers.nombre || "anónimo"}`,
      text: summary,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Resend failed (${res.status}): ${detail}`);
  }
}

async function sendWhatsApp(answers) {
  const apiKey = process.env.CALLMEBOT_APIKEY;
  const phone = process.env.WHATSAPP_PHONE;
  // WhatsApp is optional: skip silently if not configured.
  if (!apiKey || !phone) return;

  const text = `Nueva entrevista Zapato Feroz de ${answers.nombre || "anónimo"}. Revisá tu email para la respuesta completa.`;
  const url =
    `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}` +
    `&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(apiKey)}`;

  try {
    await fetch(url);
  } catch (err) {
    // Don't fail the whole request if the WhatsApp ping fails.
    console.error("CallMeBot notification failed:", err);
  }
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  try {
    const answers =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};

    if (!answers.nombre || !String(answers.nombre).trim()) {
      res.status(400).json({ ok: false, error: "Falta el nombre" });
      return;
    }

    const summary = buildSummary(answers);
    await sendEmail(answers, summary);
    await sendWhatsApp(answers);

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "No se pudo enviar" });
  }
};
