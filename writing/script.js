import { saveLetter } from "../firebase.js";

// ======================
// ELEMENTS
// ======================
const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const status = document.getElementById("status");

const from = document.getElementById("from");
const to = document.getElementById("to");

const sizeInput = document.getElementById("size");
const sizeValue = document.getElementById("sizeValue");

// ======================
// RANGE CORE
// ======================
function getSelectionRange() {
  const sel = window.getSelection();
  if (!sel.rangeCount) return null;
  return sel.getRangeAt(0);
}

function applyStyle(styleObj) {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;

  const range = sel.getRangeAt(0);
  if (range.collapsed) return;

  try {
    let wrapper;

    // 🎯 highlight
    if (styleObj.backgroundColor) {
      wrapper = document.createElement("mark");
      wrapper.style.backgroundColor = styleObj.backgroundColor;
      wrapper.style.padding = "0 2px";
      wrapper.style.borderRadius = "2px";
    } else {
      wrapper = document.createElement("span");
      Object.assign(wrapper.style, styleObj);
    }

    // 🔥 API CHUẨN
    range.surroundContents(wrapper);

    // giữ selection
    const newRange = document.createRange();
    newRange.selectNodeContents(wrapper);

    sel.removeAllRanges();
    sel.addRange(newRange);

  } catch (e) {
    console.warn("Không thể apply style vào vùng phức tạp");
  }

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
sizeInput.oninput = (e) => {
  const value = e.target.value;

  sizeValue.innerText = value + "px";

  applyStyle({
    fontSize: value + "px"
  });
};

// 🎨 MÀU CHỮ
document.getElementById("color").oninput = (e) => {
  applyStyle({
    color: e.target.value
  });
};

// ✨ DẠ QUANG (HIGHLIGHT)
document.getElementById("bgcolor").oninput = (e) => {
  applyStyle({
    backgroundColor: e.target.value
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
editor.addEventListener("input", updatePreview);
from.addEventListener("input", updatePreview);
to.addEventListener("input", updatePreview);

updatePreview();

// ======================
// MARKDOWN (SAVE ONLY)
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

    const id = await saveLetter({
      from: from.value || "Ẩn danh",
      to: to.value || "Không rõ",

      content: parseMarkdown(editor.innerHTML),

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

// click ngoài để đóng
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