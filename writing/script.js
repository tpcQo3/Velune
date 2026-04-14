import { saveLetter } from "../firebase.js";

// ======================
// ELEMENTS
// ======================
const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const status = document.getElementById("status");

const from = document.getElementById("from");
const to = document.getElementById("to");

// ======================
// TOOLBAR (simple)
// ======================
document.getElementById("font").onchange = (e) => {
  document.execCommand("fontName", false, e.target.value);
  updatePreview();
};

document.getElementById("size").onchange = (e) => {
  document.execCommand("fontSize", false, "7"); // fake size
  const fonts = editor.getElementsByTagName("font");

  for (let i = 0; i < fonts.length; i++) {
    if (fonts[i].size === "7") {
      fonts[i].removeAttribute("size");
      fonts[i].style.fontSize = e.target.value;
    }
  }

  updatePreview();
};

document.getElementById("color").oninput = (e) => {
  document.execCommand("foreColor", false, e.target.value);
  updatePreview();
};

// ======================
// PREVIEW UPDATE
// ======================
function parseMarkdown(html) {

  // chỉ xử lý text, tránh phá tag HTML
  return html
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
    .replace(/\*(.*?)\*/g, "<i>$1</i>")
    .replace(/__(.*?)__/g, "<u>$1</u>")
    .replace(/\[(.*?)\]\((.*?)\)/g, (m, t, u) => {
      if (!u.startsWith("http")) u = "https://" + u;
      return `<a href="${u}" target="_blank">${t}</a>`;
    });
}

// realtime update
editor.addEventListener("input", updatePreview);
from.addEventListener("input", updatePreview);
to.addEventListener("input", updatePreview);

// gọi lần đầu
updatePreview();

function updatePreview() {
  preview.innerHTML = `
    <div class="meta-line"><b>Từ:</b> ${from.value || "..."}</div>
    <div class="meta-line"><b>Đến:</b> ${to.value || "..."}</div>

    <div class="divider"></div>

    <div class="letter-content">
      ${editor.innerHTML}
    </div>
  `;
}

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
// CREATE LETTER
// ======================
window.createLetter = async function () {

  const raw = editor.innerText;

  if (!raw.trim()) {
    status.innerText = "Bạn chưa viết nội dung...";
    return;
  }

  status.innerText = "Đang tạo thư...";

  try {

    const id = await saveLetter({
      from: from.value || "Ẩn danh",
      to: to.value || "Không rõ",

      content: parseMarkdown(raw),

      createdAt: new Date(),
      expiryAt: getExpiryDate(document.getElementById("expiry").value),

      password: document.getElementById("password").value || null,

      theme: document.getElementById("theme").value,

      urlYoutube: document.getElementById("youtube").value || null,

      youtubeStart: parseInt(document.getElementById("ytStart").value) || 0,
      youtubeEnd: parseInt(document.getElementById("ytEnd").value) || null
    });

    const link = window.location.origin + "/reading/reading.html?id=" + id;

    alert("🎉 Thư đã tạo!\n\n" + link);

    status.innerText = "Đã tạo thư ✨";

  } catch (e) {
    status.innerText = "Lỗi: " + e.message;
    console.error(e);
  }
};

window.goHelp = function () {
  window.location.href = "../helping/helping.html";
};

const sizeInput = document.getElementById("size");
const sizeValue = document.getElementById("sizeValue");

sizeInput.oninput = (e) => {
  const value = e.target.value;
  sizeValue.innerText = value + "px";

  document.execCommand("fontSize", false, "7");

  const fonts = editor.getElementsByTagName("font");

  for (let i = 0; i < fonts.length; i++) {
    if (fonts[i].size === "7") {
      fonts[i].removeAttribute("size");
      fonts[i].style.fontSize = value + "px";
    }
  }

  updatePreview();
};