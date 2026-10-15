import { test } from "node:test";
import assert from "node:assert/strict";
import { directUrl, runtimeUrl } from "./dburl";

const pooled = "postgresql://u:p@ep-cool-123-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

test("alamat direct menghapus -pooler", () => {
  assert.equal(directUrl(pooled), "postgresql://u:p@ep-cool-123.ap-southeast-1.aws.neon.tech/neondb?sslmode=require");
});

test("alamat pooled diberi pgbouncer=true", () => {
  assert.match(runtimeUrl(pooled), /pgbouncer=true/);
  assert.match(runtimeUrl(pooled), /sslmode=require/);
});

test("alamat lokal tidak diubah", () => {
  const local = "postgresql://postgres@localhost:5432/maintenance";
  assert.equal(runtimeUrl(local), local);
  assert.equal(directUrl(local), local);
});
