(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LearningDashboard = root.LearningDashboard || {};
  root.LearningDashboard.RecordsView = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const statusLabels = {
    completed: "已完成",
    partial: "部分完成",
    "not-completed": "未完成"
  };

  function formatHours(value) {
    return `${Number(value)} 小时`;
  }

  function buildRecordRows(records) {
    return records.slice().sort((left, right) => (
      right.date.localeCompare(left.date)
      || (Date.parse(right.createdAt || "") || 0) - (Date.parse(left.createdAt || "") || 0)
      || String(right.id || "").localeCompare(String(left.id || ""))
    )).map(record => ({
      ...record,
      durationLabel: formatHours(record.durationHours),
      statusLabel: statusLabels[record.completionStatus] || "未填写"
    }));
  }

  function appendCell(row, value, className = "") {
    const cell = document.createElement("td");
    cell.textContent = value;
    if (className) cell.className = className;
    row.appendChild(cell);
  }

  function render(records) {
    const body = document.getElementById("records-body");
    const empty = document.getElementById("records-empty");
    if (!body || !empty) return;
    body.replaceChildren();
    const rows = buildRecordRows(records);
    empty.hidden = rows.length > 0;

    rows.forEach(record => {
      const row = document.createElement("tr");
      appendCell(row, record.studentName);
      appendCell(row, record.date);
      appendCell(row, record.course);
      appendCell(row, record.content, "table-content");
      appendCell(row, record.durationLabel);
      appendCell(row, record.statusLabel);
      body.appendChild(row);
    });
  }

  return { buildRecordRows, render };
});
