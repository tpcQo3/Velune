import { initEditor } from "./modules/editor.js";
import { initPreview } from "./modules/preview.js";
import { initToolbar } from "./modules/toolbar.js";
import { initPopup, showPopup } from "./modules/popup.js";
import { initTheme } from "./modules/theme.js";

import { saveLetter } from "../firebase.js";

/* ===== ELEMENTS ===== */
const editor = document.getElementById("editor");
const status = document.getElementById("status");

const from = document.getElementById("from");
const to = document.getElementById("to");

/* ===== UTILS ===== */
function getExpiryDate(days) {
  if (!days || days === "0") return null;

  const d = new Date();
  d.setDate(d.getDate() + parseInt(days));
  return d;
}

/* ===== INIT ===== */
document.addEventListener("DOMContentLoaded", () => {
  initEditor();
  initPreview();
  initToolbar();
  initPopup();
  initTheme();

  document.getElementById("createBtn")
    .addEventListener("click", createLetter);
});

/* ===== CREATE LETTER ===== */
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
}