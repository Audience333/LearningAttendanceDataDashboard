const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

test("页面包含六个核心视图和主导航", () => {
  const html = fs.readFileSync("index.html", "utf8");
  for (const id of ["home", "checkin", "records", "personal", "dashboard", "reports"]) {
    assert.match(html, new RegExp(`id=["']view-${id}["']`));
    assert.match(html, new RegExp(`data-view=["']${id}["']`));
  }
});

test("脚本使用 defer 且按依赖顺序加载", () => {
  const html = fs.readFileSync("index.html", "utf8");
  assert.match(html, /<script defer src="js\/config\.js"><\/script>/);
  assert.ok(html.indexOf("js/config.js") < html.indexOf("js/app.js"));
});
