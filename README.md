# 学习打卡数据看板

面向班级学习打卡、统计与展示的纯前端数据看板。项目使用原生 HTML、CSS 和 JavaScript，数据保存在浏览器 `localStorage` 中，无需后端服务或数据库。

## 当前目录

```text
C:\Users\Audience\.codex\worktrees\learning-dashboard\PerfermanceWorks
```

## 快速启动

Windows 用户直接双击：

```text
start-dashboard.bat
```

脚本会启动本地静态服务并打开默认浏览器。关闭启动窗口即可停止服务。也可以在 PowerShell 中运行：

```powershell
.\start-dashboard.ps1
```

默认地址为 `http://127.0.0.1:8765/`，可通过 `-Port` 指定端口：

```powershell
.\start-dashboard.ps1 -Port 8787
```

## 已实现功能

- 学习打卡新增、编辑、删除与组合筛选
- 本地数据持久化、恢复演示数据与清空记录
- 班级统计、个人统计、学习之星与坚持之星
- 七天趋势折线图、课程时长柱状图和课程占比饼图
- 班级/个人学习报告与复制操作
- ECharts 缺失时的可用性降级提示
- 响应式布局、键盘焦点、跳过导航和减少动画支持
- 30 名学生、7 天、5 门课程、210 条确定性演示记录

## 目录结构

```text
index.html                 页面入口
css/                       设计令牌、基础样式、布局与组件样式
js/config.js               应用配置
js/data/                   确定性演示数据
js/domain/                校验、筛选、统计、报告和图表模型
js/storage/               localStorage 记录仓库
js/ui/                    表单、列表、看板、图表和个人视图
tests/                    Node.js 自动化测试
start-dashboard.ps1        PowerShell 启动脚本
start-dashboard.bat        Windows 双击启动入口
docs/                      项目任务书、设计说明和实施计划
```

## 测试

需要 Node.js 运行环境。在项目根目录执行：

```powershell
npm test
```

当前测试覆盖数据校验、持久化、筛选、统计、报告、图表模型、演示数据规模和无障碍页面契约。

## 远程仓库

[Audience333/LearningAttendanceDataDashboard](https://github.com/Audience333/LearningAttendanceDataDashboard)
