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

  function buildRankItems(stars, unit) {
    return stars.map(item => ({ studentName: item.studentName, value: `${item.durationHours ?? item.streakDays} ${unit}` }));
  }

  function renderRank(id, items) {
    const list = document.getElementById(id);
    if (!list) return;
    list.replaceChildren(...items.map(item => { const entry = document.createElement("li"); entry.textContent = `${item.studentName} · ${item.value}`; return entry; }));
    if (items.length === 0) { const entry = document.createElement("li"); entry.textContent = "暂无排行数据"; list.appendChild(entry); }
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
    renderRank("learning-stars", buildRankItems(summary.learningStars || [], "小时"));
    renderRank("persistence-stars", buildRankItems(summary.persistenceStars || [], "天"));
  }

  return { buildMetricModel, buildRankItems, render };
});
