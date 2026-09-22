# 学习打卡数据看板实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 分三个可独立验收和推送的阶段，交付达到任务书优秀完成度的学习打卡数据看板。

**Architecture:** 使用无需构建工具的单页应用，HTML 通过 `defer` 加载职责单一的经典 JavaScript 文件；每个模块同时向浏览器命名空间和 CommonJS 导出接口，使浏览器直接运行与 Node 内置测试兼容。localStorage 是持久化事实来源，领域纯函数生成统计模型，UI 层只渲染模型，ECharts 只消费图表模型。

**Tech Stack:** HTML5、CSS3、原生 JavaScript、localStorage、ECharts 5、Node.js 内置 `node:test`

**Spec:** `docs/superpowers/specs/2026-09-22-learning-checkin-dashboard-design.md`

## Global Constraints

- 使用 HTML、CSS、原生 JavaScript、localStorage 和 ECharts。
- 系统采用纯前端方案，不要求服务器、登录系统或数据库。
- 所有统计指标、排行榜、图表和报告必须来自保存的打卡记录，不使用写死的展示数字。
- 课程使用预设列表，排行榜只采用正向表达。
- 不引入构建工具、前端框架、后端服务或非必要运行时依赖。
- `durationHours` 大于 0 且不超过 24，最多一位小数。
- 所有日期按浏览器本地时区解释，一周从周一开始。
- 存储键固定为 `learning-dashboard:v1`。
- 每个阶段必须先通过自动测试和手工验收，再提交并执行 `git push origin HEAD`。

## Review Focus

- localStorage 包含语法正确但结构错误的 JSON 时，系统回退为空状态、显示恢复入口且不静默覆盖原值；Task 3 覆盖。
- 一条记录位于周日或跨年周边时，本周统计仍按本地时间和周一边界计算；Task 4 覆盖。
- 同一学生同一天多条记录时，今日人数和连续天数必须去重，但打卡次数仍按记录数计算；Task 4 覆盖。
- ECharts CDN 不可用时，列表、指标和报告仍可使用，图表区域显示可理解错误；Task 8 覆盖。
- 恢复演示数据会覆盖用户记录，必须经过明确二次确认，取消后数据不变；Task 9 覆盖。

---

## 阶段一 最小可运行闭环

### Task 1: 建立可直接运行和可测试的应用骨架

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `css/tokens.css`
- Create: `css/base.css`
- Create: `css/layout.css`
- Create: `css/components.css`
- Create: `js/config.js`
- Create: `js/app.js`
- Create: `tests/scaffold.test.js`

**Interfaces:**
- Consumes: 无。
- Produces: `window.LearningDashboard` 命名空间、`CONFIG` 常量、页面视图容器和 `npm test` 命令。

- [ ] **Step 1: 写失败的页面骨架测试**

```js
// tests/scaffold.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("index.html", "utf8");

test("页面包含六个核心视图和主导航", () => {
  for (const id of ["home", "checkin", "records", "personal", "dashboard", "reports"]) {
    assert.match(html, new RegExp(`id=["']view-${id}["']`));
    assert.match(html, new RegExp(`data-view=["']${id}["']`));
  }
});

