const assets = [
  { id: "A12", line: "注塑一线", name: "伺服压机 A12", status: "正常", health: 92, owner: "设备工程组", next: "2026-06-09", risk: "低" },
  { id: "V03", line: "总装三线", name: "视觉检测站 V03", status: "告警", health: 68, owner: "质量工程组", next: "2026-06-07", risk: "高" },
  { id: "K7", line: "能源站", name: "空压机 K7", status: "关注", health: 74, owner: "动力运维组", next: "2026-06-08", risk: "中" },
  { id: "R21", line: "焊装二线", name: "机器人 R21", status: "正常", health: 88, owner: "自动化组", next: "2026-06-12", risk: "低" },
  { id: "M05", line: "机加工线", name: "CNC 主轴 M05", status: "告警", health: 63, owner: "工艺工程组", next: "2026-06-07", risk: "高" }
];

const knowledgeItems = [
  { tag: "报警诊断", title: "伺服压机过载频发", device: "A12", summary: "常见原因包括润滑不足、模具阻力升高、伺服参数漂移。优先检查导轨温升和最近换模记录。" },
  { tag: "质量分析", title: "视觉检测误判率升高", device: "V03", summary: "重点排查光源衰减、相机焦距偏移、产品表面反光和训练样本漂移。" },
  { tag: "能耗优化", title: "空压机单位能耗异常", device: "K7", summary: "检查泄漏、加载卸载频次、压力设定和夜间空载运行曲线。" },
  { tag: "预测维护", title: "CNC 主轴振动上升", device: "M05", summary: "结合振动频谱、轴承温度和刀具寿命判断是否需要停机复检。" }
];

const alarmEvents = [
  { level: "高", source: "视觉检测站 V03", text: "误判率连续 3 个班次超过阈值", time: "08:42" },
  { level: "高", source: "CNC 主轴 M05", text: "振动 RMS 高于基线 31%", time: "09:16" },
  { level: "中", source: "空压机 K7", text: "单位产气能耗偏高", time: "09:38" },
  { level: "低", source: "伺服压机 A12", text: "润滑点检即将到期", time: "10:05" }
];

const taskTemplates = [
  "分析注塑一线 A12 最近 24 小时报警日志，识别高频异常、可能根因和现场处置建议。",
  "读取总装三线 V03 的视觉检测误判数据，判断误判率升高的主要原因并输出复检清单。",
  "根据能源站 K7 空压机运行曲线，分析单位能耗偏高原因并生成节能调整方案。",
  "审查 CNC 主轴 M05 的振动和温度记录，生成预测性维护报告。"
];

const defaultResults = [
  { title: "视觉检测误判率复盘", type: "诊断报告 + 图表", asset: "总装三线 · 视觉检测站 V03", time: "今天 09:10", risk: "高" },
  { title: "空压机能耗趋势分析", type: "工程整改方案", asset: "能源站 · 空压机 K7", time: "昨天 17:42", risk: "中" }
];

const state = {
  templateIndex: 0,
  lastResult: null,
  savedResults: [...defaultResults],
  signalTick: 0
};

const navItems = document.querySelectorAll(".nav-item");
const views = document.querySelectorAll(".view");
const queueList = document.querySelector("#queueList");
const assetSelect = document.querySelector("#assetSelect");
const assetSearch = document.querySelector("#assetSearch");
const assetTable = document.querySelector("#assetTable");
const fileInput = document.querySelector("#fileInput");
const fileList = document.querySelector("#fileList");
const templateBtn = document.querySelector("#templateBtn");
const taskInput = document.querySelector("#taskInput");
const deliverableSelect = document.querySelector("#deliverableSelect");
const engineCards = document.querySelectorAll(".engine-card");
const segmentedButtons = document.querySelectorAll(".segmented button");
const runBtn = document.querySelector("#runBtn");
const runState = document.querySelector("#runState");
const timeline = document.querySelectorAll("#timeline li");
const resultOutput = document.querySelector("#resultOutput");
const saveBtn = document.querySelector("#saveBtn");
const savedList = document.querySelector("#savedList");
const clearResultsBtn = document.querySelector("#clearResultsBtn");
const signalGrid = document.querySelector("#signalGrid");
const alarmList = document.querySelector("#alarmList");
const knowledgeSearch = document.querySelector("#knowledgeSearch");
const knowledgeGrid = document.querySelector("#knowledgeGrid");
const clockText = document.querySelector("#clockText");
const refreshText = document.querySelector("#refreshText");
const taskMetric = document.querySelector("#taskMetric");
const alarmMetric = document.querySelector("#alarmMetric");
const onlineMetric = document.querySelector("#onlineMetric");

init();

