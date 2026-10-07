import assert from "node:assert/strict";
import { test } from "node:test";

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

  const portalResponse = await fetch(`${baseUrl}/portal/admin`, {
    headers: { Accept: "text/html" }
  });
  assert.equal(portalResponse.status, 200);
  assert.match(await portalResponse.text(), /id="root"/);

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
    else assert.equal(loginResponse.status, 400);
  }
});