test("脚本使用 defer 且按依赖顺序加载", () => {
  assert.match(html, /<script defer src="js\/config\.js"><\/script>/);
  assert.ok(html.indexOf("js/config.js") < html.indexOf("js/app.js"));
});
```

- [ ] **Step 2: 运行测试并确认因文件不存在而失败**

Run: `node --test tests/scaffold.test.js`

Expected: FAIL，错误包含 `ENOENT` 或缺失视图断言。

- [ ] **Step 3: 建立测试命令和页面结构**

```json
{
  "name": "learning-checkin-dashboard",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "test": "node --test tests/*.test.js"
  }
}
```

`index.html` 必须包含：跳转到正文的链接、带六个 `data-view` 按钮的导航、六个 `id="view-*"` 的 `<section>`、`aria-live="polite"` 通知区域、ECharts CDN 脚本以及按 `config → data/storage/domain → ui → app` 顺序加载的本地脚本。初始只显示首页，其他区域使用 `hidden`。

- [ ] **Step 4: 建立设计变量和基础布局**

```css
/* css/tokens.css */
:root {
  --color-bg: #f5f7fb;
  --color-surface: #ffffff;
  --color-primary: #2457d6;
  --color-primary-strong: #163d9f;
  --color-text: #172033;
  --color-muted: #647087;
  --color-border: #dce2ec;
  --color-success: #18794e;
  --color-danger: #b42318;
  --radius-card: 16px;
  --shadow-card: 0 10px 30px rgba(26, 45, 85, 0.08);
  --content-max: 1440px;
}
```

`base.css` 提供 reset、字体、焦点环和隐藏属性；`layout.css` 提供页面容器、12 列看板网格和移动端断点；`components.css` 提供按钮、表单、卡片、表格、通知与空状态样式。

- [ ] **Step 5: 建立配置与启动入口**

```js
// js/config.js
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LearningDashboard = root.LearningDashboard || {};
  root.LearningDashboard.CONFIG = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  return Object.freeze({
    storageKey: "learning-dashboard:v1",
    storageVersion: 1,
    courses: ["程序设计基础", "高等数学", "大学英语", "计算机导论", "思想道德与法治"],
    statuses: ["completed", "partial", "not-completed"]
  });
});
```

`app.js` 在 `DOMContentLoaded` 后绑定导航；切换视图时同步 `hidden`、`aria-current` 和页面标题，不包含业务数据逻辑。

- [ ] **Step 6: 运行测试并提交骨架**

Run: `npm test`

Expected: PASS，2 tests，0 failures。

```bash
git add package.json index.html css js/config.js js/app.js tests/scaffold.test.js
git commit -m "feat: scaffold dashboard application"
```

### Task 2: 实现记录模型标准化和校验

**Files:**
- Create: `js/domain/record-validator.js`
- Create: `tests/record-validator.test.js`
- Modify: `index.html`

**Interfaces:**
- Consumes: `CONFIG.courses` 和 `CONFIG.statuses`。
- Produces: `normalizeRecordInput(input)`、`validateRecord(input, today)`、`findPotentialDuplicate(records, input)`。

- [ ] **Step 1: 写校验失败测试**

```js
// tests/record-validator.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const validator = require("../js/domain/record-validator.js");

test("规范化姓名、内容和数字时长", () => {
  const value = validator.normalizeRecordInput({
    studentName: " 张三 ", date: "2026-09-15", course: "程序设计基础",
    durationHours: "1.5", content: " 数组练习 ", completionStatus: "completed"
  });
  assert.equal(value.studentName, "张三");
  assert.equal(value.durationHours, 1.5);
  assert.equal(value.content, "数组练习");
});

test("拒绝空字段、未来日期和非法时长", () => {
  const result = validator.validateRecord({
    studentName: "", date: "2026-09-23", course: "程序设计基础",
    durationHours: 0, content: "x", completionStatus: "completed"
  }, "2026-09-22");
  assert.deepEqual(Object.keys(result.errors).sort(), ["content", "date", "durationHours", "studentName"]);
});

test("只将同姓名同日期同课程判为潜在重复", () => {
  const records = [{ id: "1", studentName: "张三", date: "2026-09-15", course: "高等数学" }];
  assert.equal(validator.findPotentialDuplicate(records, { studentName: "张三", date: "2026-09-15", course: "高等数学" }).id, "1");
  assert.equal(validator.findPotentialDuplicate(records, { studentName: "张三", date: "2026-09-16", course: "高等数学" }), null);
});
```

- [ ] **Step 2: 运行测试并确认模块缺失**

Run: `node --test tests/record-validator.test.js`

Expected: FAIL，错误包含 `Cannot find module`。

- [ ] **Step 3: 实现纯函数校验模块**

```js
function validateRecord(input, today) {
  const value = normalizeRecordInput(input);
  const errors = {};
  if (!value.studentName || value.studentName.length > 20) errors.studentName = "请输入 1 至 20 个字符的姓名";
  if (!value.date || value.date > today) errors.date = "日期不能为空且不能晚于今天";
  if (!value.course) errors.course = "请选择课程";
  if (!Number.isFinite(value.durationHours) || value.durationHours <= 0 || value.durationHours > 24 || Math.round(value.durationHours * 10) !== value.durationHours * 10) errors.durationHours = "时长应为 0 至 24 之间且最多一位小数";
  if (value.content.length < 2 || value.content.length > 200) errors.content = "学习内容应为 2 至 200 个字符";
  if (value.reflection.length > 300) errors.reflection = "今日收获不能超过 300 个字符";
  if (value.nextPlan.length > 300) errors.nextPlan = "明日计划不能超过 300 个字符";
  return { valid: Object.keys(errors).length === 0, value, errors };
}
```

模块使用与 `config.js` 相同的双环境导出包装；`findPotentialDuplicate` 对姓名、日期和课程使用严格相等比较。

- [ ] **Step 4: 在 HTML 中加载校验脚本并运行测试**

Run: `npm test`

Expected: PASS，5 tests，0 failures。

- [ ] **Step 5: 提交记录校验**

```bash
git add index.html js/domain/record-validator.js tests/record-validator.test.js
git commit -m "feat: validate learning records"
```

### Task 3: 实现持久化和可复现演示数据

**Files:**
- Create: `js/data/demo-records.js`
- Create: `js/storage/record-repository.js`
- Create: `tests/record-repository.test.js`
- Modify: `index.html`

**Interfaces:**
- Consumes: `CONFIG.storageKey`、`CONFIG.storageVersion`。
- Produces: `createDemoRecords()` 和 `createRecordRepository(storage, config)`，Repository 实现 `load/save/list/add/update/remove/clear/seed`。

- [ ] **Step 1: 写内存存储和 Repository 失败测试**

```js
// tests/record-repository.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const { createRecordRepository } = require("../js/storage/record-repository.js");

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: key => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key)
  };
}

