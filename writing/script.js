import { initEditor } from "./modules/editor.js";
import { initPreview } from "./modules/preview.js";
import { initToolbar } from "./modules/toolbar.js";
import { initPopup } from "./modules/popup.js";
import { initTheme } from "./modules/theme.js";

initEditor();
initPreview();
initToolbar();
initPopup();
initTheme();

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

document.getElementById("createBtn")
  .addEventListener("click", createLetter);