// js/panel_runtime.js
import { FAITH_CARDS } from "./main_faith.js";

const $ = (sel) => document.querySelector(sel);

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderCards() {
  const grid = $("#cards-grid");
  if (!grid) return;

  grid.innerHTML = FAITH_CARDS.map((c) => {
    return `
      <button class="card-link" type="button" data-card-id="${escapeHtml(c.id)}" aria-label="${escapeHtml(c.title)}">
        <article class="card" style="--img: url('${escapeHtml(c.image)}');">
          <div class="card-media"></div>
          <div class="card-body">
            <h3>${escapeHtml(c.title)}</h3>
            <p>${escapeHtml(c.description)}</p>
          </div>
        </article>
      </button>
    `;
  }).join("");

  grid.addEventListener("click", async (e) => {
    const btn = e.target.closest(".card-link");
    if (!btn) return;

    const id = btn.getAttribute("data-card-id");
    const card = FAITH_CARDS.find((x) => x.id === id);
    if (!card) return;

    await openTab(card);
  });
}

let activePanels = [];
let activeIndex = 0;
let activeTabTitle = "";

async function openTab(card) {
  // dynamic import tab module
  const mod = await import(`../${card.module}`);
  const { TAB_TITLE, PANELS } = mod;

  activePanels = Array.isArray(PANELS) ? PANELS : [];
  activeIndex = 0;
  activeTabTitle = TAB_TITLE || card.title;

  openModal();
  renderPanel();
}

function openModal() {
  const overlay = $("#panel-overlay");
  overlay?.classList.add("open");
  document.body.classList.add("no-scroll");
}

function closeModal() {
  const overlay = $("#panel-overlay");
  overlay?.classList.remove("open");
  document.body.classList.remove("no-scroll");
}

function clampIndex(i) {
  if (!activePanels.length) return 0;
  if (i < 0) return activePanels.length - 1;
  if (i >= activePanels.length) return 0;
  return i;
}

function renderPanel() {
  const titleEl = $("#panel-tab-title");
  const countEl = $("#panel-count");
  const imgEl = $("#panel-img");
  const hEl = $("#panel-h");
  const pEl = $("#panel-p");

  if (!activePanels.length) {
    titleEl.textContent = activeTabTitle;
    countEl.textContent = "0 / 0";
    imgEl.src = "";
    imgEl.alt = "";
    hEl.textContent = "No panels found";
    pEl.textContent = "Your tab file exported an empty PANELS array.";
    return;
  }

  activeIndex = clampIndex(activeIndex);
  const panel = activePanels[activeIndex];

  titleEl.textContent = activeTabTitle;
  countEl.textContent = `${activeIndex + 1} / ${activePanels.length}`;

  imgEl.src = panel.figure || "";
  imgEl.alt = panel.header || activeTabTitle;

  hEl.textContent = panel.header || "";
  pEl.textContent = panel.text || "";
}

function hookModalEvents() {
  const overlay = $("#panel-overlay");
  const closeBtn = $("#panel-close");
  const prevBtn = $("#panel-prev");
  const nextBtn = $("#panel-next");

  overlay?.addEventListener("click", (e) => {
    // click outside closes
    if (e.target === overlay) closeModal();
  });

  closeBtn?.addEventListener("click", closeModal);

  prevBtn?.addEventListener("click", () => {
    activeIndex -= 1;
    renderPanel();
  });

  nextBtn?.addEventListener("click", () => {
    activeIndex += 1;
    renderPanel();
  });

  document.addEventListener("keydown", (e) => {
    const isOpen = $("#panel-overlay")?.classList.contains("open");
    if (!isOpen) return;

    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowLeft") {
      activeIndex -= 1;
      renderPanel();
    }
    if (e.key === "ArrowRight") {
      activeIndex += 1;
      renderPanel();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderCards();
  hookModalEvents();
});