test("新增、修改和删除记录后重新加载结果一致", () => {
  const repo = createRecordRepository(memoryStorage(), { storageKey: "test", storageVersion: 1 });
  repo.seed([]);
  repo.add({ id: "a", studentName: "张三" });
  assert.equal(repo.update("a", { studentName: "李四" }).studentName, "李四");
  assert.equal(repo.list()[0].studentName, "李四");
  assert.equal(repo.remove("a"), true);
  assert.equal(repo.list().length, 0);
});

test("结构损坏时不覆盖原值并返回可恢复错误", () => {
  const storage = memoryStorage({ test: JSON.stringify({ version: 1, records: "wrong" }) });
  const repo = createRecordRepository(storage, { storageKey: "test", storageVersion: 1 });
  const state = repo.load();
  assert.equal(state.status, "corrupt");
  assert.deepEqual(state.records, []);
  assert.equal(storage.getItem("test"), JSON.stringify({ version: 1, records: "wrong" }));
});

test("写入失败时抛出 StorageWriteError", () => {
  const storage = { getItem: () => null, setItem: () => { throw new Error("quota"); } };
  const repo = createRecordRepository(storage, { storageKey: "test", storageVersion: 1 });
  assert.throws(() => repo.seed([]), { name: "StorageWriteError" });
});
```

- [ ] **Step 2: 运行测试并确认 Repository 缺失**

Run: `node --test tests/record-repository.test.js`

Expected: FAIL，错误包含 `Cannot find module`。

- [ ] **Step 3: 实现 Repository 和错误类型**

`load()` 返回 `{ status: "ok" | "empty" | "corrupt", version, initializedWithDemoData, records, rawBackup }`。`save()` 捕获存储异常并抛出名称为 `StorageWriteError` 的错误。`update()` 找不到 ID 时抛出 `RecordNotFoundError`；`remove()` 找不到 ID 时返回 `false`。

```js
function isValidState(value, version) {
  return value && value.version === version && Array.isArray(value.records);
}

function load() {
  const raw = storage.getItem(config.storageKey);
  if (raw === null) return { status: "empty", version: config.storageVersion, initializedWithDemoData: false, records: [] };
  try {
    const value = JSON.parse(raw);
    if (!isValidState(value, config.storageVersion)) throw new TypeError("invalid storage schema");
    return { status: "ok", ...value };
  } catch (error) {
    return { status: "corrupt", version: config.storageVersion, initializedWithDemoData: false, records: [], rawBackup: raw };
  }
}
```

- [ ] **Step 4: 生成确定性的阶段一演示数据**

`createDemoRecords()` 使用固定姓名、课程和日期数组生成不少于 20 条记录；不得调用随机数。每条记录具有合法 ID、ISO 时间和全部数据字段，使测试和截图每次一致。

- [ ] **Step 5: 在 HTML 中按数据模块、Repository 顺序加载脚本并运行测试**

Run: `npm test`

Expected: PASS，8 tests，0 failures。

- [ ] **Step 6: 提交存储和演示数据**

```bash
git add index.html js/data/demo-records.js js/storage/record-repository.js tests/record-repository.test.js
git commit -m "feat: persist learning records"
```

### Task 4: 实现统计领域模型

**Files:**
- Create: `js/domain/statistics.js`
- Create: `tests/statistics.test.js`
- Modify: `index.html`

**Interfaces:**
- Consumes: 合法的 `StudyRecord[]`。
- Produces: `startOfLocalWeek`、`buildClassSummary`、`buildStudentSummary`、`buildSevenDayTrend`、`groupDurationByCourse`、`buildLearningStars`。

- [ ] **Step 1: 写日期、去重和跨周失败测试**

```js
// tests/statistics.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const stats = require("../js/domain/statistics.js");

