import { db } from "../firebase.js";
import { collection, doc, runTransaction } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ======================
   ELEMENTS
====================== */
const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const status = document.getElementById("status");

const from = document.getElementById("from");
const to = document.getElementById("to");
const themeSelect = document.getElementById("theme");
let currentLink = "";

function generateId(length = 6) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }

  return result;
}

/* ======================
   DAY KEY (RESET 6H)
====================== */
function getDayKey() {
  const now = new Date();

  if (now.getHours() < 6) {
    now.setDate(now.getDate() - 1);
  }

  return now.toISOString().slice(0, 10);
}

/* ======================
   MARKDOWN
====================== */
function parseMarkdownSafe(html) {
  return html
    .replace(/(^|>)([^<]*?)### (.*?)(?=<|$)/g, '$1<h3>$3</h3>')
    .replace(/(^|>)([^<]*?)## (.*?)(?=<|$)/g, '$1<h2>$3</h2>')
    .replace(/(^|>)([^<]*?)# (.*?)(?=<|$)/g, '$1<h1>$3</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.*?)\*/g, '<i>$1</i>')
    .replace(/__(.*?)__/g, '<u>$1</u>');
}

/* ======================
   PREVIEW
====================== */
function updatePreview() {
  const raw = editor.innerHTML; // giữ nguyên
  const parsed = parseMarkdownSafe(raw); // chỉ dùng cho preview

  preview.innerHTML = `
  <div><b>Từ:</b> ${from.value || "..."}</div>
  <div><b>Đến:</b> ${to.value || "..."}</div>
  <hr>
  <div class="letter-content">
    ${parsed}
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
}

window.closePopup = function () {
  document.getElementById("popup").classList.add("hidden");
};

window.copyLink = function () {
  const input = document.getElementById("popupLink");

  const original = input.value; // 🔥 lưu link thật

  navigator.clipboard.writeText(original);

  input.value = "Đã copy ✨";
  input.style.opacity = "0.7";

  setTimeout(() => {
    input.value = original; // 🔥 trả lại link đúng
    input.style.opacity = "1";
  }, 1500);
};

/* ======================
   TOS POPUP
====================== */

function requireTOS() {
  if (!localStorage.getItem("acceptedTOS")) {
    document.getElementById("tosPopup").classList.remove("hidden");
    return false;
  }
  return true;
}

window.acceptTOS = function () {
  localStorage.setItem("acceptedTOS", "true");
  document.getElementById("tosPopup").classList.add("hidden");

  // gọi lại tạo thư sau khi accept
  createLetter();
};

window.declineTOS = function () {
  document.getElementById("tosPopup").classList.add("hidden");
};

/* ======================
   CREATE LETTER (LIMIT 1000/DAY)
====================== */
async function createLetter() {

  if (!requireTOS()) return;


  if (!editor.innerText.trim()) {
    status.innerText = "Bạn chưa viết nội dung...";
    return;
  }

  status.innerText = "Đang tạo thư...";

  try {
    const statsRef = doc(db, "stats", "daily");
    const id = generateId();
    const newLetterRef = doc(db, "letters", id);

    const dayKey = getDayKey();
    const passwordValue = document.getElementById("password")?.value.trim();

    await runTransaction(db, async (tx) => {
      const statsDoc = await tx.get(statsRef);

      let count = 0;

      if (statsDoc.exists()) {
        const data = statsDoc.data();

        if (data.dayKey === dayKey) {
          count = data.count || 0;
        }
      }

      if (count >= 1000) {
        throw new Error("Hôm nay đã đạt giới hạn 1000 thư. Quay lại sau 6h sáng nhé!");
      }

      tx.set(statsRef, {
        count: count + 1,
        dayKey: dayKey
      });

      tx.set(newLetterRef, {
        from: from.value || "Ẩn danh",
        to: to.value || "Không rõ",
        content: editor.innerHTML,
        createdAt: new Date(),

        expiryAt: getExpiryDate(document.getElementById("expiry").value),

        password: passwordValue ? passwordValue : null,
        theme: themeSelect.value
      });
    });

    const link =
    window.location.origin + "/reading/reading.html?id=" + id;

    currentLink = link; // 🔥 LƯU LẠI

    showPopup(link);

    status.innerText = "Đã tạo thư ✨";

  } catch (e) {
    status.innerText = e.message;
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

/* ======================
   RICH TEXT
====================== */
function applyStyle(styleObj) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  if (range.collapsed) return;

  const span = document.createElement("span");
  Object.assign(span.style, styleObj);

  span.appendChild(range.extractContents());
  range.insertNode(span);

  selection.removeAllRanges();
  const newRange = document.createRange();
  newRange.selectNodeContents(span);
  selection.addRange(newRange);

  updatePreview();
}

/* ===== COLOR ===== */
window.setColor = function (color) {
  editor.focus();
  applyStyle({ color });
};

/* ===== FONT ===== */
window.setFont = function (font) {
  editor.focus();
  applyStyle({ fontFamily: font });
};

/* ===== SIZE ===== */
window.setSize = function (size) {
  editor.focus();
  applyStyle({ fontSize: size + "px" });
};

/* ===== STYLE ===== */
window.bold = function () {
  editor.focus();
  applyStyle({ fontWeight: "bold" });
};

window.italic = function () {
  editor.focus();
  applyStyle({ fontStyle: "italic" });
};

window.underline = function () {
  editor.focus();
  applyStyle({ textDecoration: "underline" });
};