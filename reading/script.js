import { db } from "../firebase.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ======================
   GET ID
====================== */
function getId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

/* ======================
   ELEMENTS
====================== */
const loading = document.getElementById("loading");
const letterBox = document.getElementById("letterBox");
const errorBox = document.getElementById("error");

const toEl = document.getElementById("to");
const fromEl = document.getElementById("from");
const contentEl = document.getElementById("content");

/* ======================
   LOAD LETTER
====================== */
async function loadLetter() {
  const id = getId();

  if (!id) {
    showError("Thiếu ID thư 😢");
    return;
  }

  try {
    const ref = doc(db, "letters", id);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      showError("Không tìm thấy thư 💔");
      return;
    }

    const letter = snap.data();

    /* ===== EXPIRE ===== */
    if (letter.expiryAt) {
      const now = new Date();
      const expire = letter.expiryAt.toDate();

      if (now > expire) {
        showError("Thư đã hết hạn ⏳");
        return;
      }
    }

    renderLetter(letter);

  } catch (e) {
    showError("Lỗi: " + e.message);
  }
}

/* ======================
   RENDER
====================== */
function renderLetter(letter) {

  // theme
  if (letter.theme) {
    document.body.classList.add("theme-" + letter.theme);
  }

  // info
  toEl.innerText = "Gửi đến: " + (letter.to || "...");
  fromEl.innerText = "Từ: " + (letter.from || "Ẩn danh");

  // content (🔥 giữ style)
  contentEl.innerHTML = letter.content || "";

  // show
  loading.classList.add("hidden");
  letterBox.classList.remove("hidden");
}

/* ======================
   ERROR
====================== */
function showError(msg) {
  loading.classList.add("hidden");
  errorBox.innerText = msg;
  errorBox.classList.remove("hidden");
}

/* ======================
   COPY LINK
====================== */
window.copyLink = function () {
  navigator.clipboard.writeText(window.location.href);
  alert("Đã copy link!");
};

/* ======================
   START
====================== */
loadLetter();