const records = [
  { id: "1", studentName: "张三", date: "2026-12-31", course: "高等数学", durationHours: 1 },
  { id: "2", studentName: "张三", date: "2026-12-31", course: "大学英语", durationHours: 2 },
  { id: "3", studentName: "李四", date: "2027-01-01", course: "高等数学", durationHours: 3 },
  { id: "4", studentName: "王五", date: "2026-12-27", course: "大学英语", durationHours: 9 }
];

test("跨年周按周一边界汇总并对今日人数去重", () => {
  const summary = stats.buildClassSummary(records, new Date(2026, 11, 31, 12));
  assert.equal(summary.todayParticipantCount, 1);
  assert.equal(summary.weekDurationHours, 3);
  assert.equal(summary.totalCheckinCount, 4);
});

test("最近七天补齐没有记录的日期", () => {
  const trend = stats.buildSevenDayTrend(records, new Date(2027, 0, 1, 12));
  assert.equal(trend.length, 7);
  assert.equal(trend.find(point => point.date === "2026-12-30").durationHours, 0);
});

test("学习之星并列时按打卡天数再按姓名排序", () => {
  const ranking = stats.buildLearningStars([
    { studentName: "李四", date: "2026-09-21", durationHours: 2 },
    { studentName: "张三", date: "2026-09-21", durationHours: 1 },
    { studentName: "张三", date: "2026-09-22", durationHours: 1 }
  ], new Date(2026, 8, 22, 12), 5);
  assert.deepEqual(ranking.map(item => item.studentName), ["张三", "李四"]);
});
```

- [ ] **Step 2: 运行测试并确认统计模块缺失**

Run: `node --test tests/statistics.test.js`

Expected: FAIL，错误包含 `Cannot find module`。

- [ ] **Step 3: 实现本地日期工具和汇总函数**

使用 `new Date(year, month - 1, day, 12)` 解析 `YYYY-MM-DD`，避免午夜夏令时边界；输出日期使用本地年月日拼接，不使用 `toISOString()` 截断日期。所有时长通过 `roundHours(value) = Math.round(value * 10) / 10` 输出。

`buildClassSummary` 返回：

```js
{
  todayParticipantCount,
  weekDurationHours,
  averageDurationHours,
  totalCheckinCount,
  popularCourse,
  courseDurations,
  sevenDayTrend,
  learningStars
}
```

- [ ] **Step 4: 实现个人汇总和连续打卡**

`buildStudentSummary` 返回姓名、累计次数、累计时长、本周时长、连续天数、热门课程和个人七天趋势。连续天数从该学生最新一次打卡日期向前计算，同日记录先按日期去重；最新记录不要求发生在今天。

- [ ] **Step 5: 加载统计脚本并运行全部测试**

Run: `npm test`

Expected: PASS，11 tests，0 failures。

- [ ] **Step 6: 提交统计模型**

```bash
git add index.html js/domain/statistics.js tests/statistics.test.js
git commit -m "feat: calculate dashboard statistics"
```

### Task 5: 连接打卡、记录、指标和首张图表

**Files:**
- Create: `js/ui/notification.js`
- Create: `js/ui/form-view.js`
- Create: `js/ui/records-view.js`
- Create: `js/ui/dashboard-view.js`
- Create: `js/ui/charts-view.js`
- Create: `tests/app-contract.test.js`
- Modify: `index.html`
- Modify: `js/app.js`
- Modify: `css/components.css`

**Interfaces:**
- Consumes: Validator、Repository、Statistics 和 ECharts 全局对象。
- Produces: 阶段一完整链路，UI 模块分别暴露 `bind`、`read`、`showErrors`、`render` 和 `renderCourseBar`。

- [ ] **Step 1: 写页面契约失败测试**

```js
// tests/app-contract.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const html = fs.readFileSync("index.html", "utf8");

