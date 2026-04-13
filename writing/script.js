import { saveLetter } from "../firebase.js";

const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const status = document.getElementById("status");

// ======================
// TOOL COMMAND (fix)
// ======================
window.cmd = function (command) {
  document.execCommand(command, false, null);
};

// font
document.getElementById("font").addEventListener("change", (e) => {
  document.execCommand("fontName", false, e.target.value);
});

// size (fix đúng cách)
document.getElementById("size").addEventListener("change", (e) => {
  document.execCommand("fontSize", false, "7");

  const spans = editor.getElementsByTagName("font");
  for (let i = 0; i < spans.length; i++) {
    spans[i].style.fontSize = e.target.value;
  }
});

// color
document.getElementById("color").addEventListener("input", (e) => {
  document.execCommand("foreColor", false, e.target.value);
});

// ======================
// FIXED MARKDOWN ENGINE
// ======================
function parseMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
    .replace(/\*(.*?)\*/g, "<i>$1</i>")
    .replace(/__(.*?)__/g, "<u>$1</u>");
}

// ======================
// LIVE PREVIEW (FIXED)
// ======================
editor.addEventListener("input", () => {

  const raw = editor.innerText; // ⚠️ QUAN TRỌNG

  const html = parseMarkdown(raw);

  preview.innerHTML = html;
});

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
      text: parseMarkdown(raw)
    });

    status.innerText = "Đã tạo thư ✨";

    const link = window.location.origin + "/reading/reading.html?id=" + id;

    alert("Link thư:\n" + link);

  } catch (e) {
    status.innerText = "Lỗi: " + e.message;
  }
};