const test = require("node:test");
const assert = require("node:assert/strict");
const { createDemoRecords } = require("../js/data/demo-records.js");

test("完整演示数据满足人数、日期、课程和记录规模", () => {
  const records = createDemoRecords("2026-09-22");
  assert.equal(new Set(records.map(x => x.studentName)).size, 30);
  assert.equal(new Set(records.map(x => x.date)).size, 7);
  assert.equal(new Set(records.map(x => x.course)).size, 5);
  assert.ok(records.length >= 150);
  assert.equal(new Set(records.map(x => x.id)).size, records.length);
});

test("相同锚点生成确定性演示数据", () => {
  assert.deepEqual(createDemoRecords("2026-09-22"), createDemoRecords("2026-09-22"));
});
