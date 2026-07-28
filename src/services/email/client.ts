import { Resend } from "resend";

let resendClient: Resend | null = null;

export function getResendClient(): Resend | null {
  if (resendClient) return resendClient;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;

  resendClient = new Resend(apiKey);
  return resendClient;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const client = getResendClient();
  if (!client) {
    return { success: false, error: "Resend API not configured" };
  }

  const from = process.env.EMAIL_FROM || "Home Control Center <noreply@homeserver.local>";

  try {
    const result = await client.emails.send({
      from,
      to,
      subject,
      html,
      text,
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    return { success: true, id: result.data?.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function sendAlertEmail({
  to,
  serviceName,
  status,
  severity,
  message,
  detectedAt,
}: {
  to: string;
  serviceName: string;
  status: string;
  severity: string;
  message: string;
  detectedAt: Date;
}) {
  const severityEmoji = severity === "CRITICAL" ? "🚨" : severity === "WARNING" ? "⚠️" : "ℹ️";
  const subject = `${severityEmoji} Home Server Alert: ${serviceName} ${status}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0f1a; color: #e2e8f0; padding: 32px;">
      <div style="max-width: 560px; margin: 0 auto; background: #111827; border-radius: 12px; border: 1px solid #1e293b; overflow: hidden;">
        <div style="padding: 24px 24px 16px; border-bottom: 1px solid #1e293b;">
          <h1 style="margin: 0; font-size: 18px; color: #e2e8f0;">${severityEmoji} ${serviceName}</h1>
          <p style="margin: 4px 0 0; font-size: 14px; color: #94a3b8;">Status: <strong style="color: ${severity === 'CRITICAL' ? '#f87171' : '#fbbf24'};">${status}</strong></p>
        </div>
        <div style="padding: 24px;">
          <p style="margin: 0 0 16px; font-size: 14px; color: #cbd5e1;">${message}</p>
          <table style="width: 100%; font-size: 13px; color: #94a3b8;">
            <tr><td style="padding: 4px 0;">Severity</td><td style="text-align: right; color: #e2e8f0;">${severity}</td></tr>
            <tr><td style="padding: 4px 0;">Detected</td><td style="text-align: right; color: #e2e8f0;">${detectedAt.toLocaleString()}</td></tr>
          </table>
        </div>
        <div style="padding: 16px 24px; background: #0f172a; border-top: 1px solid #1e293b;">
          <p style="margin: 0; font-size: 12px; color: #64748b;">Sent by Home Control Center</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to, subject, html });
}
