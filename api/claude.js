// Función serverless de Vercel: reenvía la consulta a la API de Claude.
// Variables de entorno: ANTHROPIC_API_KEY (obligatoria), APP_PASSWORD (recomendada), CLAUDE_MODEL (opcional).
export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({ ok: !!process.env.ANTHROPIC_API_KEY, needsPass: !!process.env.APP_PASSWORD });
  }
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
  // Desbloqueo de la sección privada (Mesa): solo valida la clave, no consulta a Claude.
  if (req.body && req.body.unlock) {
    if (!process.env.APP_PASSWORD) return res.status(503).json({ error: "Falta configurar APP_PASSWORD en Vercel" });
    if (req.body.pass !== process.env.APP_PASSWORD) return res.status(401).json({ error: "Clave incorrecta" });
    return res.status(200).json({ ok: true });
  }
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: "Falta ANTHROPIC_API_KEY en Vercel" });

  const { messages = [], images = [], pass = "" } = req.body || {};
  if (process.env.APP_PASSWORD && pass !== process.env.APP_PASSWORD) {
    return res.status(401).json({ error: "Clave incorrecta" });
  }
  if (!Array.isArray(messages) || !messages.length) return res.status(400).json({ error: "Sin mensajes" });

  const msgs = messages
    .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-12)
    .map(m => ({ role: m.role, content: m.content.slice(0, 120000) }));
  if (!msgs.length || msgs[msgs.length - 1].role !== "user") return res.status(400).json({ error: "El último mensaje debe ser del usuario" });

  const imgs = (Array.isArray(images) ? images : []).slice(0, 3)
    .filter(i => i && /^image\/(jpeg|png|webp|gif)$/.test(i.media_type) && typeof i.data === "string");
  if (imgs.length) {
    const last = msgs[msgs.length - 1];
    last.content = [
      ...imgs.map(i => ({ type: "image", source: { type: "base64", media_type: i.media_type, data: i.data } })),
      { type: "text", text: last.content }
    ];
  }

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({ model: process.env.CLAUDE_MODEL || "claude-sonnet-5-5", max_tokens: 1500, messages: msgs })
    });
    const j = await r.json();
    if (!r.ok) return res.status(r.status === 429 ? 429 : 502).json({ error: j?.error?.message || "Error de la API" });
    const text = (j.content || []).filter(b => b.type === "text").map(b => b.text).join("\n").trim();
    return res.status(200).json({ text: text || "(sin respuesta)", truncated: j.stop_reason === "max_tokens" });
  } catch (e) {
    return res.status(502).json({ error: "No se pudo contactar la API" });
  }
}