test("打卡表单包含核心字段和提交入口", () => {
  for (const name of ["studentName", "date", "course", "durationHours", "content", "completionStatus", "reflection", "nextPlan"]) {
    assert.match(html, new RegExp(`name=["']${name}["']`));
  }
  assert.match(html, /id="checkin-form"/);
});

test("阶段一视图包含实时记录、指标和课程柱状图容器", () => {
  for (const id of ["records-body", "metric-total-hours", "metric-total-checkins", "chart-course-bar"]) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
});
```

- [ ] **Step 2: 运行测试并确认页面契约不满足**

Run: `node --test tests/app-contract.test.js`

Expected: FAIL，缺少表单或视图元素。

- [ ] **Step 3: 实现语义化表单、记录表格、指标卡和图表容器**

每个输入使用可见 `<label>`；错误位置使用 `data-error-for`；记录表格包括姓名、日期、课程、内容、时长、完成情况列；空表格显示单独空状态。首页放置累计时长和累计次数卡片，看板放置 `chart-course-bar`。

- [ ] **Step 4: 实现可独立渲染的 UI 模块**

```js
// UI 统一接口形状
FormView.bind({ onSubmit })
FormView.read()
FormView.showErrors(errors)
FormView.reset({ keepStudentName: true })
RecordsView.render(records)
DashboardView.render(summary)
ChartsView.renderCourseBar(courseDurations)
Notification.show(message, type)
```

所有动态文本通过 `textContent` 写入，禁止将用户输入拼接到 `innerHTML`。

- [ ] **Step 5: 在应用协调层实现统一刷新**

```js
function refreshAll() {
  const records = repository.list();
  const summary = Statistics.buildClassSummary(records, new Date());
  RecordsView.render(records);
  DashboardView.render(summary);
  ChartsView.renderCourseBar(summary.courseDurations);
}
```

首次存储为空时调用 `repository.seed(createDemoRecords())`；存储损坏时不写入，展示恢复提示。提交时执行读取、校验、重复确认、构建 ID 与时间、保存、刷新、通知和表单复位。

- [ ] **Step 6: 运行自动测试和阶段一手工验收**

Run: `npm test`

Expected: PASS，13 tests，0 failures。

Manual:

1. 打开 `index.html`。
2. 新增一条合法记录，确认列表、累计次数、总时长和柱状图同时变化。
3. 刷新页面，确认记录仍存在。
4. 输入空内容和非法时长，确认记录未保存且字段旁出现提示。

- [ ] **Step 7: 提交并推送阶段一**

```bash
git add index.html css/components.css js/app.js js/ui tests/app-contract.test.js
git commit -m "feat: complete phase one data flow"
git push -u origin HEAD
```

## 阶段二 标准功能闭环

### Task 6: 完成记录筛选、编辑和删除

**Files:**
- Modify: `index.html`
- Modify: `js/app.js`
- Modify: `js/ui/form-view.js`
- Modify: `js/ui/records-view.js`
- Create: `js/domain/record-filter.js`
- Create: `tests/record-filter.test.js`

**Interfaces:**
- Consumes: Repository、Validator 和完整记录集合。
- Produces: `filterRecords(records, criteria)`，RecordsView 发出 `onEdit(id)` 和 `onDelete(id)` 事件，FormView 支持新增与编辑模式。

- [ ] **Step 1: 写组合筛选失败测试**

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const { filterRecords } = require("../js/domain/record-filter.js");

test("姓名、课程、日期和关键词可以组合筛选", () => {
  const records = [
    { id: "1", studentName: "张三", date: "2026-09-22", course: "高等数学", content: "极限练习" },
    { id: "2", studentName: "李四", date: "2026-09-22", course: "大学英语", content: "阅读训练" }
  ];
  assert.deepEqual(filterRecords(records, { studentName: "张", course: "高等数学", date: "2026-09-22", keyword: "极限" }).map(x => x.id), ["1"]);
  assert.equal(filterRecords(records, { keyword: "不存在" }).length, 0);
});
```

- [ ] **Step 2: 运行测试并确认筛选模块缺失**

Run: `node --test tests/record-filter.test.js`

Expected: FAIL，错误包含 `Cannot find module`。

- [ ] **Step 3: 实现纯函数筛选及倒序排序**

