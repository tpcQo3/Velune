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
// RANGE CORE
// ======================
function getSelectionRange() {
  const sel = window.getSelection();
  if (!sel.rangeCount) return null;
  return sel.getRangeAt(0);
}

// ======================
// APPLY STYLE (NO execCommand)
// ======================
function applyStyle(styleObj) {
  const range = getSelectionRange();
  if (!range || range.collapsed) return;

  const span = document.createElement("span");
  Object.assign(span.style, styleObj);

  span.appendChild(range.extractContents());
  range.insertNode(span);

  // giữ selection
  const newRange = document.createRange();
  newRange.selectNodeContents(span);

  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(newRange);

  updatePreview();
}

// ======================
// TOOLBAR
// ======================

// FONT
document.getElementById("font").onchange = (e) => {
  applyStyle({
    fontFamily: e.target.value
  });
};

// SIZE (1 → 50 px)
document.getElementById("size").oninput = (e) => {
  applyStyle({
    fontSize: e.target.value + "px"
  });
};

// COLOR
document.getElementById("color").oninput = (e) => {
  applyStyle({
    color: e.target.value
  });
};

// ======================
// PREVIEW
// ======================
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
// EVENTS
// ======================

// 🔥 KHÔNG dùng markdown realtime nữa
editor.addEventListener("input", () => {
  updatePreview();
});

from.addEventListener("input", updatePreview);
to.addEventListener("input", updatePreview);

// init
updatePreview();

// ======================
// MARKDOWN (chỉ dùng khi lưu)
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

  if (!editor.innerText.trim()) {
    status.innerText = "Bạn chưa viết nội dung...";
    return;
  }

  status.innerText = "Đang tạo thư...";

  try {

    const contentHTML = editor.innerHTML;

    const id = await saveLetter({
      from: from.value || "Ẩn danh",
      to: to.value || "Không rõ",

      // 🔥 xử lý markdown tại đây (không realtime)
      content: parseMarkdown(contentHTML),

      createdAt: new Date(),
      expiryAt: getExpiryDate(document.getElementById("expiry").value),

      password: document.getElementById("password").value || null,

      theme: document.getElementById("theme").value,

      urlYoutube: document.getElementById("youtube").value || null,

      youtubeStart: parseInt(document.getElementById("ytStart").value) || 0,
      youtubeEnd: parseInt(document.getElementById("ytEnd").value) || null
    });

    const link = window.location.origin + "/reading/reading.html?id=" + id;

    openPopup(link);

    status.innerText = "Đã tạo thư ✨";

  } catch (e) {
    status.innerText = "Lỗi: " + e.message;
    console.error(e);
  }
};

// ======================
// POPUP
// ======================
function openPopup(link) {
  const popup = document.getElementById("popup");
  const input = document.getElementById("popupLink");

  input.value = link;
  popup.classList.remove("hidden");
}

window.closePopup = function () {
  document.getElementById("popup").classList.add("hidden");
};

window.copyLink = function () {
  const input = document.getElementById("popupLink");

  input.select();
  document.execCommand("copy");

  alert("Đã copy link!");
};

// click ra ngoài để đóng
document.getElementById("popup").addEventListener("click", (e) => {
  if (e.target.id === "popup") {
    closePopup();
  }
});

// ======================
// HELP NAV
// ======================
window.goHelp = function () {
  window.location.href = "../helping/helping.html";
};