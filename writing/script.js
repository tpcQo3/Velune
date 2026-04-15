import { saveLetter } from "../firebase.js";

/* ======================
   ELEMENTS
====================== */
const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const status = document.getElementById("status");

const from = document.getElementById("from");
const to = document.getElementById("to");

const sizeInput = document.getElementById("size");
const sizeValue = document.getElementById("sizeValue");

/* ======================
   MARKDOWN
====================== */
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

/* ======================
   CORE STYLE ENGINE (FIX REAL)
====================== */
function applyStyle(style, value) {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;

  const range = sel.getRangeAt(0);
  if (range.collapsed) return;

  const walker = document.createTreeWalker(
    range.commonAncestorContainer,
    NodeFilter.SHOW_TEXT
  );

  let nodes = [];
  let node;

  while ((node = walker.nextNode())) {
    if (!range.intersectsNode(node)) continue;
    if (!node.nodeValue.trim()) continue;
    nodes.push(node);
  }

  nodes.forEach(textNode => {
    const parent = textNode.parentNode;

    // nếu đã có span → update
    if (parent.nodeName === "SPAN") {
      parent.style[style] = value;
      return;
    }

    // split text node nếu cần (QUAN TRỌNG)
    const text = textNode.nodeValue;
    const start = range.startOffset;
    const end = range.endOffset;

    if (textNode === range.startContainer && textNode === range.endContainer) {
      const before = text.slice(0, start);
      const middle = text.slice(start, end);
      const after = text.slice(end);

      const span = document.createElement("span");
      span.style[style] = value;
      span.textContent = middle;

      const parent = textNode.parentNode;

      if (before) parent.insertBefore(document.createTextNode(before), textNode);
      parent.insertBefore(span, textNode);
      if (after) parent.insertBefore(document.createTextNode(after), textNode);

      textNode.remove();
    } else {
      // node bình thường
      const span = document.createElement("span");
      span.style[style] = value;

      parent.replaceChild(span, textNode);
      span.appendChild(textNode);
    }
  });

  cleanDOM(editor);
  updatePreview();
}

/* ======================
   CLEAN DOM (NOTION STYLE)
====================== */
function cleanDOM(root) {
  mergeSpans(root);
  removeEmptySpans(root);
}

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

function removeEmptySpans(root) {
  root.querySelectorAll("span").forEach(span => {
    if (!span.textContent.trim()) span.remove();
  });
}

/* ======================
   TOOLBAR
====================== */
sizeInput.addEventListener("input", () => {
  sizeValue.innerText = sizeInput.value + "px";
  applyStyle("fontSize", sizeInput.value + "px");
});

document.getElementById("font").addEventListener("change", e => {
  applyStyle("fontFamily", e.target.value);
});

window.setColor = function (color) {
  applyStyle("color", color);
};

/* ======================
   PREVIEW
====================== */
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

editor.addEventListener("input", () => {
  cleanDOM(editor);
  updatePreview();
});

from.addEventListener("input", updatePreview);
to.addEventListener("input", updatePreview);

updatePreview();

/* ======================
   EXPIRY
====================== */
function getExpiryDate(days) {
  if (!days || days === "0") return null;
  const d = new Date();
  d.setDate(d.getDate() + parseInt(days));
  return d;
}

/* ======================
   POPUP + QR
====================== */
function showPopup(link) {
  const popup = document.getElementById("popup");
  const input = document.getElementById("popupLink");
  const canvas = document.getElementById("qrcode");

  input.value = link;

  QRCode.toCanvas(canvas, link, {
    width: 200,
    color: { dark: "#333", light: "#fff" }
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

/* ======================
   CREATE LETTER
====================== */
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
      youtubeStart: parseInt(document.getElementById("ytStart").value) || 0,
      youtubeEnd: parseInt(document.getElementById("ytEnd").value) || null
    });

    const link =
      window.location.origin + "/reading/reading.html?id=" + id;

    showPopup(link);

    status.innerText = "Đã tạo thư ✨";
  } catch (e) {
    status.innerText = "Lỗi: " + e.message;
  }
};

/* ======================
   THEME
====================== */
const themeSelect = document.getElementById("theme");

themeSelect.addEventListener("change", () => {
  document.body.className = "theme-" + themeSelect.value;
});

document.body.className = "theme-" + themeSelect.value;

/* ======================
   NAV
====================== */
window.goHelp = function () {
  window.location.href = "../helping/helping.html";
};