姓名与关键词使用去空格后的不区分大小写包含匹配，课程和日期使用精确匹配；结果按 `date`、`createdAt` 降序，函数不修改输入数组。

- [ ] **Step 4: 增加筛选器、编辑状态和删除确认**

编辑时使用隐藏字段保存 `editingId`，提交成功后恢复新增模式。删除操作必须调用 `window.confirm("确定删除这条打卡记录吗？")`，确认后 Repository 删除并执行 `refreshAll()`。

- [ ] **Step 5: 运行测试和手工验证**

Run: `npm test`

Expected: PASS，14 tests，0 failures。

Manual: 组合筛选一条记录，编辑时长并确认统计更新，删除该记录并确认图表回退。

- [ ] **Step 6: 提交记录管理**

```bash
git add index.html js/app.js js/ui/form-view.js js/ui/records-view.js js/domain/record-filter.js tests/record-filter.test.js
git commit -m "feat: manage and filter checkin records"
```

### Task 7: 完成个人统计、排行和报告

**Files:**
- Create: `js/ui/personal-view.js`
- Create: `js/domain/report-generator.js`
- Create: `tests/report-generator.test.js`
- Modify: `index.html`
- Modify: `js/app.js`
- Modify: `js/domain/statistics.js`
- Modify: `js/ui/dashboard-view.js`
- Modify: `js/ui/charts-view.js`

**Interfaces:**
- Consumes: `buildStudentSummary`、`buildLearningStars` 和班级汇总。
- Produces: 个人视图、学习之星、坚持之星、`generateClassReport(summary)`、`generateStudentReport(summary)`。

- [ ] **Step 1: 写报告失败测试**

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const reports = require("../js/domain/report-generator.js");

test("班级空数据报告说明尚无记录", () => {
  assert.equal(reports.generateClassReport({ totalCheckinCount: 0 }), "当前还没有可分析的班级学习记录。完成首次打卡后即可生成报告。" );
});

test("班级报告引用真实统计值", () => {
  const text = reports.generateClassReport({
    totalCheckinCount: 12, weekParticipantCount: 5, weekDurationHours: 18.5,
    popularCourse: "程序设计基础", sevenDayDirection: "上升"
  });
  assert.match(text, /5 名同学/);
  assert.match(text, /18\.5 小时/);
  assert.match(text, /程序设计基础/);
});
```

- [ ] **Step 2: 运行测试并确认报告模块缺失**

Run: `node --test tests/report-generator.test.js`

Expected: FAIL，错误包含 `Cannot find module`。

- [ ] **Step 3: 实现确定性报告模板**

班级报告包含本周参与人数、本周时长、热门课程和趋势方向；个人报告包含累计次数、本周时长、连续天数和热门课程。空数据返回固定友好文案，不出现 `undefined` 或 `NaN`。

- [ ] **Step 4: 扩充个人统计和积极排行模型**

个人选择器从记录中的姓名去重并按中文排序。学习之星取本周时长前五，坚持之星取连续天数前三；界面只使用“学习之星”和“坚持之星”文案。

- [ ] **Step 5: 渲染个人统计和报告页面**

`PersonalView.render(summary)` 更新累计次数、累计时长、本周时长、连续天数、热门课程和个人七天趋势。报告页提供班级报告、当前学生报告和复制按钮；复制失败时选中文本并提示手动复制。

- [ ] **Step 6: 运行测试和手工验证**

Run: `npm test`

Expected: PASS，16 tests，0 failures。

Manual: 选择不同学生，确认指标和趋势变化；确认报告内容与看板数值一致；确认榜单没有负面措辞。

- [ ] **Step 7: 提交个人统计和报告**

```bash
git add index.html js/app.js js/domain/statistics.js js/domain/report-generator.js js/ui/personal-view.js js/ui/dashboard-view.js js/ui/charts-view.js tests/report-generator.test.js
git commit -m "feat: add personal insights and reports"
```

### Task 8: 完成班级大屏、三类图表和故障降级

**Files:**
- Modify: `index.html`
- Modify: `css/layout.css`
- Modify: `css/components.css`
- Modify: `js/ui/charts-view.js`
- Modify: `js/ui/dashboard-view.js`
- Create: `tests/chart-model.test.js`
- Create: `js/domain/chart-model.js`

**Interfaces:**
- Consumes: `ClassSummary` 和 ECharts 全局对象。
- Produces: `buildChartModel(summary)` 以及 `renderAll(model)`、`resizeAll()`、`disposeAll()`。

- [ ] **Step 1: 写图表模型和空数据失败测试**

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const { buildChartModel } = require("../js/domain/chart-model.js");

test("图表模型包含七天、课程时长和课程占比", () => {
  const model = buildChartModel({
    sevenDayTrend: [{ date: "2026-09-22", durationHours: 3 }],
    courseDurations: [{ course: "高等数学", durationHours: 3 }]
  });
  assert.deepEqual(model.trend.values, [3]);
  assert.deepEqual(model.courseBar.values, [3]);
  assert.deepEqual(model.coursePie, [{ name: "高等数学", value: 3 }]);
});

test("无课程数据时饼图返回空序列", () => {
  assert.deepEqual(buildChartModel({ sevenDayTrend: [], courseDurations: [] }).coursePie, []);
});
```

