import { test } from "node:test";
import assert from "node:assert/strict";
import { compareStatus, computeStatus, worstStatus } from "./status";

test("item jatuh tempo tepat saat jam terpakai sama dengan interval", () => {
  const s = computeStatus(100, 1100, 1200, 10);
  assert.equal(s.status, "due");
  assert.equal(s.used, 100);
  assert.equal(s.remaining, 0);
  assert.equal(s.dueAt, 1200);
});

test("item terlambat menghasilkan sisa negatif", () => {
  const s = computeStatus(100, 1100, 1215.5, 10);
  assert.equal(s.status, "due");
  assert.equal(s.remaining, -15.5);
});

test("item segera bila sisa <= ambang persen", () => {
  assert.equal(computeStatus(250, 960, 1200, 10).status, "soon"); // sisa 10
  assert.equal(computeStatus(250, 960, 1185, 10).status, "soon"); // sisa 25 = 10%
  assert.equal(computeStatus(250, 960, 1184, 10).status, "ok"); // sisa 26
});

test("jam mesin lebih kecil dari jam terakhir dikerjakan dianggap 0 terpakai", () => {
  const s = computeStatus(100, 500, 400, 10);
  assert.equal(s.used, 0);
  assert.equal(s.status, "ok");
});

test("pembulatan desimal tidak membuat status salah", () => {
  const s = computeStatus(0.3, 0.1, 0.4, 0);
  assert.equal(s.remaining, 0);
  assert.equal(s.status, "due");
});

test("worstStatus memilih status paling mendesak", () => {
  assert.equal(worstStatus([]), null);
  assert.equal(worstStatus(["ok", "soon"]), "soon");
  assert.equal(worstStatus(["ok", "due", "soon"]), "due");
});

test("compareStatus mengurutkan yang paling mendesak lebih dulu", () => {
  const list = [computeStatus(100, 0, 50, 10), computeStatus(100, 0, 120, 10), computeStatus(100, 0, 95, 10)];
  const sorted = [...list].sort(compareStatus).map((s) => s.status);
  assert.deepEqual(sorted, ["due", "soon", "ok"]);
});
