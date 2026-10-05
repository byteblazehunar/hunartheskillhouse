import assert from "node:assert/strict";
import { test } from "node:test";
import { connectDB, isDbConnected } from "./config/db.js";

test("MongoDB rejects unencoded credential delimiters without exposing the URI", async () => {
  const originalUri = process.env.MONGODB_URI;
  const malformedUri = "mongodb://test-user:private@password@127.0.0.1/hunar_test";
  process.env.MONGODB_URI = malformedUri;

  try {
    await assert.rejects(
      connectDB(),
      (error) => {
        assert.match(error.message, /URL-encode reserved characters/);
        assert.equal(error.message.includes(malformedUri), false);
        return true;
      }
    );
    assert.throws(isDbConnected, /refusing to use local JSON fallback data/);
  } finally {
    if (originalUri === undefined) delete process.env.MONGODB_URI;
    else process.env.MONGODB_URI = originalUri;
  }
});

test("MongoDB rejects unresolved connection-string placeholders", async () => {
  const originalUri = process.env.MONGODB_URI;
  process.env.MONGODB_URI = "mongodb+srv://user:<password>@cluster.example.test/hunar";

  try {
    await assert.rejects(
      connectDB(),
      (error) => {
        assert.match(error.message, /placeholder brackets/);
        assert.equal(error.message.includes("<password>"), false);
        return true;
      }
    );
  } finally {
    if (originalUri === undefined) delete process.env.MONGODB_URI;
    else process.env.MONGODB_URI = originalUri;
  }
});
