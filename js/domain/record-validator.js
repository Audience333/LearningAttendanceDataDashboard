(function (root, factory) {
  const config = typeof module === "object" && module.exports
    ? require("../config.js")
    : root.LearningDashboard.CONFIG;
  const api = factory(config);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LearningDashboard = root.LearningDashboard || {};
  root.LearningDashboard.RecordValidator = api;
})(typeof window !== "undefined" ? window : globalThis, function (config) {
  "use strict";

  function cleanText(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function normalizeRecordInput(input = {}) {
    return {
      studentName: cleanText(input.studentName),
      date: cleanText(input.date),
      course: cleanText(input.course),
      durationHours: Number(input.durationHours),
      content: cleanText(input.content),
      completionStatus: cleanText(input.completionStatus) || "completed",
      reflection: cleanText(input.reflection),
      nextPlan: cleanText(input.nextPlan)
    };
  }

  function validateRecord(input, today) {
    const value = normalizeRecordInput(input);
    const errors = {};

    if (!value.studentName || value.studentName.length > 20) {
      errors.studentName = "请输入 1 至 20 个字符的姓名";
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value.date) || value.date > today) {
      errors.date = "日期不能为空且不能晚于今天";
    }
    if (!config.courses.includes(value.course)) {
      errors.course = "请选择课程列表中的课程";
    }
    if (
      !Number.isFinite(value.durationHours)
      || value.durationHours <= 0
      || value.durationHours > 24
      || Math.abs(Math.round(value.durationHours * 10) - value.durationHours * 10) > Number.EPSILON
    ) {
      errors.durationHours = "时长应大于 0、不超过 24，且最多一位小数";
    }
    if (value.content.length < 2 || value.content.length > 200) {
      errors.content = "学习内容应为 2 至 200 个字符";
    }
    if (!config.statuses.includes(value.completionStatus)) {
      errors.completionStatus = "请选择有效的完成情况";
    }
    if (value.reflection.length > 300) {
      errors.reflection = "今日收获不能超过 300 个字符";
    }
    if (value.nextPlan.length > 300) {
      errors.nextPlan = "明日计划不能超过 300 个字符";
    }

    return { valid: Object.keys(errors).length === 0, value, errors };
  }

  function findPotentialDuplicate(records, input) {
    const value = normalizeRecordInput(input);
    return records.find(record => (
      record.studentName === value.studentName
      && record.date === value.date
      && record.course === value.course
    )) || null;
  }

  return { normalizeRecordInput, validateRecord, findPotentialDuplicate };
});
