(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LearningDashboard = root.LearningDashboard || {};
  root.LearningDashboard.RecordFilter = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function normalizeSearchText(value) {
    return String(value || "").trim().toLocaleLowerCase();
  }

  function matchesIncludes(value, query) {
    return !query || normalizeSearchText(value).includes(query);
  }

  function compareNewest(left, right) {
    return right.date.localeCompare(left.date)
      || (Date.parse(right.createdAt || "") || 0) - (Date.parse(left.createdAt || "") || 0)
      || String(right.id || "").localeCompare(String(left.id || ""));
  }

  function filterRecords(records, criteria = {}) {
    const studentName = normalizeSearchText(criteria.studentName);
    const keyword = normalizeSearchText(criteria.keyword);
    const course = String(criteria.course || "").trim();
    const date = String(criteria.date || "").trim();

    return records.filter(record => (
      matchesIncludes(record.studentName, studentName)
      && matchesIncludes(`${record.content || ""} ${record.reflection || ""} ${record.nextPlan || ""}`, keyword)
      && (!course || record.course === course)
      && (!date || record.date === date)
    )).sort(compareNewest);
  }

  return { filterRecords, normalizeSearchText };
});
