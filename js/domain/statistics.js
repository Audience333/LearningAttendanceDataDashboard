(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LearningDashboard = root.LearningDashboard || {};
  root.LearningDashboard.Statistics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function parseLocalDate(value) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day, 12, 0, 0);
  }

  function formatLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function roundHours(value) {
    return Math.round((value + Number.EPSILON) * 10) / 10;
  }

  function startOfLocalWeek(now) {
    const result = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
    const daysSinceMonday = (result.getDay() + 6) % 7;
    result.setDate(result.getDate() - daysSinceMonday);
    return result;
  }

  function recordsInRange(records, range) {
    if (!range) return records.slice();
    return records.filter(record => record.date >= range.start && record.date <= range.end);
  }

  function groupDurationByCourse(records, range) {
    const totals = new Map();
    recordsInRange(records, range).forEach(record => {
      totals.set(record.course, (totals.get(record.course) || 0) + Number(record.durationHours || 0));
    });
    return Array.from(totals, ([course, durationHours]) => ({
      course,
      durationHours: roundHours(durationHours)
    })).sort((left, right) => (
      right.durationHours - left.durationHours
      || left.course.localeCompare(right.course, "zh-CN")
    ));
  }

  function buildSevenDayTrend(records, now) {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
    const dates = [];
    const totals = new Map();

    records.forEach(record => {
      totals.set(record.date, (totals.get(record.date) || 0) + Number(record.durationHours || 0));
    });

    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - offset);
      const dateText = formatLocalDate(date);
      dates.push({ date: dateText, durationHours: roundHours(totals.get(dateText) || 0) });
    }
    return dates;
  }

  function buildLearningStars(records, now, limit = 5) {
    const range = {
      start: formatLocalDate(startOfLocalWeek(now)),
      end: formatLocalDate(now)
    };
    const byStudent = new Map();

    recordsInRange(records, range).forEach(record => {
      const current = byStudent.get(record.studentName) || {
        studentName: record.studentName,
        durationHours: 0,
        dates: new Set()
      };
      current.durationHours += Number(record.durationHours || 0);
      current.dates.add(record.date);
      byStudent.set(record.studentName, current);
    });

    return Array.from(byStudent.values(), item => ({
      studentName: item.studentName,
      durationHours: roundHours(item.durationHours),
      checkinDays: item.dates.size
    })).sort((left, right) => (
      right.durationHours - left.durationHours
      || right.checkinDays - left.checkinDays
      || left.studentName.localeCompare(right.studentName, "zh-CN")
    )).slice(0, limit);
  }

  function calculateStreak(records) {
    const dates = [...new Set(records.map(record => record.date))].sort().reverse();
    if (dates.length === 0) return 0;

    let streakDays = 1;
    let cursor = parseLocalDate(dates[0]);
    for (let index = 1; index < dates.length; index += 1) {
      const next = parseLocalDate(dates[index]);
      const difference = Math.round((cursor - next) / 86400000);
      if (difference !== 1) break;
      streakDays += 1;
      cursor = next;
    }
    return streakDays;
  }

  function buildStudentSummary(records, studentName, now) {
    const studentRecords = records.filter(record => record.studentName === studentName);
    const weekRange = {
      start: formatLocalDate(startOfLocalWeek(now)),
      end: formatLocalDate(now)
    };
    const weekRecords = recordsInRange(studentRecords, weekRange);
    const courses = groupDurationByCourse(studentRecords);

    return {
      studentName,
      totalCheckinCount: studentRecords.length,
      totalDurationHours: roundHours(studentRecords.reduce((sum, record) => sum + Number(record.durationHours || 0), 0)),
      weekDurationHours: roundHours(weekRecords.reduce((sum, record) => sum + Number(record.durationHours || 0), 0)),
      streakDays: calculateStreak(studentRecords),
      popularCourse: courses[0]?.course || "暂无数据",
      sevenDayTrend: buildSevenDayTrend(studentRecords, now)
    };
  }

  function buildClassSummary(records, now) {
    const today = formatLocalDate(now);
    const weekRange = {
      start: formatLocalDate(startOfLocalWeek(now)),
      end: today
    };
    const weekRecords = recordsInRange(records, weekRange);
    const todayParticipants = new Set(records.filter(record => record.date === today).map(record => record.studentName));
    const weekParticipants = new Set(weekRecords.map(record => record.studentName));
    const weekDurationHours = roundHours(weekRecords.reduce((sum, record) => sum + Number(record.durationHours || 0), 0));
    const courseDurations = groupDurationByCourse(weekRecords);

    return {
      todayParticipantCount: todayParticipants.size,
      weekParticipantCount: weekParticipants.size,
      weekDurationHours,
      averageDurationHours: weekParticipants.size ? roundHours(weekDurationHours / weekParticipants.size) : 0,
      totalCheckinCount: records.length,
      popularCourse: courseDurations[0]?.course || "暂无数据",
      courseDurations,
      sevenDayTrend: buildSevenDayTrend(records, now),
      learningStars: buildLearningStars(records, now)
    };
  }

  return {
    parseLocalDate,
    formatLocalDate,
    startOfLocalWeek,
    buildClassSummary,
    buildStudentSummary,
    buildSevenDayTrend,
    groupDurationByCourse,
    buildLearningStars
  };
});
