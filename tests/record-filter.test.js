const test = require("node:test");
const assert = require("node:assert/strict");
const { filterRecords } = require("../js/domain/record-filter.js");

const records = [
  { id: "1", studentName: "张三", date: "2026-09-22", course: "高等数学", content: "极限练习", createdAt: "2026-09-22T08:00:00+08:00" },
  { id: "2", studentName: "李四", date: "2026-09-22", course: "大学英语", content: "阅读训练", createdAt: "2026-09-22T09:00:00+08:00" },
  { id: "3", studentName: "张三", date: "2026-09-21", course: "高等数学", content: "函数复盘", createdAt: "2026-09-21T10:00:00+08:00" }
];

test("姓名、课程、日期和关键词可以组合筛选", () => {
  const result = filterRecords(records, {
    studentName: " 张 ",
    course: "高等数学",
    date: "2026-09-22",
    keyword: "极限"
  });

  assert.deepEqual(result.map(record => record.id), ["1"]);
  assert.equal(filterRecords(records, { keyword: "不存在" }).length, 0);
});

test("筛选不修改输入，并以学习日期和真实创建时间倒序返回", () => {
  const result = filterRecords(records, {});

  assert.deepEqual(result.map(record => record.id), ["2", "1", "3"]);
  assert.deepEqual(records.map(record => record.id), ["1", "2", "3"]);
});
