// Envía un correo de aviso cuando llega una nueva solicitud de contacto.
// La invoca el trigger aviso_nueva_solicitud con el id de la fila.
//
// Seguridad: solo recibe un id. Los datos se leen de la base con la clave de
// servicio y cada solicitud se marca (notificado_en) de forma atómica, así que
// llamar a la función manualmente no permite enviar correos falsos ni repetidos.
//
// Secretos (Supabase → Edge Functions → Secrets):
//   RESEND_API_KEY  clave de https://resend.com (obligatoria)
//   AVISO_EMAIL     destinatario (opcional, por defecto el correo de la web)
//   AVISO_REMITENTE remitente (opcional; sin dominio propio usar onboarding@resend.dev)
import { createClient } from "npm:@supabase/supabase-js@2";

const DESTINO = Deno.env.get("AVISO_EMAIL") ?? "jlmartinezg2204@gmail.com";
const REMITENTE = Deno.env.get("AVISO_REMITENTE") ?? "Marvicatta9.net <onboarding@resend.dev>";

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!
  );

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method !== "POST") return json(405, { error: "Método no permitido" });

  let id: number;
  try {
    id = Number((await req.json()).id);
  } catch {
    return json(400, { error: "JSON inválido" });
  }
  if (!Number.isInteger(id) || id <= 0) return json(400, { error: "id inválido" });

  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) return json(500, { error: "Falta configurar RESEND_API_KEY" });

  const db = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Reclamar la solicitud: solo una llamada puede marcarla como notificada.
  const { data: s, error } = await db
    .from("solicitudes_contacto")
    .update({ notificado_en: new Date().toISOString() })
    .eq("id", id)
    .is("notificado_en", null)
    .select("id, creado_en, nombre, empresa, correo, telefono, tipo_proyecto, mensaje")
    .maybeSingle();

  if (error) return json(500, { error: error.message });
  if (!s) return json(200, { ok: true, omitido: "ya notificada o inexistente" });

  const fecha = new Date(s.creado_en).toLocaleString("es-PE", { timeZone: "America/Lima" });
  const fila = (k: string, v: unknown) =>
    v ? `<tr><td style="padding:6px 12px 6px 0;color:#5a6674">${k}</td><td style="padding:6px 0"><b>${esc(v)}</b></td></tr>` : "";

  const html = `
    <div style="font-family:Arial,sans-serif;color:#1e2833;max-width:560px">
      <h2 style="margin:0 0 4px">Nueva solicitud desde la web</h2>
      <p style="margin:0 0 18px;color:#5a6674">${esc(fecha)}</p>
      <table style="border-collapse:collapse;font-size:14px">
        ${fila("Nombre", s.nombre)}${fila("Empresa", s.empresa)}${fila("Correo", s.correo)}
        ${fila("Teléfono", s.telefono)}${fila("Proyecto", s.tipo_proyecto)}
      </table>
      <p style="margin:18px 0 6px;color:#5a6674">Mensaje:</p>
      <div style="padding:14px;border-left:3px solid #ff8a00;background:#fff4e8;white-space:pre-wrap">${esc(s.mensaje)}</div>
      <p style="margin-top:22px;font-size:12px;color:#8792a0">Responda a este correo para escribirle directamente al cliente.</p>
    </div>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: REMITENTE,
      to: [DESTINO],
      reply_to: s.correo,
      subject: `Nueva solicitud: ${s.tipo_proyecto} — ${s.nombre}`,
      html,
    }),
  });

  if (!res.ok) {
    // Liberar la solicitud para poder reintentar el aviso más tarde.
    await db.from("solicitudes_contacto").update({ notificado_en: null }).eq("id", id);
    return json(502, { error: "Resend rechazó el envío", detalle: await res.text() });
  }

  return json(200, { ok: true });
});
