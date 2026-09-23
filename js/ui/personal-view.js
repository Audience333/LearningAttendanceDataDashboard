(function (root, factory) {
  const api = factory();
  root.LearningDashboard = root.LearningDashboard || {};
  root.LearningDashboard.PersonalView = api;
})(window, function () {
  "use strict";
  const setText = (id, value) => { const element = document.getElementById(id); if (element) element.textContent = value; };
  function render(summary) {
    setText("personal-checkins", `${summary.totalCheckinCount} 次`);
    setText("personal-total-hours", `${summary.totalDurationHours} 小时`);
    setText("personal-week-hours", `${summary.weekDurationHours} 小时`);
    setText("personal-streak", `${summary.streakDays} 天`);
    setText("personal-course", `热门课程：${summary.popularCourse}`);
    setText("personal-trend", summary.sevenDayTrend.map(point => `${point.date.slice(5)} ${point.durationHours}小时`).join(" · ") || "暂无个人学习记录");
  }
  return { render };
});