function init() {
  renderAssetOptions();
  renderQueue();
  renderAssets();
  renderSignals();
  renderAlarms();
  renderKnowledge();
  renderResults();
  bindEvents();
  updateClock();
  window.setInterval(updateClock, 1000);
  window.setInterval(() => {
    state.signalTick += 1;
    renderSignals();
  }, 3500);
}

function bindEvents() {
  navItems.forEach((item) => {
    item.addEventListener("click", () => showView(item.dataset.view));
  });

  document.querySelectorAll("[data-jump]").forEach((button) => {
    button.addEventListener("click", () => showView(button.dataset.jump));
  });

  segmentedButtons.forEach((button) => {
    button.addEventListener("click", () => {
      segmentedButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
    });
  });

  engineCards.forEach((card) => {
    card.addEventListener("click", () => card.classList.toggle("selected"));
  });

  fileInput.addEventListener("change", renderFileList);
  templateBtn.addEventListener("click", applyTemplate);
  runBtn.addEventListener("click", runIndustrialTask);
  saveBtn.addEventListener("click", saveCurrentResult);
  clearResultsBtn.addEventListener("click", () => {
    state.savedResults = [...defaultResults];
    renderResults();
  });

  assetSearch.addEventListener("input", renderAssets);
  knowledgeSearch.addEventListener("input", renderKnowledge);
}

function showView(viewId) {
  navItems.forEach((nav) => nav.classList.toggle("active", nav.dataset.view === viewId));
  views.forEach((view) => view.classList.toggle("active", view.id === viewId));
}

function renderAssetOptions() {
  assetSelect.innerHTML = assets
    .map((asset) => `<option value="${asset.id}">${asset.line} · ${asset.name}</option>`)
    .join("");
}

function renderQueue() {
  queueList.innerHTML = [
    ["高", "V03 误判率异常诊断", "等待质量工程组确认"],
    ["中", "K7 能耗曲线分析", "AI 正在整理节能建议"],
    ["低", "A12 点检报告生成", "可直接归档"]
  ]
    .map(([priority, title, note]) => `
      <article class="queue-item ${priority === "高" ? "urgent" : ""}">
        <span>${priority}</span>
        <div><strong>${title}</strong><small>${note}</small></div>
      </article>
    `)
    .join("");
}

function renderAssets() {
  const keyword = assetSearch.value.trim().toLowerCase();
  const rows = assets.filter((asset) => {
    const text = `${asset.id} ${asset.line} ${asset.name} ${asset.status} ${asset.owner} ${asset.risk}`.toLowerCase();
    return text.includes(keyword);
  });

  assetTable.innerHTML = `
    <div class="table-row table-head">
      <span>设备</span><span>状态</span><span>健康度</span><span>责任组</span><span>下次维护</span>
    </div>
    ${rows.map((asset) => `
      <div class="table-row">
        <span><strong>${asset.line}</strong><small>${asset.name}</small></span>
        <span><mark class="${statusClass(asset.status)}">${asset.status}</mark></span>
        <span><meter min="0" max="100" value="${asset.health}"></meter><small>${asset.health}% · ${asset.risk}风险</small></span>
        <span>${asset.owner}</span>
        <span>${asset.next}</span>
      </div>
    `).join("")}
  `;
}

function renderSignals() {
  const signals = [
    ["设备综合健康度", `${88 - (state.signalTick % 3)}%`, "稳定"],
    ["当前节拍", `${47 + (state.signalTick % 4)} 秒/件`, "接近目标"],
    ["告警闭环率", `${83 + (state.signalTick % 5)}%`, "提升中"],
    ["单位能耗", `${0.72 + (state.signalTick % 3) * 0.01} kWh/件`, "关注"]
  ];

  signalGrid.innerHTML = signals
    .map(([label, value, note]) => `
      <article class="signal-card">
        <span>${label}</span>
        <strong>${value}</strong>
        <small>${note}</small>
      </article>
    `)
    .join("");

  refreshText.textContent = `刚刚刷新 · ${new Date().toLocaleTimeString("zh-CN", { hour12: false })}`;
}

function renderAlarms() {
  alarmList.innerHTML = alarmEvents
    .map((event) => `
      <article class="alarm-item level-${event.level}">
        <span>${event.level}</span>
        <div><strong>${event.source}</strong><small>${event.text}</small></div>
        <time>${event.time}</time>
      </article>
    `)
    .join("");
}

function renderKnowledge() {
  const keyword = knowledgeSearch.value.trim().toLowerCase();
  const rows = knowledgeItems.filter((item) => {
    const text = `${item.tag} ${item.title} ${item.device} ${item.summary}`.toLowerCase();
    return text.includes(keyword);
  });

  knowledgeGrid.innerHTML = rows
    .map((item) => `
      <article class="knowledge-card">
        <span>${item.tag} · ${item.device}</span>
        <strong>${item.title}</strong>
        <p>${item.summary}</p>
        <button class="ghost-btn" type="button" data-template="${item.device}">生成相关任务</button>
      </article>
    `)
    .join("");

  document.querySelectorAll("[data-template]").forEach((button) => {
    button.addEventListener("click", () => {
      const asset = assets.find((item) => item.id === button.dataset.template);
      assetSelect.value = asset.id;
      taskInput.value = `基于知识库条目和最新运行数据，分析${asset.line} ${asset.name} 的异常风险并生成现场处置建议。`;
      showView("workspace");
    });
  });
}

