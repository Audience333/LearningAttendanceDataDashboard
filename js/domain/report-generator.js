(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LearningDashboard = root.LearningDashboard || {};
  root.LearningDashboard.ReportGenerator = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function asHours(value) {
    return Number.isFinite(Number(value)) ? Number(value) : 0;
  }

  function generateClassReport(summary = {}) {
    if (!Number(summary.totalCheckinCount)) {
      return "当前还没有可分析的班级学习记录。完成首次打卡后即可生成报告。";
    }
    const participants = Number(summary.weekParticipantCount) || 0;
    const hours = asHours(summary.weekDurationHours);
    const course = summary.popularCourse || "暂无数据";
    const direction = summary.sevenDayDirection || "平稳";
    return `本周共有 ${participants} 名同学参与学习，累计投入 ${hours} 小时。当前投入最多的课程是${course}，近七天学习趋势${direction}。`;
  }

  function generateStudentReport(summary = {}) {
    const name = summary.studentName || "这位同学";
    if (!Number(summary.totalCheckinCount)) {
      return `${name}当前还没有可分析的学习记录。完成首次打卡后即可生成个人报告。`;
    }
    return `${name}已完成 ${Number(summary.totalCheckinCount)} 次学习打卡，累计投入 ${asHours(summary.totalDurationHours)} 小时；本周学习 ${asHours(summary.weekDurationHours)} 小时，已连续坚持 ${Number(summary.streakDays) || 0} 天，投入最多的课程是${summary.popularCourse || "暂无数据"}。`;
  }

  return { generateClassReport, generateStudentReport };
});
