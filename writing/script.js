import { saveLetter } from "../firebase.js";

/* ======================
   ELEMENTS
====================== */
const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const status = document.getElementById("status");

const from = document.getElementById("from");
const to = document.getElementById("to");
let currentFont = "'Quicksand', sans-serif";

document.getElementById("font").addEventListener("change", e => {
  currentFont = e.target.value;

  // apply cho editor
  editor.style.fontFamily = currentFont;

  updatePreview();
});

/* ======================
   MARKDOWN (DISCORD STYLE)
====================== */
function parseMarkdown(text) {
  // escape HTML
  text = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // headings
  text = text
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h1>$1</h1>");

  // bold / italic / underline
  text = text
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
    .replace(/\*(.*?)\*/g, "<i>$1</i>")
    .replace(/__(.*?)__/g, "<u>$1</u>");

  // quote
  text = text.replace(/^> (.*)$/gm, "<blockquote>$1</blockquote>");

  // divider
  text = text.replace(/^---$/gm, "<hr>");

  // link
  text = text.replace(/\[(.*?)\]\((.*?)\)/g, (m, t, u) => {
    if (!u.startsWith("http")) u = "https://" + u;
    return `<a href="${u}" target="_blank">${t}</a>`;
  });

  // xuống dòng
  text = text.replace(/\n/g, "<br>");

  return text;
}

/* ======================
   PREVIEW
====================== */
function updatePreview() {
  preview.innerHTML = `
    <div><b>Từ:</b> ${from.value || "..."}</div>
    <div><b>Đến:</b> ${to.value || "..."}</div>
    <hr>
    <div class="letter-content" style="font-family:${currentFont}">
      ${parseMarkdown(editor.innerText)}
    </div>
  `;
}

editor.addEventListener("input", updatePreview);
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

      // ❗ vẫn lưu HTML để hiển thị đẹp khi đọc
      content: parseMarkdown(editor.innerText),

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

// Thêm vào script.js
let currentColor = "#000000";

window.setColor = function(color) {
  currentColor = color;
  document.execCommand("foreColor", false, color);
  updatePreview();
};