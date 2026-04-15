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

function setFontSize(size) {
  applyStyle("fontSize", size + "px");
}

/* ===== FONT ===== */
function setFontFamily(font) {
  applyStyle("fontFamily", font);
}

/* ===== CLEAN DOM (QUAN TRỌNG NHẤT) ===== */
function cleanDOM(root) {
  mergeSpans(root);
  removeEmptySpans(root);
}

/* ===== MERGE SPANS ===== */
function mergeSpans(root) {
  const spans = root.querySelectorAll("span");

  spans.forEach(span => {
    let next = span.nextSibling;

    if (
      next &&
      next.nodeType === 1 &&
      next.nodeName === "SPAN" &&
      span.style.cssText === next.style.cssText
    ) {
      span.innerHTML += next.innerHTML;
      next.remove();
    }
  });
}

/* ===== REMOVE EMPTY ===== */
function removeEmptySpans(root) {
  const spans = root.querySelectorAll("span");

  spans.forEach(span => {
    if (!span.textContent.trim()) {
      span.remove();
    }
  });
}

document.getElementById("size").addEventListener("input", e => {
  document.getElementById("sizeValue").innerText =
    e.target.value + "px";

  setFontSize(e.target.value);
});

document.getElementById("font").addEventListener("change", e => {
  setFontFamily(e.target.value);
});

editor.addEventListener("input", () => {
  cleanDOM(editor);
  updatePreview();
});

// ======================
// COLOR (palette)
// ======================
/* ===== COLOR ===== */
window.setColor = function (color) {
  applyStyle("color", color);
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

/* ===== FONT SIZE LOGIC (FIXED) ===== */
/* ===== APPLY STYLE (GENERIC) ===== */
function applyStyle(styleKey, value) {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;

  const range = sel.getRangeAt(0);
  if (range.collapsed) return;

  const walker = document.createTreeWalker(
    range.commonAncestorContainer,
    NodeFilter.SHOW_TEXT,
    null
  );

  let nodes = [];
  let node;

  while ((node = walker.nextNode())) {
    if (!range.intersectsNode(node)) continue;
    if (!node.nodeValue.trim()) continue;
    nodes.push(node);
  }

  nodes.forEach(textNode => {
    let parent = textNode.parentNode;

    // nếu đã có span → reuse
    if (parent.nodeName === "SPAN") {
      parent.style[styleKey] = value;
      return;
    }

    // nếu chưa có → wrap
    const span = document.createElement("span");
    span.style[styleKey] = value;

    parent.replaceChild(span, textNode);
    span.appendChild(textNode);
  });

  cleanDOM(editor);
  updatePreview();
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
  document.body.style.overflow = "auto";
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

setInterval(() => {
  const star = document.querySelector(".shooting-star");
  star.style.top = Math.random() * 50 + "%";
}, 10000);