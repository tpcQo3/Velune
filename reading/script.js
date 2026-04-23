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
   MARKDOWN SAFE
====================== */
function parseMarkdownSafe(html) {
  return html
    .replace(/(^|>)([^<]*?)### (.*?)(?=<|$)/g, '$1<h3>$3</h3>')
    .replace(/(^|>)([^<]*?)## (.*?)(?=<|$)/g, '$1<h2>$3</h2>')
    .replace(/(^|>)([^<]*?)# (.*?)(?=<|$)/g, '$1<h1>$3</h1>')

    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.*?)\*/g, '<i>$1</i>')
    .replace(/__(.*?)__/g, '<u>$1</u>')

    .replace(/\[(.*?)\]\((.*?)\)/g, (m, t, u) => {
      if (!u.startsWith("http")) u = "https://" + u;
      return `<a href="${u}" target="_blank">${t}</a>`;
    });
}

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
      passwordBox.classList.add("hidden");
      showLetter(letter);
    }

  }, 1500);
}

/* ======================
   TYPE HTML (SAFE)
====================== */
function typeHTML(el, html, speed = 12) {
  el.innerHTML = "";

  const temp = document.createElement("div");
  temp.innerHTML = html;

  const nodes = Array.from(temp.childNodes);
  let i = 0;

  function processNode(node, parent, done) {
    if (node.nodeType === 3) {
      // TEXT
      let text = node.textContent;
      let j = 0;

      const textNode = document.createTextNode("");
      parent.appendChild(textNode);

      const interval = setInterval(() => {
        textNode.textContent += text[j];
        j++;
        if (j >= text.length) {
          clearInterval(interval);
          done();
        }
      }, speed);

    } else {
      // ELEMENT
      const clone = node.cloneNode(false);
      parent.appendChild(clone);

      const children = Array.from(node.childNodes);
      let k = 0;

      function nextChild() {
        if (k < children.length) {
          processNode(children[k], clone, () => {
            k++;
            nextChild();
          });
        } else {
          done();
        }
      }

      nextChild();
    }
  }

  function next() {
    if (i < nodes.length) {
      processNode(nodes[i], el, () => {
        i++;
        next();
      });
    }
  }

  next();
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

  // content
  let content = letter.content || "";
  content = parseMarkdownSafe(content);

  // show UI
  loading.classList.add("hidden");
  letterBox.classList.remove("hidden");

  // animation mở thư
  setTimeout(() => {
    letterBox.classList.add("show");
  }, 50);

  // typing effect
  setTimeout(() => {
    typeHTML(contentEl, content, 12);
  }, 300);
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