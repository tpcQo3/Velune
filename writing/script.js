import { saveLetter } from "../firebase.js";

/* ======================
   ELEMENTS
====================== */
const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const status = document.getElementById("status");

const from = document.getElementById("from");
const to = document.getElementById("to");
const themeSelect = document.getElementById("theme");

/* ======================
   MARKDOWN (SAFE VERSION)
====================== */
function parseMarkdown(html) {
  // chỉ xử lý markdown nhẹ để không phá HTML
  html = html
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h1>$1</h1>");

  html = html
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
    .replace(/\*(.*?)\*/g, "<i>$1</i>")
    .replace(/__(.*?)__/g, "<u>$1</u>");

  html = html.replace(/\[(.*?)\]\((.*?)\)/g, (m, t, u) => {
    if (!u.startsWith("http")) u = "https://" + u;
    return `<a href="${u}" target="_blank">${t}</a>`;
  });

  return html;
}

/* ======================
   PREVIEW
====================== */
function updatePreview() {
  let content = editor.innerHTML;

  content = parseMarkdown(content);

  preview.innerHTML = `
    <div><b>Từ:</b> ${from.value || "..."}</div>
    <div><b>Đến:</b> ${to.value || "..."}</div>
    <hr>
    <div class="letter-content">
      ${content}
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
   POPUP
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
  document.body.style.overflow = "";
}

window.closePopup = function () {
  document.getElementById("popup").classList.add("hidden");
  document.body.style.overflow = "";
};

window.copyLink = function () {
  const input = document.getElementById("popupLink");
  input.select();
  document.execCommand("copy");
  alert("Đã sao chép link!");
};

/* ======================
   CREATE LETTER
====================== */
async function createLetter() {
  if (!editor.innerText.trim()) {
    status.innerText = "Bạn chưa viết nội dung...";
    return;
  }

  status.innerText = "Đang tạo thư...";

  try {
    const id = await saveLetter({
      from: from.value || "Ẩn danh",
      to: to.value || "Không rõ",
      content: editor.innerHTML, // 🔥 giữ full style
      expiryAt: getExpiryDate(document.getElementById("expiry").value),
      password: document.getElementById("password").value || null,
      theme: themeSelect.value,
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
}

document.getElementById("createBtn")
  .addEventListener("click", createLetter);

/* ======================
   THEME
====================== */
function applyTheme(theme) {
  document.body.classList.forEach(c => {
    if (c.startsWith("theme-")) {
      document.body.classList.remove(c);
    }
  });

  document.body.classList.add("theme-" + theme);
}

themeSelect.addEventListener("change", () => {
  applyTheme(themeSelect.value);
});

applyTheme(themeSelect.value);

/* ======================
   NAV
====================== */
window.goHelp = function () {
  window.location.href = "../helping/helping.html";
};