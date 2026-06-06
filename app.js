const navItems = document.querySelectorAll(".nav-item");
const views = document.querySelectorAll(".view");
const fileInput = document.querySelector("#fileInput");
const fileList = document.querySelector("#fileList");
const engineCards = document.querySelectorAll(".engine-card");
const segmentedButtons = document.querySelectorAll(".segmented button");
const runBtn = document.querySelector("#runBtn");
const runState = document.querySelector("#runState");
const timeline = document.querySelectorAll("#timeline li");
const resultOutput = document.querySelector("#resultOutput");
const taskInput = document.querySelector("#taskInput");
const assetSelect = document.querySelector("#assetSelect");
const deliverableSelect = document.querySelector("#deliverableSelect");
const saveBtn = document.querySelector("#saveBtn");
const savedList = document.querySelector("#savedList");
const templateBtn = document.querySelector("#templateBtn");

const templates = [
  "分析这批设备报警日志，找出高频异常、可能原因，并生成一份给设备工程师看的诊断报告。",
  "读取上传的点检表，识别连续三天异常项，输出整改优先级和复检建议。",
  "基于 CSV 产线节拍数据，找出瓶颈工位并生成一段 Python 可视化脚本。",
  "审查设备说明书和维修记录，整理常见故障知识库条目。"
];

let templateIndex = 0;
let lastResultTitle = "报警日志高频异常诊断";

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    navItems.forEach((nav) => nav.classList.remove("active"));
    views.forEach((view) => view.classList.remove("active"));
    item.classList.add("active");
    document.querySelector(`#${item.dataset.view}`).classList.add("active");
  });
});

segmentedButtons.forEach((button) => {
  button.addEventListener("click", () => {
    segmentedButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
  });
});

engineCards.forEach((card) => {
  card.addEventListener("click", () => {
    card.classList.toggle("selected");
  });
});

fileInput.addEventListener("change", () => {
  const files = Array.from(fileInput.files);
  if (!files.length) {
    fileList.innerHTML = "";
    return;
  }

  fileList.innerHTML = files
    .map((file) => {
      const size = file.size > 1024 * 1024
        ? `${(file.size / 1024 / 1024).toFixed(1)} MB`
        : `${Math.max(1, Math.round(file.size / 1024))} KB`;
      return `<span><b>${escapeHtml(file.name)}</b><em>${size}</em></span>`;
    })
    .join("");
});

templateBtn.addEventListener("click", () => {
  templateIndex = (templateIndex + 1) % templates.length;
  taskInput.value = templates[templateIndex];
});

runBtn.addEventListener("click", async () => {
  const selectedEngines = Array.from(document.querySelectorAll(".engine-card.selected"))
    .map((card) => card.dataset.engine);

  if (!selectedEngines.length) {
    resultOutput.innerHTML = "<p>请至少选择一个智能能力模块。</p>";
    return;
  }

  runBtn.disabled = true;
  runState.textContent = "执行中";
  runState.className = "run-state running";
  timeline.forEach((item) => {
    item.className = "pending";
  });
  resultOutput.innerHTML = "<p>工业 AI 正在读取任务上下文并规划交付物。</p>";

  for (let index = 0; index < timeline.length; index += 1) {
    timeline[index].className = "active";
    await wait(650);
    timeline[index].className = "done";
  }

  const task = taskInput.value.trim();
  const asset = assetSelect.value;
  const deliverable = deliverableSelect.value;
  const fileCount = fileInput.files.length;
  lastResultTitle = inferTitle(task, deliverable);

  resultOutput.innerHTML = `
    <h3>${escapeHtml(lastResultTitle)}</h3>
    <p>${escapeHtml(asset)} 的任务已完成模拟编排，交付物类型为 ${escapeHtml(deliverable)}。</p>
    <ul>
      <li>工程诊断引擎：整理问题假设、报告结构和工程师可读的诊断逻辑。</li>
      <li>数据处理引擎：准备数据处理步骤、脚本骨架和可导出的结果清单。</li>
      <li>文件上下文：已接收 ${fileCount} 个文件，后续可接入真实沙箱执行。</li>
    </ul>
  `;

  runState.textContent = "已完成";
  runState.className = "run-state done";
  runBtn.disabled = false;
});

saveBtn.addEventListener("click", () => {
  const item = document.createElement("article");
  item.innerHTML = `<strong>${escapeHtml(lastResultTitle)}</strong><span>${escapeHtml(deliverableSelect.value)} · 刚刚保存</span>`;
  savedList.prepend(item);
});

function inferTitle(task, deliverable) {
  if (task.includes("点检")) return "点检异常整改建议";
  if (task.includes("节拍") || task.includes("瓶颈")) return "产线节拍瓶颈分析";
  if (task.includes("知识库")) return "设备故障知识库条目";
  if (deliverable.includes("脚本")) return "工业数据处理脚本";
  return "报警日志高频异常诊断";
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
