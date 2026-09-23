(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LearningDashboard = root.LearningDashboard || {};
  root.LearningDashboard.DashboardView = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function buildMetricModel(summary) {
    return {
      todayParticipants: `${summary.todayParticipantCount} 人`,
      weekParticipants: `${summary.weekParticipantCount} 人`,
      weekHours: `${summary.weekDurationHours} 小时`,
      averageHours: `${summary.averageDurationHours} 小时`,
      totalCheckins: `${summary.totalCheckinCount} 次`,
      popularCourse: summary.popularCourse
    };
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function render(summary) {
    const model = buildMetricModel(summary);
    setText("metric-today", model.todayParticipants);
    setText("metric-week-hours", model.weekHours);
    setText("metric-total-checkins", model.totalCheckins);
    setText("metric-popular-course", model.popularCourse);
    setText("dashboard-today", model.todayParticipants);
    setText("dashboard-week-participants", model.weekParticipants);
    setText("dashboard-week-hours", model.weekHours);
    setText("dashboard-average-hours", model.averageHours);
    setText("dashboard-popular-course", model.popularCourse);
  }

  return { buildMetricModel, render };
});
