const test = require("node:test");
const assert = require("node:assert/strict");
const FormView = require("../js/ui/form-view.js");
const RecordsView = require("../js/ui/records-view.js");
const DashboardView = require("../js/ui/dashboard-view.js");
const ChartsView = require("../js/ui/charts-view.js");
const { createDemoRecords } = require("../js/data/demo-records.js");

test("表单字段转换为校验模块使用的记录输入", () => {
  const input = FormView.formEntriesToInput(new Map([
    ["studentName", "张三"], ["date", "2026-09-22"], ["course", "高等数学"],
    ["durationHours", "1.5"], ["content", "极限练习"], ["completionStatus", "completed"],
    ["reflection", "掌握定义"], ["nextPlan", "完成习题"]
  ]));
  assert.deepEqual(input, {
    studentName: "张三", date: "2026-09-22", course: "高等数学",
    durationHours: "1.5", content: "极限练习", completionStatus: "completed",
    reflection: "掌握定义", nextPlan: "完成习题"
  });
});

test("记录视图模型按学习日期和创建时间倒序并翻译状态", () => {
  const rows = RecordsView.buildRecordRows([
    { id: "1", studentName: "张三", date: "2026-09-21", createdAt: "2026-09-21T10:00:00+08:00", completionStatus: "partial", durationHours: 1 },
    { id: "2", studentName: "李四", date: "2026-09-22", createdAt: "2026-09-22T09:00:00+08:00", completionStatus: "completed", durationHours: 2 }
  ]);
  assert.deepEqual(rows.map(row => row.id), ["2", "1"]);
  assert.deepEqual(rows.map(row => row.statusLabel), ["已完成", "部分完成"]);
  assert.deepEqual(rows.map(row => row.durationLabel), ["2 小时", "1 小时"]);
});

test("记录视图按真实时间排序而不受 ISO 时区格式影响", () => {
  const rows = RecordsView.buildRecordRows([
    { id: "demo", studentName: "演示", date: "2026-09-23", createdAt: "2026-09-23T16:00:00+08:00", completionStatus: "completed", durationHours: 1 },
    { id: "live", studentName: "新增", date: "2026-09-23", createdAt: "2026-09-23T09:00:00.000Z", completionStatus: "completed", durationHours: 1 }
  ]);
  assert.deepEqual(rows.map(row => row.id), ["live", "demo"]);
});

test("当天的演示记录不会排在日间新增记录之前", () => {
  const rows = RecordsView.buildRecordRows([
    ...createDemoRecords("2026-09-23"),
    { id: "live", studentName: "新增", date: "2026-09-23", createdAt: "2026-09-23T06:00:00+08:00", completionStatus: "completed", durationHours: 1 }
  ]);
  assert.equal(rows[0].id, "live");
});

test("指标模型为数字添加单位并保留课程文本", () => {
  const model = DashboardView.buildMetricModel({
    todayParticipantCount: 8,
    weekParticipantCount: 12,
    weekDurationHours: 36.5,
    averageDurationHours: 3,
    totalCheckinCount: 42,
    popularCourse: "程序设计基础"
  });
  assert.deepEqual(model, {
    todayParticipants: "8 人", weekParticipants: "12 人", weekHours: "36.5 小时",
    averageHours: "3 小时", totalCheckins: "42 次", popularCourse: "程序设计基础"
  });
});

test("排行榜模型只呈现积极学习指标", () => {
  assert.deepEqual(DashboardView.buildRankItems([{ studentName: "张三", durationHours: 4.5 }], "小时"), [
    { studentName: "张三", value: "4.5 小时" }
  ]);
});

test("课程柱状图模型使用真实课程名称和小时值", () => {
  const option = ChartsView.buildCourseBarOption([
    { course: "高等数学", durationHours: 5.5 },
    { course: "大学英语", durationHours: 3 }
  ]);
  assert.deepEqual(option.xAxis.data, ["高等数学", "大学英语"]);
  assert.deepEqual(option.series[0].data, [5.5, 3]);
  assert.equal(option.series[0].type, "bar");
});
