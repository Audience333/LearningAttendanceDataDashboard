const test = require("node:test");
const assert = require("node:assert/strict");
const stats = require("../js/domain/statistics.js");

const records = [
  { id: "1", studentName: "张三", date: "2026-12-31", course: "高等数学", durationHours: 1 },
  { id: "2", studentName: "张三", date: "2026-12-31", course: "大学英语", durationHours: 2 },
  { id: "3", studentName: "李四", date: "2027-01-01", course: "高等数学", durationHours: 3 },
  { id: "4", studentName: "王五", date: "2026-12-27", course: "大学英语", durationHours: 9 }
];

test("跨年周按周一边界汇总并对今日人数去重", () => {
  const summary = stats.buildClassSummary(records, new Date(2026, 11, 31, 12));
  assert.equal(summary.todayParticipantCount, 1);
  assert.equal(summary.weekParticipantCount, 1);
  assert.equal(summary.weekDurationHours, 3);
  assert.equal(summary.averageDurationHours, 3);
  assert.equal(summary.totalCheckinCount, 4);
  assert.equal(summary.popularCourse, "大学英语");
});

test("最近七天补齐没有记录的日期", () => {
  const trend = stats.buildSevenDayTrend(records, new Date(2027, 0, 1, 12));
  assert.equal(trend.length, 7);
  assert.equal(trend.find(point => point.date === "2026-12-30").durationHours, 0);
  assert.equal(trend.find(point => point.date === "2026-12-31").durationHours, 3);
  assert.equal(trend.find(point => point.date === "2027-01-01").durationHours, 3);
});

test("学习之星并列时按打卡天数再按姓名排序", () => {
  const ranking = stats.buildLearningStars([
    { studentName: "李四", date: "2026-09-21", durationHours: 2 },
    { studentName: "张三", date: "2026-09-21", durationHours: 1 },
    { studentName: "张三", date: "2026-09-22", durationHours: 1 }
  ], new Date(2026, 8, 22, 12), 5);
  assert.deepEqual(ranking.map(item => item.studentName), ["张三", "李四"]);
  assert.deepEqual(ranking.map(item => item.durationHours), [2, 2]);
  assert.deepEqual(ranking.map(item => item.checkinDays), [2, 1]);
});

test("个人汇总将同日多条记录只计为一个连续打卡日", () => {
  const summary = stats.buildStudentSummary([
    { studentName: "张三", date: "2026-09-20", course: "高等数学", durationHours: 1 },
    { studentName: "张三", date: "2026-09-21", course: "高等数学", durationHours: 2 },
    { studentName: "张三", date: "2026-09-21", course: "大学英语", durationHours: 1 },
    { studentName: "张三", date: "2026-09-22", course: "高等数学", durationHours: 1.5 }
  ], "张三", new Date(2026, 8, 22, 12));
  assert.equal(summary.totalCheckinCount, 4);
  assert.equal(summary.totalDurationHours, 5.5);
  assert.equal(summary.weekDurationHours, 4.5);
  assert.equal(summary.streakDays, 3);
  assert.equal(summary.popularCourse, "高等数学");
});

test("空记录返回零指标和空课程", () => {
  const summary = stats.buildClassSummary([], new Date(2026, 8, 22, 12));
  assert.equal(summary.averageDurationHours, 0);
  assert.equal(summary.popularCourse, "暂无数据");
  assert.deepEqual(summary.courseDurations, []);
});

test("个人名单中文排序，坚持之星按连续天数排列，并计算趋势方向", () => {
  const rankingRecords = [
    { studentName: "李四", date: "2026-09-21", course: "高等数学", durationHours: 1 },
    { studentName: "张三", date: "2026-09-20", course: "高等数学", durationHours: 1 },
    { studentName: "张三", date: "2026-09-21", course: "高等数学", durationHours: 1 },
    { studentName: "张三", date: "2026-09-22", course: "高等数学", durationHours: 1 }
  ];
  assert.deepEqual(stats.getStudentNames(rankingRecords), ["李四", "张三"]);
  assert.deepEqual(stats.buildPersistenceStars(rankingRecords, 3).map(item => item.studentName), ["张三", "李四"]);
  assert.equal(stats.getTrendDirection([{ durationHours: 1 }, { durationHours: 3 }]), "上升");
});
