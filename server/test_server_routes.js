import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { test } from "node:test";

const vercelConfig = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));
assert.match(vercelConfig.rewrites[0].source, /\(\?!api\\?\//);
await Promise.all([
  access(new URL("../api/auth/login.js", import.meta.url)),
  access(new URL("../api/auth/forgot-password.js", import.meta.url))
]);

process.env.JWT_SECRET ||= "integration-test-secret";
process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/hunar-test";
const { default: app } = await import("./server.js");

test("Express serves the API and client-side portal routes", async (t) => {
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));

  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  const healthResponse = await fetch(`${baseUrl}/api/health`);
  assert.equal(healthResponse.status, 503);
  assert.equal(healthResponse.headers.get("x-content-type-options"), "nosniff");
  const health = await healthResponse.json();
  assert.equal(health.status, "unavailable");
  assert.equal(health.database, "disconnected");

  const privateLeadsResponse = await fetch(`${baseUrl}/api/leads`);
  assert.equal(privateLeadsResponse.status, 401);

  const invalidResetResponse = await fetch(`${baseUrl}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: "" })
  });
  assert.equal(invalidResetResponse.status, 400);
  assert.match(invalidResetResponse.headers.get("content-type"), /application\/json/);

  for (const endpoint of ["/api/batches", "/api/timetable", "/api/announcements"]) {
    const response = await fetch(`${baseUrl}${endpoint}`);
    assert.equal(response.status, 401, `${endpoint} should require an authorized account`);
  }

  const portalResponse = await fetch(`${baseUrl}/portal/admin`, {
    headers: { Accept: "text/html" }
  });
  assert.equal(portalResponse.status, 200);
  const portalHtml = await portalResponse.text();
  assert.match(portalHtml, /id="root"/);
  assert.match(portalHtml, /name="robots" content="noindex, nofollow"/);

  const courseResponse = await fetch(`${baseUrl}/course/diploma-in-digital-marketing`, {
    headers: { Accept: "text/html" }
  });
  assert.equal(courseResponse.status, 200);
  const courseHtml = await courseResponse.text();
  assert.match(courseHtml, /<title>Diploma in Digital Marketing Course in Ludhiana \| Hunar<\/title>/);
  assert.match(courseHtml, /rel="canonical" href="https:\/\/hunar\.courses\/course\/diploma-in-digital-marketing"/);
  assert.match(courseHtml, /"@type":"Course"/);

  for (const asset of ["/robots.txt", "/sitemap.xml", "/llms.txt"]) {
    const response = await fetch(`${baseUrl}${asset}`);
    assert.equal(response.status, 200, `${asset} should be served from the production build`);
  }

  const missingApiResponse = await fetch(`${baseUrl}/api/not-a-route`);
  assert.equal(missingApiResponse.status, 404);
  assert.equal((await missingApiResponse.json()).success, false);

  for (let attempt = 0; attempt < 11; attempt += 1) {
    const inquiryResponse = await fetch(`${baseUrl}/api/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "", phone: "" })
    });
    if (attempt === 10) assert.equal(inquiryResponse.status, 429);
    else assert.equal(inquiryResponse.status, 400);
  }

  for (let attempt = 0; attempt < 11; attempt += 1) {
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loginId: "x".repeat(255), password: "WrongPassword123" })
    });
    if (attempt === 10) assert.equal(loginResponse.status, 429);
    else {
      assert.equal(loginResponse.status, 400);
      if (attempt === 0) {
        assert.match(loginResponse.headers.get("content-type"), /application\/json/);
        assert.equal((await loginResponse.json()).error, "MISSING_CREDENTIALS");
      }
    }
  }
});
