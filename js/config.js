(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LearningDashboard = root.LearningDashboard || {};
  root.LearningDashboard.CONFIG = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  return Object.freeze({
    storageKey: "learning-dashboard:v1",
    storageVersion: 1,
    courses: ["程序设计基础", "高等数学", "大学英语", "计算机导论", "思想道德与法治"],
    statuses: ["completed", "partial", "not-completed"]
  });
});
