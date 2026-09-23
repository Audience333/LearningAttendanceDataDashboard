const test = require("node:test");
const assert = require("node:assert/strict");
const { createRecordRepository } = require("../js/storage/record-repository.js");
const { createDemoRecords } = require("../js/data/demo-records.js");

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: key => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key)
  };
}

test("新增、修改和删除记录后重新加载结果一致", () => {
  const repo = createRecordRepository(memoryStorage(), { storageKey: "test", storageVersion: 1 });
  repo.seed([]);
  repo.add({ id: "a", studentName: "张三" });
  assert.equal(repo.update("a", { studentName: "李四" }).studentName, "李四");
  assert.equal(repo.list()[0].studentName, "李四");
  assert.equal(repo.remove("a"), true);
  assert.equal(repo.list().length, 0);
  assert.equal(repo.remove("missing"), false);
});

test("结构损坏时不覆盖原值并返回可恢复错误", () => {
  const raw = JSON.stringify({ version: 1, records: "wrong" });
  const storage = memoryStorage({ test: raw });
  const repo = createRecordRepository(storage, { storageKey: "test", storageVersion: 1 });
  const state = repo.load();
  assert.equal(state.status, "corrupt");
  assert.deepEqual(state.records, []);
  assert.equal(state.rawBackup, raw);
  assert.equal(storage.getItem("test"), raw);
});

test("写入失败时抛出 StorageWriteError", () => {
  const storage = { getItem: () => null, setItem: () => { throw new Error("quota"); } };
  const repo = createRecordRepository(storage, { storageKey: "test", storageVersion: 1 });
  assert.throws(() => repo.seed([]), { name: "StorageWriteError" });
});

test("演示数据固定、合法且不少于 20 条", () => {
  const first = createDemoRecords("2026-09-22");
  const second = createDemoRecords("2026-09-22");
  assert.deepEqual(first, second);
  assert.ok(first.length >= 20);
  assert.equal(new Set(first.map(record => record.id)).size, first.length);
  assert.ok(first.every(record => record.date <= "2026-09-22" && record.durationHours > 0));
});
