import assert from "node:assert/strict";
import { test } from "node:test";
import { buildFrontendUrl, sendEmail } from "./services/emailService.js";

test("activation links use the configured public frontend URL", () => {
  const originalFrontendUrl = process.env.FRONTEND_URL;
  process.env.FRONTEND_URL = "https://hunar.courses/";

  try {
    assert.equal(
      buildFrontendUrl("/activate/secure-token"),
      "https://hunar.courses/activate/secure-token"
    );
  } finally {
    if (originalFrontendUrl === undefined) delete process.env.FRONTEND_URL;
    else process.env.FRONTEND_URL = originalFrontendUrl;
  }
});

test("email delivery fails explicitly when SMTP credentials are missing", async () => {
  const original = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM
  };
  process.env.SMTP_HOST = "smtp.gmail.com";
  process.env.SMTP_PORT = "587";
  process.env.SMTP_USER = "test@example.com";
  delete process.env.SMTP_PASS;
  process.env.SMTP_FROM = "test@example.com";

  try {
    await assert.rejects(
      sendEmail({ to: "test@example.com", subject: "Test", text: "Test" }),
      /Email delivery is not configured/
    );
  } finally {
    if (original.host === undefined) delete process.env.SMTP_HOST;
    else process.env.SMTP_HOST = original.host;
    if (original.port === undefined) delete process.env.SMTP_PORT;
    else process.env.SMTP_PORT = original.port;
    if (original.user === undefined) delete process.env.SMTP_USER;
    else process.env.SMTP_USER = original.user;
    if (original.pass === undefined) delete process.env.SMTP_PASS;
    else process.env.SMTP_PASS = original.pass;
    if (original.from === undefined) delete process.env.SMTP_FROM;
    else process.env.SMTP_FROM = original.from;
  }
});
