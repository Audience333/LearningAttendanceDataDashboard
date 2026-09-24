const test = require("node:test");
const assert = require("node:assert/strict");
const { buildChartModel } = require("../js/domain/chart-model.js");

test("图表模型包含七天、课程时长和课程占比", () => {
  const model = buildChartModel({
    sevenDayTrend: [{ date: "2026-09-22", durationHours: 3 }],
    courseDurations: [{ course: "高等数学", durationHours: 3 }]
  });
  assert.deepEqual(model.trend.values, [3]);
  assert.deepEqual(model.courseBar.values, [3]);
  assert.deepEqual(model.coursePie, [{ name: "高等数学", value: 3 }]);
});

test("无课程数据时饼图返回空序列", () => {
  assert.deepEqual(buildChartModel({ sevenDayTrend: [], courseDurations: [] }).coursePie, []);
});
