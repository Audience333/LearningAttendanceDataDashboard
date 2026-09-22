(function (root) {
  "use strict";

  const app = root.LearningDashboard = root.LearningDashboard || {};

  function showView(viewName) {
    const target = document.getElementById(`view-${viewName}`);
    if (!target) return;

    document.querySelectorAll(".view").forEach(view => {
      view.hidden = view !== target;
    });

    document.querySelectorAll("[data-view]").forEach(control => {
      if (control.matches("button")) {
        if (control.dataset.view === viewName) control.setAttribute("aria-current", "page");
        else control.removeAttribute("aria-current");
      }
    });

    const title = target.dataset.pageTitle || "学习打卡数据看板";
    document.title = `${title} · 学习打卡数据看板`;
    history.replaceState(null, "", `#${viewName}`);
  }

  function initNavigation() {
    document.querySelectorAll("[data-view]").forEach(control => {
      control.addEventListener("click", event => {
        event.preventDefault();
        showView(control.dataset.view);
      });
    });

    const initial = location.hash.slice(1) || "home";
    showView(document.getElementById(`view-${initial}`) ? initial : "home");
  }

  app.showView = showView;
  document.addEventListener("DOMContentLoaded", initNavigation);
})(window);
