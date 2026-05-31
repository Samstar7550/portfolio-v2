// Branded, professional HTML email templates (Resend).
// Table-based + inline styles for broad email-client compatibility
// (Gmail, Outlook, Apple Mail). A dark branded header + light readable body.

const SITE = "https://www.samuvel.in";

// Escape user-supplied content before interpolating into HTML
function esc(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// Shared shell — header bar, white card, footer
function shell(inner: string, preheader = ""): string {
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="color-scheme" content="light"/>
</head>
<body style="margin:0;padding:0;background:#0B0E14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0B0E14;padding:32px 16px;">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,.35);">
      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#0F64D2 0%,#00C8D7 100%);padding:28px 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="vertical-align:middle;">
            <span style="display:inline-block;width:40px;height:40px;line-height:40px;text-align:center;background:rgba(255,255,255,.18);border-radius:10px;color:#ffffff;font-weight:800;font-size:16px;letter-spacing:-0.5px;">SL</span>
          </td>
          <td style="vertical-align:middle;padding-left:14px;">
            <div style="color:#ffffff;font-size:17px;font-weight:700;line-height:1.2;">Samuvel L</div>
            <div style="color:rgba(255,255,255,.85);font-size:12px;line-height:1.3;">DevOps Engineer · samuvel.in</div>
          </td>
        </tr></table>
      </td></tr>
      <!-- Body -->
      <tr><td style="padding:32px;">${inner}</td></tr>
      <!-- Footer -->
      <tr><td style="padding:20px 32px 28px;border-top:1px solid #EEF1F5;">
        <div style="color:#9AA4B2;font-size:12px;line-height:1.6;">
          Sent from <a href="${SITE}" style="color:#0F64D2;text-decoration:none;">www.samuvel.in</a> ·
          DevOps &amp; Cloud Engineer<br/>
          You're receiving this because you used the contact form on my portfolio.
        </div>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

// 1) Owner notification — "New message from {name}"
export function contactNotificationEmail(p: { name: string; email: string; message: string }) {
  const name = esc(p.name.trim());
  const email = esc(p.email.trim());
  const message = esc(p.message.trim()).replace(/\n/g, "<br/>");

  const html = shell(`
    <div style="display:inline-block;background:#E8FBFD;color:#0891A0;font-size:12px;font-weight:600;padding:5px 12px;border-radius:100px;margin-bottom:16px;">📬 New Contact Message</div>
    <h1 style="margin:0 0 6px;color:#0B0E14;font-size:22px;font-weight:800;letter-spacing:-0.5px;">New message from ${name}</h1>
    <p style="margin:0 0 24px;color:#6B7480;font-size:14px;line-height:1.5;">Someone reached out through your portfolio contact form.</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F9FC;border:1px solid #EEF1F5;border-radius:12px;margin-bottom:24px;">
      <tr><td style="padding:16px 20px;">
        <div style="color:#9AA4B2;font-size:11px;text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px;">Name</div>
        <div style="color:#0B0E14;font-size:15px;font-weight:600;">${name}</div>
      </td></tr>
      <tr><td style="padding:0 20px 16px;">
        <div style="color:#9AA4B2;font-size:11px;text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px;">Email</div>
        <a href="mailto:${email}" style="color:#0F64D2;font-size:15px;font-weight:600;text-decoration:none;">${email}</a>
      </td></tr>
    </table>

    <div style="color:#9AA4B2;font-size:11px;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px;">Message</div>
    <div style="background:#ffffff;border-left:3px solid #00C8D7;padding:14px 18px;color:#2D3540;font-size:15px;line-height:1.65;border-radius:0 8px 8px 0;background:#F7F9FC;">${message}</div>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:26px;"><tr><td>
      <a href="mailto:${email}" style="display:inline-block;background:linear-gradient(135deg,#0F64D2,#00C8D7);color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:10px;">Reply to ${name} →</a>
    </td></tr></table>
  `, `New message from ${p.name}`);

  const text = `New message from ${p.name}\n\nName: ${p.name}\nEmail: ${p.email}\n\n${p.message}`;
  return { html, text };
}

// 2) Visitor auto-reply — "Thanks for reaching out"
export function contactAutoReplyEmail(p: { name: string; message: string }) {
  const name = esc(p.name.trim());
  const message = esc(p.message.trim().slice(0, 500)).replace(/\n/g, "<br/>");

  const html = shell(`
    <div style="display:inline-block;background:#E8FBFD;color:#0891A0;font-size:12px;font-weight:600;padding:5px 12px;border-radius:100px;margin-bottom:16px;">✅ Message Received</div>
    <h1 style="margin:0 0 14px;color:#0B0E14;font-size:22px;font-weight:800;letter-spacing:-0.5px;">Thanks for reaching out, ${name}! 👋</h1>
    <p style="margin:0 0 18px;color:#2D3540;font-size:15px;line-height:1.65;">
      I've received your message and will get back to you as soon as I can — usually within a day or two.
    </p>
    <p style="margin:0 0 8px;color:#9AA4B2;font-size:11px;text-transform:uppercase;letter-spacing:.5px;">For your reference, here's what you sent</p>
    <div style="background:#F7F9FC;border-left:3px solid #00C8D7;padding:14px 18px;color:#2D3540;font-size:15px;line-height:1.65;border-radius:0 8px 8px 0;margin-bottom:26px;">${message}</div>

    <p style="margin:0 0 4px;color:#2D3540;font-size:15px;line-height:1.6;">In the meantime, feel free to explore more of my work:</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:14px 0 24px;"><tr>
      <td style="padding-right:10px;"><a href="${SITE}" style="display:inline-block;background:linear-gradient(135deg,#0F64D2,#00C8D7);color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:11px 24px;border-radius:10px;">Visit Portfolio</a></td>
      <td><a href="${SITE}/blog" style="display:inline-block;background:#F0F3F8;color:#0B0E14;font-size:14px;font-weight:600;text-decoration:none;padding:11px 24px;border-radius:10px;">Read the Blog</a></td>
    </tr></table>

    <div style="border-top:1px solid #EEF1F5;padding-top:18px;">
      <div style="color:#0B0E14;font-size:15px;font-weight:700;">Samuvel L</div>
      <div style="color:#6B7480;font-size:13px;">DevOps &amp; Cloud Engineer</div>
    </div>
  `, `Thanks for reaching out — I'll get back to you soon`);

  const text =
    `Hi ${p.name.trim()},\n\n` +
    `Thanks for getting in touch — I've received your message and will get back to you soon.\n\n` +
    `For reference, here's what you sent:\n"${p.message.trim().slice(0, 500)}"\n\n` +
    `— Samuvel L\nDevOps Engineer · ${SITE}`;
  return { html, text };
}
