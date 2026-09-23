(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LearningDashboard = root.LearningDashboard || {};
  root.LearningDashboard.Notification = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  let hideTimer = null;

  function show(message, type = "info") {
    const element = document.getElementById("app-notification");
    if (!element) return;
    element.textContent = message;
    element.dataset.type = type;
    element.classList.add("is-visible");
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => element.classList.remove("is-visible"), 4200);
  }

  return { show };
});
