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

test("页面提供可访问的数据恢复与清空入口", () => {
  assert.match(html, /id="restore-demo-data"/);
  assert.match(html, /id="clear-all-data"/);
  assert.match(html, /aria-label="主要导航"/);
});
