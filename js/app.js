(function (root) {
  "use strict";

  const app = root.LearningDashboard = root.LearningDashboard || {};
  let repository = null;
  let recordFilters = {};

  function todayString() {
    return app.Statistics.formatLocalDate(new Date());
  }

  function createRecord(value) {
    const timestamp = new Date().toISOString();
    const generatedId = root.crypto && typeof root.crypto.randomUUID === "function"
      ? root.crypto.randomUUID()
      : `record-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return { ...value, id: generatedId, createdAt: timestamp, updatedAt: timestamp };
  }

  function refreshAll() {
    const records = repository.list();
    const summary = app.Statistics.buildClassSummary(records, new Date());
    app.RecordsView.render(app.RecordFilter.filterRecords(records, recordFilters));
    app.DashboardView.render(summary);
    app.ChartsView.renderCourseBar(summary.courseDurations);
  }

  function handleSubmit(input) {
    const editingId = app.FormView.getEditingId();
    const result = app.RecordValidator.validateRecord(input, todayString());
    app.FormView.showErrors(result.errors);
    if (!result.valid) return;

    const duplicate = app.RecordValidator.findPotentialDuplicate(repository.list(), result.value);
    if (duplicate && duplicate.id !== editingId && !root.confirm("同一姓名、日期和课程已有记录，仍要继续保存吗？")) return;

    try {
      if (editingId) {
        repository.update(editingId, { ...result.value, updatedAt: new Date().toISOString() });
      } else {
        repository.add(createRecord(result.value));
      }
      refreshAll();
      app.FormView.reset({ keepStudentName: true, date: todayString() });
      app.Notification.show(editingId ? "学习记录已更新，并已同步统计数据。" : "学习打卡已保存，并已更新统计数据。", "success");
    } catch (error) {
      app.Notification.show(error.message || "保存失败，请稍后重试。", "error");
    }
  }

  function handleEdit(id) {
    const record = repository.list().find(item => item.id === id);
    if (!record) return;
    app.FormView.populate(record);
    showView("checkin");
  }

  function handleDelete(id) {
    if (!root.confirm("确定删除这条打卡记录吗？")) return;
    try {
      repository.remove(id);
      if (app.FormView.getEditingId() === id) app.FormView.reset({ keepStudentName: true, date: todayString() });
      refreshAll();
      app.Notification.show("学习记录已删除，统计数据已同步。", "success");
    } catch (error) {
      app.Notification.show(error.message || "删除失败，请稍后重试。", "error");
    }
  }

  function initRecordFilters() {
    const form = document.getElementById("record-filters");
    form.addEventListener("input", () => {
      recordFilters = Object.fromEntries(new FormData(form).entries());
      refreshAll();
    });
    form.addEventListener("change", () => {
      recordFilters = Object.fromEntries(new FormData(form).entries());
      refreshAll();
    });
    document.getElementById("clear-record-filters").addEventListener("click", () => {
      form.reset();
      recordFilters = {};
      refreshAll();
    });
  }

  function initDataFlow() {
    repository = app.RecordRepository.createRecordRepository(root.localStorage, app.CONFIG);
    const state = repository.load();
    if (state.status === "empty") {
      repository.seed(app.DemoData.createDemoRecords(todayString()));
    } else if (state.status === "corrupt") {
      app.Notification.show("本地数据格式异常，暂未覆盖原数据。", "error");
    }
    app.FormView.setDate(todayString());
    app.FormView.bind({ onSubmit: handleSubmit });
    app.RecordsView.bind({ onEdit: handleEdit, onDelete: handleDelete });
    initRecordFilters();
    refreshAll();
    root.addEventListener("resize", app.ChartsView.resizeAll);
  }

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

  function init() {
    initNavigation();
    initDataFlow();
  }

  app.showView = showView;
  app.refreshAll = refreshAll;
  document.addEventListener("DOMContentLoaded", init);
})(window);