- [ ] **Step 2: 运行测试并确认图表模型缺失**

Run: `node --test tests/chart-model.test.js`

Expected: FAIL，错误包含 `Cannot find module`。

- [ ] **Step 3: 实现图表模型和三类 ECharts 配置**

折线图展示七天总时长，柱状图展示课程时长，饼图展示课程占比。tooltip 显示“小时”，图例和坐标字体满足投屏阅读。无数据时清空实例并显示“暂无可视化数据”。

- [ ] **Step 4: 实现 ECharts 缺失降级**

`renderAll` 首先检查 `typeof window.echarts`；缺失时在每个图表容器写入 `role="status"` 的“图表组件加载失败，指标和记录仍可正常查看”，不得抛出异常。切换到看板或窗口变化时调用 `resizeAll()`。

- [ ] **Step 5: 完成 16:9 大屏布局**

看板首行放置今日人数、本周时长、人均时长和热门课程；第二行使用 7/5 列展示趋势与排行；第三行并列展示柱状图和饼图。宽度低于 900px 时改为单列。

- [ ] **Step 6: 运行测试和阶段二手工验收**

Run: `npm test`

Expected: PASS，18 tests，0 failures。

Manual:

1. 验证筛选、编辑、删除、个人统计、两类排行榜和两类报告。
2. 验证折线、柱状和饼图均随记录变化。
3. 在开发者工具阻止 ECharts 请求，确认页面其余部分仍可用。
4. 清空记录，确认指标为 0、列表和图表显示空状态。

- [ ] **Step 7: 提交并推送阶段二**

```bash
git add index.html css js/domain/chart-model.js js/ui/charts-view.js js/ui/dashboard-view.js tests/chart-model.test.js
git commit -m "feat: complete phase two dashboard"
git push origin HEAD
```

## 阶段三 优秀展演成品

### Task 9: 完成演示数据、恢复流程和响应式无障碍体验

**Files:**
- Modify: `js/data/demo-records.js`
- Modify: `js/app.js`
- Modify: `index.html`
- Modify: `css/base.css`
- Modify: `css/layout.css`
- Modify: `css/components.css`
- Create: `tests/demo-records.test.js`
- Create: `tests/accessibility-contract.test.js`

**Interfaces:**
- Consumes: Repository、完整 UI 和固定课程配置。
- Produces: 30 名学生、7 天、5 门课程、至少 150 条记录；安全恢复和清空入口；移动端与键盘可用界面。

- [ ] **Step 1: 写演示数据规模失败测试**

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const { createDemoRecords } = require("../js/data/demo-records.js");

test("完整演示数据满足人数、日期、课程和记录规模", () => {
  const records = createDemoRecords("2026-09-22");
  assert.equal(new Set(records.map(x => x.studentName)).size, 30);
  assert.equal(new Set(records.map(x => x.date)).size, 7);
  assert.equal(new Set(records.map(x => x.course)).size, 5);
  assert.ok(records.length >= 150);
  assert.equal(new Set(records.map(x => x.id)).size, records.length);
});
```

- [ ] **Step 2: 写无障碍页面契约测试**

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const html = fs.readFileSync("index.html", "utf8");

test("页面具有语言、主标题、正文跳转和状态区域", () => {
  assert.match(html, /<html lang="zh-CN">/);
  assert.match(html, /<a[^>]+href="#main-content"[^>]*>跳到主要内容<\/a>/);
  assert.match(html, /<main id="main-content"/);
  assert.match(html, /aria-live="polite"/);
});
```

