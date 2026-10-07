import nodemailer from "nodemailer";

function createTransport() {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;

  if (!host || !Number.isInteger(port) || port < 1 || port > 65535 || !user || !pass) {
    throw new Error("Email delivery is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
}

export async function sendEmail({ to, subject, text, html, replyTo }) {
  const recipient = to?.trim();
  if (!recipient) throw new Error("Email recipient is not configured.");

  const from = process.env.SMTP_FROM?.trim() || process.env.SMTP_USER?.trim();
  if (!from) {
    throw new Error("Email sender is not configured. Set SMTP_FROM or SMTP_USER.");
  }

  const transporter = createTransport();
  await transporter.sendMail({ from, to: recipient, subject, text, html, replyTo });
}

export function buildFrontendUrl(pathname) {
  const baseUrl = process.env.FRONTEND_URL?.trim() || "https://hunar.courses";
  let url;
  try {
    url = new URL(pathname, baseUrl);
  } catch {
    throw new Error("FRONTEND_URL must be a valid absolute HTTP or HTTPS URL.");
  }
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("FRONTEND_URL must use HTTP or HTTPS.");
  }
  return url.toString();
}
