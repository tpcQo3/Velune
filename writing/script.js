import { saveLetter } from "../firebase.js";

const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const status = document.getElementById("status");

const from = document.getElementById("from");
const to = document.getElementById("to");

// ======================
// TOOLBAR
// ======================
window.cmd = function (cmd) {
  document.execCommand(cmd);
};

document.getElementById("font").onchange = (e) => {
  document.execCommand("fontName", false, e.target.value);
};

document.getElementById("size").onchange = (e) => {
  editor.style.fontSize = e.target.value;
};

document.getElementById("color").oninput = (e) => {
  document.execCommand("foreColor", false, e.target.value);
};

// ======================
// MARKDOWN ENGINE (basic)
// ======================
function parseMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
    .replace(/\*(.*?)\*/g, "<i>$1</i>")
    .replace(/__(.*?)__/g, "<u>$1</u>");
}

// ======================
// LIVE PREVIEW
// ======================
from.addEventListener("input", updatePreview);
to.addEventListener("input", updatePreview);

function updatePreview() {
  const content = parseMarkdown(editor.innerText);

  preview.innerHTML = `
    <div><b>Từ:</b> ${from.value || "..."}</div>
    <div><b>Đến:</b> ${to.value || "..."}</div>
    <br/>
    <div class="letter-content">${content}</div>
  `;
}

// ======================
// EXPIRY LOGIC (CÁCH A)
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