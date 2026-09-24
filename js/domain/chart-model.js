(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LearningDashboard = root.LearningDashboard || {};
  root.LearningDashboard.ChartModel = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function buildChartModel(summary = {}) {
    const trend = (summary.sevenDayTrend || []).map(point => ({ label: point.date, value: Number(point.durationHours || 0) }));
    const courses = (summary.courseDurations || []).map(item => ({ label: item.course, value: Number(item.durationHours || 0) }));
    return {
      trend: { labels: trend.map(point => point.label), values: trend.map(point => point.value) },
      courseBar: { labels: courses.map(item => item.label), values: courses.map(item => item.value) },
      coursePie: courses.map(item => ({ name: item.label, value: item.value }))
    };
  }

  return { buildChartModel };
});