function renderResults() {
  savedList.innerHTML = state.savedResults
    .map((result) => `
      <article>
        <div>
          <strong>${result.title}</strong>
          <span>${result.type} · ${result.asset} · ${result.time}</span>
        </div>
        <mark class="${riskClass(result.risk)}">${result.risk}风险</mark>
      </article>
    `)
    .join("");
}

function renderFileList() {
  const files = Array.from(fileInput.files);
  fileList.innerHTML = files
    .map((file) => {
      const size = file.size > 1024 * 1024
        ? `${(file.size / 1024 / 1024).toFixed(1)} MB`
        : `${Math.max(1, Math.round(file.size / 1024))} KB`;
      return `<span><b>${escapeHtml(file.name)}</b><em>${size}</em></span>`;
    })
    .join("");
}

function applyTemplate() {
  state.templateIndex = (state.templateIndex + 1) % taskTemplates.length;
  taskInput.value = taskTemplates[state.templateIndex];
  const assetId = ["A12", "V03", "K7", "M05"][state.templateIndex];
  assetSelect.value = assetId;
}

async function runIndustrialTask() {
  const selectedEngines = Array.from(document.querySelectorAll(".engine-card.selected"))
    .map((card) => card.dataset.engine);

  if (!selectedEngines.length) {
    resultOutput.innerHTML = "<p>请至少选择一个执行能力。</p>";
    return;
  }

  runBtn.disabled = true;
  runState.textContent = "执行中";
  runState.className = "run-state running";
  resultOutput.innerHTML = "<p>工业 AI 正在读取任务、设备和文件上下文。</p>";
  timeline.forEach((item) => { item.className = "pending"; });

  for (let index = 0; index < timeline.length; index += 1) {
    timeline[index].className = "active";
    await wait(520);
    timeline[index].className = "done";
  }

  const asset = assets.find((item) => item.id === assetSelect.value);
  const deliverable = deliverableSelect.value;
  const fileCount = fileInput.files.length;
  const risk = asset.risk === "低" && selectedEngines.includes("质量分析") ? "中" : asset.risk;
  const title = inferTitle(taskInput.value, asset);

  state.lastResult = {
    title,
    type: deliverable,
    asset: `${asset.line} · ${asset.name}`,
    time: "刚刚",
    risk
  };

  resultOutput.innerHTML = `
    <h3>${title}</h3>
    <p>${asset.line} · ${asset.name} 的任务已完成。平台使用 ${selectedEngines.join("、")} 生成了 ${deliverable}。</p>
    <ul>
      <li>风险判断：当前为 ${risk}风险，健康度 ${asset.health}%，建议按 ${asset.next} 前完成复检。</li>
      <li>根因假设：结合报警流、维护计划和知识库，优先排查工艺参数漂移、传感器状态和最近换型记录。</li>
      <li>文件上下文：已接收 ${fileCount} 个文件，可继续接入真实数据沙箱和审批流。</li>
    </ul>
  `;

  runState.textContent = "已完成";
  runState.className = "run-state done";
  runBtn.disabled = false;
  taskMetric.textContent = String(Number(taskMetric.textContent) + 1);
}

function saveCurrentResult() {
  if (!state.lastResult) {
    resultOutput.innerHTML = "<p>请先运行一个任务，再保存结果。</p>";
    return;
  }
  state.savedResults.unshift(state.lastResult);
  state.lastResult = null;
  renderResults();
  showView("results");
}

function inferTitle(task, asset) {
  if (task.includes("能耗")) return `${asset.id} 能耗异常分析`;
  if (task.includes("误判")) return `${asset.id} 视觉误判诊断`;
  if (task.includes("振动")) return `${asset.id} 预测维护报告`;
  if (task.includes("报警")) return `${asset.id} 高频报警根因诊断`;
  return `${asset.id} 工业 AI 分析报告`;
}

function updateClock() {
  const now = new Date();
  clockText.textContent = now.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
  alarmMetric.textContent = String(alarmEvents.length + 3);
  onlineMetric.textContent = String(assets.length * 8 + 2);
}

function statusClass(status) {
  if (status === "告警") return "tag-danger";
  if (status === "关注") return "tag-warning";
  return "tag-ok";
}

function riskClass(risk) {
  if (risk === "高") return "tag-danger";
  if (risk === "中") return "tag-warning";
  return "tag-ok";
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
