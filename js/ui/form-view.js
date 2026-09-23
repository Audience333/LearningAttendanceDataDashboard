(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LearningDashboard = root.LearningDashboard || {};
  root.LearningDashboard.FormView = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function formEntriesToInput(entries) {
    const value = Object.fromEntries(entries);
    return {
      studentName: value.studentName || "",
      date: value.date || "",
      course: value.course || "",
      durationHours: value.durationHours || "",
      content: value.content || "",
      completionStatus: value.completionStatus || "completed",
      reflection: value.reflection || "",
      nextPlan: value.nextPlan || ""
    };
  }

  function getForm() {
    return document.getElementById("checkin-form");
  }

  function read() {
    return formEntriesToInput(new FormData(getForm()).entries());
  }

  function getEditingId() {
    return getForm().elements.editingId.value;
  }

  function clearErrors() {
    const form = getForm();
    form.querySelectorAll("[data-error-for]").forEach(element => { element.textContent = ""; });
    form.querySelectorAll("[aria-invalid='true']").forEach(element => element.removeAttribute("aria-invalid"));
  }

  function showErrors(errors) {
    clearErrors();
    const form = getForm();
    Object.entries(errors).forEach(([name, message]) => {
      const field = form.elements.namedItem(name);
      const error = form.querySelector(`[data-error-for="${name}"]`);
      if (field) field.setAttribute("aria-invalid", "true");
      if (error) error.textContent = message;
    });
    const firstInvalid = form.querySelector("[aria-invalid='true']");
    if (firstInvalid) firstInvalid.focus();
  }

  function bind({ onSubmit }) {
    getForm().addEventListener("submit", event => {
      event.preventDefault();
      onSubmit(read());
    });
  }

  function reset({ keepStudentName = true, date = "" } = {}) {
    const form = getForm();
    const studentName = keepStudentName ? form.elements.studentName.value : "";
    form.reset();
    form.elements.studentName.value = studentName;
    form.elements.date.value = date;
    form.elements.completionStatus.value = "completed";
    form.elements.editingId.value = "";
    document.getElementById("checkin-title").textContent = "学习打卡";
    document.getElementById("checkin-description").textContent = "记录今天的学习投入，为统计和成长反馈提供依据。";
    document.getElementById("checkin-hint").textContent = "提交后，记录将保存在当前浏览器中。";
    document.getElementById("checkin-submit").textContent = "保存学习打卡";
    clearErrors();
  }

  function populate(record) {
    const form = getForm();
    ["studentName", "date", "course", "durationHours", "content", "completionStatus", "reflection", "nextPlan"].forEach(name => {
      form.elements[name].value = record[name] || "";
    });
    form.elements.editingId.value = record.id;
    document.getElementById("checkin-title").textContent = "编辑学习打卡";
    document.getElementById("checkin-description").textContent = `正在编辑 ${record.studentName} 的 ${record.date} 学习记录。`;
    document.getElementById("checkin-hint").textContent = "保存后，所有统计与图表会自动同步。";
    document.getElementById("checkin-submit").textContent = "保存修改";
    clearErrors();
  }

  function setDate(date) {
    getForm().elements.date.value = date;
  }

  return { formEntriesToInput, bind, read, getEditingId, showErrors, clearErrors, reset, populate, setDate };
});
