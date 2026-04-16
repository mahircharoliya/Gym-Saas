import nodemailer from "nodemailer";

// ─── Email ────────────────────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT ?? "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendEmail(to: string, subject: string, html: string) {
    if (!process.env.SMTP_USER) {
        console.log(`[EMAIL SKIPPED] To: ${to} | Subject: ${subject}`);
        return;
    }
    await transporter.sendMail({
        from: `"${process.env.NEXT_PUBLIC_APP_NAME ?? "GymSaaS"}" <${process.env.SMTP_USER}>`,
        to, subject, html,
    });
}

// ─── SMS (Twilio) ─────────────────────────────────────────────────────────────

export async function sendSMS(to: string, body: string) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !from) {
        console.log(`[SMS SKIPPED] To: ${to} | Body: ${body}`);
        return;
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const params = new URLSearchParams({ To: to, From: from, Body: body });

    await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
    });
}

// ─── Class reminder helpers ───────────────────────────────────────────────────

export function classReminderEmail(opts: {
    firstName: string;
    className: string;
    startAt: Date;
    location?: string;
    gymName: string;
}): { subject: string; html: string } {
    const time = opts.startAt.toLocaleString("en-US", {
        weekday: "long", month: "long", day: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
    return {
        subject: `Reminder: ${opts.className} is tomorrow`,
        html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#6366f1">${opts.gymName}</h2>
        <p>Hi ${opts.firstName},</p>
        <p>This is a reminder that <strong>${opts.className}</strong> is coming up:</p>
        <p style="background:#f3f4f6;padding:12px;border-radius:8px">
          📅 ${time}<br/>
          ${opts.location ? `📍 ${opts.location}` : ""}
        </p>
        <p>See you there!</p>
      </div>
    `,
    };
}

export function classReminderSMS(opts: {
    className: string;
    startAt: Date;
    gymName: string;
}): string {
    const time = opts.startAt.toLocaleString("en-US", {
        weekday: "short", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
    return `${opts.gymName}: Reminder - ${opts.className} is on ${time}. See you there!`;
}
