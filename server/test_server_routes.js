import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import { test } from "node:test";
import mongoose from "mongoose";

const vercelConfig = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));
assert.deepEqual(vercelConfig.rewrites[0], {
  source: "/api/:path*",
  destination: "/api/index?_hunar_path=:path*"
});
assert.deepEqual(vercelConfig.rewrites[1], {
  source: "/activate/:token",
  destination: "/index.html"
});
assert.equal(vercelConfig.rewrites.length, 2, "unknown paths should reach Vercel's custom 404 document");
const apiDirectory = new URL("../api/", import.meta.url);
await access(new URL("../api/index.js", import.meta.url));
const apiFiles = await readdir(apiDirectory, { recursive: true });
assert.deepEqual(apiFiles.filter((file) => file.endsWith(".js")), ["index.js"]);

const { normalizeVercelApiRequestUrl } = await import("./normalizeVercelApiRequest.js");

test("Vercel API rewrite restores nested Express paths and preserves query parameters", () => {
  assert.equal(
    normalizeVercelApiRequestUrl("/api/index?_hunar_path=auth%2Fme&view=full"),
    "/api/auth/me?view=full"
  );
  assert.equal(
    normalizeVercelApiRequestUrl("/api/index?_hunar_path=attendance&batch=Alpha&date=2026-10-07"),
    "/api/attendance?batch=Alpha&date=2026-10-07"
  );
  assert.equal(
    normalizeVercelApiRequestUrl("/api/auth/me?view=full"),
    "/api/auth/me?view=full"
  );
});

test("Vercel API rewrite rejects invalid route paths", () => {
  assert.throws(() => normalizeVercelApiRequestUrl("/not-an-api-route"), /could not be determined/);
  assert.throws(() => normalizeVercelApiRequestUrl("/api/index?_hunar_path=..%2Fadmin"), /invalid/);
  assert.throws(() => normalizeVercelApiRequestUrl("/api/index?_hunar_path=auth%2Fme%3Fadmin%3Dtrue"), /invalid/);
});

process.env.JWT_SECRET ||= "integration-test-secret";
process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/hunar-test";
const { default: app } = await import("./server.js");
const { Batch, Course, Student } = await import("./models/index.js");
const { createBatch, createCourse, createStudent, updateCourse } = await import("./services/dataService.js");

test("course creation delegates MongoDB _id generation to Mongoose", async () => {
  const originalReadyState = mongoose.connection.readyState;
  const originalMongoUri = process.env.MONGODB_URI;
  const originalCreate = Course.create;
  let insertedCourse;

  process.env.MONGODB_URI = "mongodb://course-test/hunar";
  mongoose.connection.readyState = 1;
  Course.create = async (record) => {
    insertedCourse = record;
    return {
      toObject: () => ({ ...record, _id: new mongoose.Types.ObjectId() })
    };
  };

  try {
    const course = await createCourse({
      _id: "course-invalid-id",
      title: "Course Creation Regression Test",
      category: "Testing",
      description: "Verifies that Mongoose supplies a valid ObjectId."
    });

    assert.equal(Object.hasOwn(insertedCourse, "_id"), false);
    assert.ok(course._id instanceof mongoose.Types.ObjectId);
  } finally {
    Course.create = originalCreate;
    mongoose.connection.readyState = originalReadyState;
    process.env.MONGODB_URI = originalMongoUri;
  }
});

test("batch creation delegates MongoDB _id generation to Mongoose", async () => {
  const originalReadyState = mongoose.connection.readyState;
  const originalMongoUri = process.env.MONGODB_URI;
  const originalFindOneAndUpdate = Batch.findOneAndUpdate;
  const batchId = new mongoose.Types.ObjectId();
  let insertedBatch;

  process.env.MONGODB_URI = "mongodb://batch-test/hunar";
  mongoose.connection.readyState = 1;
  Batch.findOneAndUpdate = async (_query, update) => {
    insertedBatch = update.$set;
    return { toObject: () => ({ ...update.$set, _id: batchId }) };
  };

  try {
    const batch = await createBatch({
      name: "Batch Creation Regression Test",
      course: "Test Course",
      timing: "10:00 AM - 1:00 PM"
    });

    assert.equal(Object.hasOwn(insertedBatch, "_id"), false);
    assert.ok(batch._id instanceof mongoose.Types.ObjectId);
  } finally {
    Batch.findOneAndUpdate = originalFindOneAndUpdate;
    mongoose.connection.readyState = originalReadyState;
    process.env.MONGODB_URI = originalMongoUri;
  }
});

