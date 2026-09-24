(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LearningDashboard = root.LearningDashboard || {};
  root.LearningDashboard.DemoData = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const students = ["张三", "李四", "王五", "赵六", "陈晨", "刘洋", "周宁", "孙悦", "吴昊", "郑好", "冯雪", "褚明", "卫东", "蒋依", "沈阳", "韩梅", "杨帆", "朱莉", "秦川", "尤佳", "许诺", "何欢", "吕航", "施然", "孔维", "曹颖", "严谨", "华安", "金鑫", "魏然"];
  const courses = ["程序设计基础", "高等数学", "大学英语", "计算机导论", "思想道德与法治"];
  const contents = ["数组与循环练习", "极限与导数复习", "阅读与词汇训练", "计算机组成预习", "章节知识梳理"];

  function localDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function parseLocalDate(value) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day, 12, 0, 0);
  }

  function createDemoRecords(anchorDate = localDateString(new Date())) {
    const anchor = parseLocalDate(anchorDate);
    const records = [];

    for (let dayOffset = 6; dayOffset >= 0; dayOffset -= 1) {
      const date = new Date(anchor);
      date.setDate(anchor.getDate() - dayOffset);
      const dateText = localDateString(date);

      students.forEach((studentName, studentIndex) => {
        const courseIndex = (studentIndex + dayOffset) % courses.length;
        const hourTenths = 8 + ((studentIndex * 3 + dayOffset * 2) % 15);
        records.push({
          id: `demo-${dateText}-${String(studentIndex + 1).padStart(2, "0")}`,
          studentName,
          date: dateText,
          course: courses[courseIndex],
          durationHours: hourTenths / 10,
          content: contents[courseIndex],
          completionStatus: studentIndex % 4 === 0 ? "partial" : "completed",
          reflection: "按计划完成了本次学习，并记录了需要继续巩固的知识点。",
          nextPlan: "复习今日内容并完成下一组练习。",
          createdAt: `${dateText}T00:00:00+08:00`,
          updatedAt: `${dateText}T00:00:00+08:00`
        });
      });
    }

    return records;
  }

  return { createDemoRecords };
});
