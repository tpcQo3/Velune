import { saveLetter } from "./firebase.js";

/* ===== ELEMENTS ===== */
const editor = document.getElementById("editor");
const preview = document.getElementById("preview");

const sizeInput = document.getElementById("size");
const sizeValue = document.getElementById("sizeValue");

const fontSelect = document.getElementById("font");

/* ===== PREVIEW ===== */
function updatePreview() {
  preview.innerHTML = editor.innerHTML;
}

/* ===== FONT SIZE LOGIC (FIXED) ===== */
function applyFontSize(size) {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;

  const range = sel.getRangeAt(0);

  // 👉 nếu có selection
  if (!range.collapsed) {
    const span = document.createElement("span");
    span.style.fontSize = size + "px";

    span.appendChild(range.extractContents());
    range.insertNode(span);

    // giữ selection
    sel.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    sel.addRange(newRange);
  } else {
    // 👉 nếu chỉ đặt con trỏ → tạo span rỗng để gõ tiếp
    const span = document.createElement("span");
    span.style.fontSize = size + "px";
    span.appendChild(document.createTextNode("\u200B"));

    range.insertNode(span);

    // đặt lại cursor
    const newRange = document.createRange();
    newRange.setStart(span.firstChild, 1);
    newRange.collapse(true);

    sel.removeAllRanges();
    sel.addRange(newRange);
  }

  updatePreview();
}

/* ===== SIZE INPUT ===== */
sizeInput.addEventListener("input", () => {
  sizeValue.innerText = sizeInput.value + "px";
  applyFontSize(sizeInput.value);
});

/* ===== FONT FAMILY ===== */
fontSelect.addEventListener("change", () => {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;

  const range = sel.getRangeAt(0);

  if (!range.collapsed) {
    const span = document.createElement("span");
    span.style.fontFamily = fontSelect.value;

    span.appendChild(range.extractContents());
    range.insertNode(span);

    sel.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    sel.addRange(newRange);
  }

  updatePreview();
});

/* ===== COLOR ===== */
window.setColor = function (color) {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;

  const range = sel.getRangeAt(0);

  if (!range.collapsed) {
    const span = document.createElement("span");
    span.style.color = color;

    span.appendChild(range.extractContents());
    range.insertNode(span);

    sel.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    sel.addRange(newRange);
  }

  updatePreview();
};

/* ===== AUTO PREVIEW ===== */
editor.addEventListener("input", updatePreview);

/* ===== POPUP ===== */
function showPopup(link) {
  const popup = document.getElementById("popup");
  const input = document.getElementById("popupLink");

  input.value = link;
  popup.classList.remove("hidden");

  document.body.style.overflow = "hidden";
}

window.closePopup = function () {
  document.getElementById("popup").classList.add("hidden");
  document.body.style.overflow = "auto";
};

window.copyLink = function () {
  const input = document.getElementById("popupLink");
  input.select();
  document.execCommand("copy");
};

/* ===== RANDOM ID (6 ký tự) ===== */
function generateId(length = 6) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }

  return result;
}

/* ===== CREATE LETTER ===== */
window.createLetter = async function () {
  const content = editor.innerHTML;

  if (!content.trim()) {
    alert("Bạn chưa viết gì cả!");
    return;
  }

  try {
    const id = await saveLetter({
      text: content,
      createdAt: new Date(),
    });

    const link = `${window.location.origin}/read.html?id=${id}`;

    showPopup(link);
  } catch (err) {
    console.error(err);
    alert("Lỗi khi lưu thư!");
  }
};

/* ===== INIT ===== */
updatePreview();