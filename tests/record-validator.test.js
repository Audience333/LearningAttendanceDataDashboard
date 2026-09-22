const test = require("node:test");
const assert = require("node:assert/strict");
const validator = require("../js/domain/record-validator.js");

test("规范化姓名、内容、可选字段和数字时长", () => {
  const value = validator.normalizeRecordInput({
    studentName: " 张三 ",
    date: "2026-09-15",
    course: "程序设计基础",
    durationHours: "1.5",
    content: " 数组练习 ",
    completionStatus: "completed"
  });

  assert.deepEqual(value, {
    studentName: "张三",
    date: "2026-09-15",
    course: "程序设计基础",
    durationHours: 1.5,
    content: "数组练习",
    completionStatus: "completed",
    reflection: "",
    nextPlan: ""
  });
});

test("拒绝空字段、未来日期、过短内容和非法时长", () => {
  const result = validator.validateRecord({
    studentName: "",
    date: "2026-09-23",
    course: "程序设计基础",
    durationHours: 0,
    content: "x",
    completionStatus: "completed"
  }, "2026-09-22");

  assert.equal(result.valid, false);
  assert.deepEqual(Object.keys(result.errors).sort(), ["content", "date", "durationHours", "studentName"]);
});

test("拒绝超过 24 小时和超过一位小数的时长", () => {
  const base = {
    studentName: "张三", date: "2026-09-22", course: "高等数学",
    content: "极限练习", completionStatus: "completed"
  };
  assert.ok(validator.validateRecord({ ...base, durationHours: 24.1 }, "2026-09-22").errors.durationHours);
  assert.ok(validator.validateRecord({ ...base, durationHours: 1.25 }, "2026-09-22").errors.durationHours);
});

test("拒绝未知课程和未知完成状态", () => {
  const result = validator.validateRecord({
    studentName: "张三", date: "2026-09-22", course: "随意填写的课程",
    durationHours: 1, content: "阅读教材", completionStatus: "unknown"
  }, "2026-09-22");
  assert.ok(result.errors.course);
  assert.ok(result.errors.completionStatus);
});

test("只将同姓名同日期同课程判为潜在重复", () => {
  const records = [{ id: "1", studentName: "张三", date: "2026-09-15", course: "高等数学" }];
  assert.equal(validator.findPotentialDuplicate(records, {
    studentName: " 张三 ", date: "2026-09-15", course: "高等数学"
  }).id, "1");
  assert.equal(validator.findPotentialDuplicate(records, {
    studentName: "张三", date: "2026-09-16", course: "高等数学"
  }), null);
});
