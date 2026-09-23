(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LearningDashboard = root.LearningDashboard || {};
  root.LearningDashboard.ChartsView = api;
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";
  let courseBar = null;

  function buildCourseBarOption(courseDurations) {
    return {
      color: ["#2457d6"],
      animationDuration: 500,
      grid: { left: 48, right: 24, top: 24, bottom: 72 },
      tooltip: { trigger: "axis", valueFormatter: value => `${value} 小时` },
      xAxis: {
        type: "category",
        data: courseDurations.map(item => item.course),
        axisLabel: { interval: 0, rotate: courseDurations.length > 3 ? 18 : 0 }
      },
      yAxis: { type: "value", name: "小时", minInterval: 1 },
      series: [{
        name: "学习时长",
        type: "bar",
        barMaxWidth: 46,
        data: courseDurations.map(item => item.durationHours),
        itemStyle: { borderRadius: [8, 8, 0, 0] }
      }]
    };
  }

  function renderFallback(container, message) {
    container.classList.add("chart-fallback");
    container.setAttribute("role", "status");
    container.textContent = message;
  }

  function renderCourseBar(courseDurations) {
    const container = document.getElementById("chart-course-bar");
    if (!container) return;
    if (courseDurations.length === 0) {
      if (courseBar) courseBar.clear();
      renderFallback(container, "暂无课程学习数据");
      return;
    }
    if (!root.echarts) {
      renderFallback(container, "图表组件加载失败，指标和记录仍可正常查看");
      return;
    }
    container.classList.remove("chart-fallback");
    container.removeAttribute("role");
    container.textContent = "";
    courseBar = courseBar || root.echarts.init(container);
    courseBar.setOption(buildCourseBarOption(courseDurations), true);
  }

  function resizeAll() {
    if (courseBar) courseBar.resize();
  }

  return { buildCourseBarOption, renderCourseBar, resizeAll };
});