test("course edits upsert all public catalog details by slug", async () => {
  const originalReadyState = mongoose.connection.readyState;
  const originalMongoUri = process.env.MONGODB_URI;
  const originalFindOneAndUpdate = Course.findOneAndUpdate;
  const courseId = new mongoose.Types.ObjectId();
  let query;
  let update;

  process.env.MONGODB_URI = "mongodb://course-update-test/hunar";
  mongoose.connection.readyState = 1;
  Course.findOneAndUpdate = (nextQuery, nextUpdate) => {
    query = nextQuery;
    update = nextUpdate;
    return { lean: async () => ({ ...nextUpdate.$set, _id: courseId }) };
  };

  try {
    const details = {
      shortDesc: "Complete course overview",
      highlights: ["Practical labs"],
      curriculum: [{ module: "Module 1", title: "Foundations", topics: ["Core skills"] }],
      projects: [{ title: "Final project", desc: "Build a complete solution." }],
      mentor: { name: "Test Instructor" }
    };
    const course = await updateCourse("diploma-in-digital-marketing", details);

    assert.deepEqual(query, { slug: "diploma-in-digital-marketing" });
    assert.deepEqual(update.$set, details);
    assert.equal(course._id, courseId);
  } finally {
    Course.findOneAndUpdate = originalFindOneAndUpdate;
    mongoose.connection.readyState = originalReadyState;
    process.env.MONGODB_URI = originalMongoUri;
  }
});

test("student registration persists its linked MongoDB user reference", async () => {
  const originalReadyState = mongoose.connection.readyState;
  const originalMongoUri = process.env.MONGODB_URI;
  const originalFindOneAndUpdate = Student.findOneAndUpdate;
  const userId = new mongoose.Types.ObjectId();
  let insertedStudent;

  process.env.MONGODB_URI = "mongodb://student-test/hunar";
  mongoose.connection.readyState = 1;
  Student.findOneAndUpdate = async (_query, update) => {
    insertedStudent = update.$set;
    return { toObject: () => ({ ...update.$set }) };
  };

  try {
    await createStudent({
      studentId: "HUN-S-TEST-0001",
      user: userId,
      name: "Registration Regression Test",
      email: "student@example.test",
      phone: "+910000000000",
      course: "Test Course"
    });

    assert.equal(String(insertedStudent.user), String(userId));
    assert.equal(Object.hasOwn(insertedStudent, "userId"), false);
  } finally {
    Student.findOneAndUpdate = originalFindOneAndUpdate;
    mongoose.connection.readyState = originalReadyState;
    process.env.MONGODB_URI = originalMongoUri;
  }
});

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

  for (const endpoint of ["/api/auth/me", "/api/admin/overview", "/api/admin/users"]) {
    const response = await fetch(`${baseUrl}${endpoint}`);
    assert.equal(response.status, 401, `${endpoint} should reach Express and require authentication`);
    assert.match(response.headers.get("content-type"), /application\/json/);
  }

  const rewrittenNestedPath = normalizeVercelApiRequestUrl("/api/index?_hunar_path=auth%2Fme");
  const rewrittenNestedResponse = await fetch(`${baseUrl}${rewrittenNestedPath}`);
  assert.equal(rewrittenNestedResponse.status, 401);
  assert.match(rewrittenNestedResponse.headers.get("content-type"), /application\/json/);

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

  const notFoundResponse = await fetch(`${baseUrl}/not-a-real-page`, {
    headers: { Accept: "text/html" }
  });
  assert.equal(notFoundResponse.status, 404);
  const notFoundHtml = await notFoundResponse.text();
  assert.match(notFoundHtml, /This page could not be found/);
  assert.match(notFoundHtml, /href="\/courses"/);
  assert.doesNotMatch(notFoundHtml, /rel="canonical"/);

  const activationResponse = await fetch(`${baseUrl}/activate/test-token`, {
    headers: { Accept: "text/html" }
  });
  assert.equal(activationResponse.status, 200);
  assert.match(await activationResponse.text(), /id="root"/);

  const courseResponse = await fetch(`${baseUrl}/course/diploma-in-digital-marketing`, {
    headers: { Accept: "text/html" }
  });
  assert.equal(courseResponse.status, 200);
  const courseHtml = await courseResponse.text();
  assert.match(courseHtml, /<title>Diploma in Digital Marketing Course in Ludhiana \| Hunar<\/title>/);
  assert.match(courseHtml, /rel="canonical" href="https:\/\/www\.hunar\.courses\/course\/diploma-in-digital-marketing"/);
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

test("Vercel handler reports a safe database configuration diagnostic", async () => {
  const { default: vercelHandler } = await import("./vercelHandler.js");
  const originalMongoUri = process.env.MONGODB_URI;
  process.env.MONGODB_URI = "";
  const response = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };

  try {
    await vercelHandler({ method: "GET", url: "/api/health" }, response);
    assert.equal(response.statusCode, 503);
    assert.equal(response.body.error, "DATABASE_CONFIGURATION_MISSING");
    assert.doesNotMatch(JSON.stringify(response.body), /mongodb(\+srv)?:\/\//i);
  } finally {
    process.env.MONGODB_URI = originalMongoUri;
  }
});
