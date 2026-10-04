// Phone helpers and SMS delivery for one-time codes. Pure helpers (no
// server-only imports) so scripts can reuse them.

/** Normalises to E.164 (+91XXXXXXXXXX). A bare 10-digit number is assumed Indian. */
export function normalizePhone(raw: string): string | null {
  const cleaned = raw.trim().replace(/[\s\-().]/g, "");
  if (/^\d{10}$/.test(cleaned)) return `+91${cleaned}`;
  if (/^0\d{10}$/.test(cleaned)) return `+91${cleaned.slice(1)}`;
  if (/^91\d{10}$/.test(cleaned)) return `+${cleaned}`;
  if (/^\+\d{10,15}$/.test(cleaned)) return cleaned;
  return null;
}

export function maskPhone(e164: string): string {
  return `${e164.slice(0, 3)} ${"•".repeat(Math.max(0, e164.length - 7))}${e164.slice(-4)}`;
}

/**
 * Sends one SMS. SMS_PROVIDER selects the sender:
 *  - "twilio"  : needs TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and either
 *                TWILIO_MESSAGING_SERVICE_SID or TWILIO_FROM.
 *  - "console" : prints the message to the server log. Development only --
 *                refused in production so codes never end up in logs there.
 * Throws on any failure; callers decide what to show the user.
 */
export async function sendSms(to: string, body: string): Promise<void> {
  const provider = (process.env.SMS_PROVIDER ?? "console").toLowerCase();

  if (provider === "console") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMS_PROVIDER is not configured for production.");
    }
    console.log(`[SMS:console] to ${to}: ${body}`);
    return;
  }

  if (provider === "twilio") {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const service = process.env.TWILIO_MESSAGING_SERVICE_SID;
    const from = process.env.TWILIO_FROM;
    if (!sid || !token || (!service && !from)) {
      throw new Error("Twilio is selected but its credentials are incomplete.");
    }

    const params = new URLSearchParams({ To: to, Body: body });
    if (service) params.set("MessagingServiceSid", service);
    else params.set("From", from!);

    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });
    if (!res.ok) throw new Error(`SMS provider rejected the message (HTTP ${res.status}).`);
    return;
  }

  throw new Error(`Unknown SMS_PROVIDER "${provider}".`);
}
