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

const intro = document.getElementById("intro");
const passwordBox = document.getElementById("passwordBox");

let currentLetter = null;

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
   RENDER (INTRO + PASSWORD)
====================== */
function renderLetter(letter) {
  currentLetter = letter;

  setTimeout(() => {
    if (intro) intro.style.display = "none";

    const hasPassword =
      letter.password &&
      typeof letter.password === "string" &&
      letter.password.trim() !== "";

    if (hasPassword) {
      passwordBox.classList.remove("hidden");
    } else {
      passwordBox.classList.add("hidden"); // 🔥 FIX QUAN TRỌNG
      showLetter(letter);
    }

  }, 1500);
}

/* ======================
   SHOW LETTER
====================== */
function showLetter(letter) {

  // theme
  if (letter.theme) {
    document.body.classList.add("theme-" + letter.theme);
  }

  // info
  toEl.innerText = "Gửi đến: " + (letter.to || "...");
  fromEl.innerText = "Từ: " + (letter.from || "Ẩn danh");

  // content (🔥 giữ full style)
  contentEl.innerHTML = letter.content || "";

  // show UI
  loading.classList.add("hidden");
  letterBox.classList.remove("hidden");
}

/* ======================
   PASSWORD CHECK
====================== */
window.checkPassword = function () {
  const input = document.getElementById("passwordInput").value.trim();
  const real = (currentLetter.password || "").trim();

  if (input === real) {
    passwordBox.classList.add("hidden");
    showLetter(currentLetter);
  } else {
    document.getElementById("passwordError").innerText = "Sai mật mã 😢";
  }
};

/* ======================
   ERROR
====================== */
function showError(msg) {
  loading.classList.add("hidden");

  if (intro) intro.style.display = "none";

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