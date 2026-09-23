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
    clearErrors();
  }

  function setDate(date) {
    getForm().elements.date.value = date;
  }

  return { formEntriesToInput, bind, read, showErrors, clearErrors, reset, setDate };
});
