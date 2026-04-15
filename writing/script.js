import { saveLetter } from "../firebase.js";

// ======================
// ELEMENTS
// ======================
const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const status = document.getElementById("status");

const from = document.getElementById("from");
const to = document.getElementById("to");

const sizeInput = document.getElementById("size");
const sizeValue = document.getElementById("sizeValue");

// ======================
// MARKDOWN
// ======================
function parseMarkdown(html) {
  return html
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
    .replace(/\*(.*?)\*/g, "<i>$1</i>")
    .replace(/__(.*?)__/g, "<u>$1</u>")
    .replace(/\[(.*?)\]\((.*?)\)/g, (m, t, u) => {
      if (!u.startsWith("http")) u = "https://" + u;
      return `<a href="${u}" target="_blank">${t}</a>`;
    });
}

// ======================
// APPLY STYLE (CORE FIX)
// ======================
function applyStyleToSelection(style, value) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  if (range.collapsed) return;

  const span = document.createElement("span");
  span.style[style] = value;

  const fragment = range.extractContents();
  span.appendChild(fragment);
  range.insertNode(span);

  // reset selection
  selection.removeAllRanges();
  const newRange = document.createRange();
  newRange.selectNodeContents(span);
  selection.addRange(newRange);
}

// ======================
// FONT
// ======================
document.getElementById("font").onchange = (e) => {
  applyStyleToSelection("fontFamily", e.target.value);
  updatePreview();
};

// ======================
// SIZE (UNIFY SELECTION)
// ======================
sizeInput.oninput = (e) => {
  const size = e.target.value;
  sizeValue.innerText = size + "px";

  applyStyleToSelection("fontSize", size + "px");

  updatePreview();
};

// ======================
// COLOR (palette)
// ======================
window.setColor = function (color) {
  applyStyleToSelection("color", color);
  updatePreview();
};

// ======================
// PREVIEW
// ======================
function updatePreview() {
  preview.innerHTML = `
    <div><b>Từ:</b> ${from.value || "..."}</div>
    <div><b>Đến:</b> ${to.value || "..."}</div>
    <hr>
    <div class="letter-content">
      ${parseMarkdown(editor.innerHTML)}
    </div>
  `;
}

// realtime
editor.addEventListener("input", updatePreview);
from.addEventListener("input", updatePreview);
to.addEventListener("input", updatePreview);

// init
updatePreview();

// ======================
// EXPIRY
// ======================
function getExpiryDate(days) {
  if (!days || days === "0") return null;

  const d = new Date();
  d.setDate(d.getDate() + parseInt(days));
  return d;
}

// ======================
// POPUP
// ======================

function downloadQR() {
  const canvas = document.getElementById("qrcode");
  const link = document.createElement("a");

  link.download = "velune-qr.png";
  link.href = canvas.toDataURL();

  link.click();
}

function showPopup(link) {
  const popup = document.getElementById("popup");
  const input = document.getElementById("popupLink");
  const canvas = document.getElementById("qrcode");

  input.value = link;

  // tạo QR
  QRCode.toCanvas(canvas, link, {
  width: 200,
  color: {
    dark: "#333",
    light: "#ffffff"
  }
});

  popup.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

window.closePopup = function () {
  document.getElementById("popup").classList.add("hidden");
  document.body.style.overflow = "";
};

window.copyLink = function () {
  const input = document.getElementById("popupLink");
  input.select();
  document.execCommand("copy");
};

// ======================
// CREATE LETTER
// ======================
window.createLetter = async function () {
  if (!editor.innerText.trim()) {
    status.innerText = "Bạn chưa viết nội dung...";
    return;
  }

  status.innerText = "Đang tạo thư...";

  try {
    const id = await saveLetter({
      from: from.value || "Ẩn danh",
      to: to.value || "Không rõ",

      content: editor.innerHTML,

      expiryAt: getExpiryDate(document.getElementById("expiry").value),

      password: document.getElementById("password").value || null,
      theme: document.getElementById("theme").value,

      urlYoutube: document.getElementById("youtube").value || null,
      youtubeStart:
        parseInt(document.getElementById("ytStart").value) || 0,
      youtubeEnd:
        parseInt(document.getElementById("ytEnd").value) || null
    });

    const link =
      window.location.origin + "/reading/reading.html?id=" + id;

    showPopup(link);

    status.innerText = "Đã tạo thư ✨";
  } catch (e) {
    status.innerText = "Lỗi: " + e.message;
    console.error(e);
  }
};

// ======================
// THEME
// ======================
const themeSelect = document.getElementById("theme");

themeSelect.addEventListener("change", () => {
  applyTheme(themeSelect.value);
});

function applyTheme(theme) {
  const body = document.body;

  body.className = "theme-" + theme + " theme-transition";

  setTimeout(() => {
    body.classList.remove("theme-transition");
  }, 400);
}

// load theme
applyTheme(themeSelect.value);

// ======================
// NAV
// ======================
window.goHelp = function () {
  window.location.href = "../helping/helping.html";
};