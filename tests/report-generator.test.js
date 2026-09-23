const test = require("node:test");
const assert = require("node:assert/strict");
const reports = require("../js/domain/report-generator.js");

test("班级空数据报告说明尚无记录", () => {
  assert.equal(
    reports.generateClassReport({ totalCheckinCount: 0 }),
    "当前还没有可分析的班级学习记录。完成首次打卡后即可生成报告。"
  );
});

test("班级报告引用真实统计值", () => {
  const text = reports.generateClassReport({
    totalCheckinCount: 12,
    weekParticipantCount: 5,
    weekDurationHours: 18.5,
    popularCourse: "程序设计基础",
    sevenDayDirection: "上升"
  });

  assert.match(text, /5 名同学/);
  assert.match(text, /18\.5 小时/);
  assert.match(text, /程序设计基础/);
});

test("个人报告不在空数据中产生 undefined 或 NaN", () => {
  assert.equal(
    reports.generateStudentReport({ studentName: "王同学", totalCheckinCount: 0 }),
    "王同学当前还没有可分析的学习记录。完成首次打卡后即可生成个人报告。"
  );
});
