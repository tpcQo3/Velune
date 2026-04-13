import { saveLetter } from "../firebase.js";

// ======================
// ELEMENTS
// ======================
const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const status = document.getElementById("status");

// ======================
// TOOLBAR COMMANDS
// ======================
window.cmd = function (command) {
  document.execCommand(command, false, null);
};

// font
document.getElementById("font").addEventListener("change", (e) => {
  document.execCommand("fontName", false, e.target.value);
});

// size (simple apply)
document.getElementById("size").addEventListener("change", (e) => {
  editor.style.fontSize = e.target.value;
});

// color
document.getElementById("color").addEventListener("input", (e) => {
  document.execCommand("foreColor", false, e.target.value);
});

// ======================
// LIVE PREVIEW
// ======================
editor.addEventListener("input", () => {
  let html = editor.innerHTML;

  // markdown support
  html = html.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
  html = html.replace(/\*(.*?)\*/g, "<i>$1</i>");
  html = html.replace(/__(.*?)__/g, "<u>$1</u>");

  preview.innerHTML = html;
});

// ======================
// CREATE LETTER
// ======================
window.createLetter = async function () {

  if (!editor.innerHTML.trim()) {
    status.innerText = "Bạn chưa viết nội dung...";
    return;
  }

  status.innerText = "Đang tạo thư...";

  try {
    const id = await saveLetter({
      text: editor.innerHTML
    });

    status.innerText = "Đã tạo thư ✨";

    const link = window.location.origin + "/reading/reading.html?id=" + id;

    alert("Link thư của bạn:\n" + link);

  } catch (e) {
    status.innerText = "Lỗi: " + e.message;
  }
};