- [ ] **Step 3: 运行测试并确认演示数据规模不足**

Run: `node --test tests/demo-records.test.js tests/accessibility-contract.test.js`

Expected: FAIL，记录规模或页面契约未满足。

- [ ] **Step 4: 实现确定性的完整演示数据**

`createDemoRecords(anchorDate)` 以传入日期为第七天，用固定姓名和公式生成七天记录；五门课程均出现、部分学生连续七天、不同课程和状态有合理分布。相同 `anchorDate` 的输出必须深度相等。

- [ ] **Step 5: 实现恢复和清空的双重确认**

恢复按钮先显示“恢复演示数据会覆盖当前记录”，只有用户确认才调用 `repository.seed()`；清空按钮使用独立确认文案。取消操作不得调用 Repository，也不得刷新数据。

- [ ] **Step 6: 完成响应式和无障碍检查**

保证所有控件有可见标签或 `aria-label`，焦点样式清楚，表格窄屏可横向滚动，指标颜色同时配有文本，`prefers-reduced-motion` 下关闭非必要过渡。验证 1920×1080、1366×768、390×844 三种尺寸。

- [ ] **Step 7: 运行测试并提交展演体验**

Run: `npm test`

Expected: PASS，20 tests，0 failures。

```bash
git add index.html css js/data/demo-records.js js/app.js tests/demo-records.test.js tests/accessibility-contract.test.js
git commit -m "feat: polish presentation experience"
```

### Task 10: 完成交付文档和阶段三验收

**Files:**
- Create: `README.md`
- Create: `docs/manual-test-checklist.md`
- Create: `docs/presentation-outline.md`
- Create: `docs/demo-script.md`
- Modify: `package.json`

**Interfaces:**
- Consumes: 已完成的应用、规格和测试结果。
- Produces: 运行说明、统计口径、手工验收单、8 至 10 页 PPT 大纲和现场展演脚本。

- [ ] **Step 1: 写交付文件完整性失败测试**

```js
// tests/delivery.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

for (const file of ["README.md", "docs/manual-test-checklist.md", "docs/presentation-outline.md", "docs/demo-script.md"]) {
  test(`${file} 存在且不是空文件`, () => {
    assert.ok(fs.readFileSync(file, "utf8").trim().length > 200);
  });
}
```

- [ ] **Step 2: 运行测试并确认交付文件缺失**

Run: `node --test tests/delivery.test.js`

Expected: FAIL，错误包含 `ENOENT`。

- [ ] **Step 3: 编写 README 和统计口径说明**

README 必须说明项目用途、文件结构、直接打开方式、`python -m http.server 8000` 兼容启动方式、测试命令、演示数据恢复方式、localStorage 键、数据字段和所有统计定义。

- [ ] **Step 4: 编写手工验收单**

验收单按打卡、存储、记录管理、个人统计、班级看板、排行、报告、异常、响应式和展演路径分组；每一项包含操作、预期结果和勾选框。

- [ ] **Step 5: 编写 PPT 大纲和演示脚本**

PPT 大纲固定为九页：背景、需求、架构、数据模型、核心功能、统计方法、看板、测试、总结。展演脚本按背景、功能、现场打卡、记录、看板、报告、技术总结安排在约五分钟内，并另附 1 至 3 分钟录屏镜头表。

- [ ] **Step 6: 执行最终自动验证**

Run: `npm test`

Expected: PASS，24 tests，0 failures。

- [ ] **Step 7: 执行最终浏览器验收**

Manual:

1. 从干净存储启动，确认自动载入完整演示数据。
2. 按五分钟脚本新增一条记录并完成全流程。
3. 刷新后检查持久化。
4. 检查空输入、非法时长、未来日期、潜在重复和空数据。
5. 检查 1920×1080、1366×768、390×844 三种尺寸。
6. 阻止 ECharts CDN，确认降级提示和非图表功能。
7. 逐项填写 `docs/manual-test-checklist.md`。

- [ ] **Step 8: 提交并推送阶段三**

```bash
git add README.md package.json docs tests/delivery.test.js
git commit -m "docs: complete phase three delivery package"
git push origin HEAD
```

- [ ] **Step 9: 记录最终状态**

Run: `git status --short`

Expected: 无输出。

Run: `git log --oneline --decorate -12`

Expected: 包含三个阶段里程碑及其支撑提交，当前分支已跟踪远程分支。

