import { saveLetter } from "../firebase.js";

// INPUT
const from = document.getElementById("from");
const to = document.getElementById("to");
const content = document.getElementById("content");

// PREVIEW
const pFrom = document.getElementById("p-from");
const pTo = document.getElementById("p-to");
const pContent = document.getElementById("p-content");

// STATUS
const status = document.getElementById("status");

// POPUP
const popup = document.getElementById("popup");
const openLink = document.getElementById("openLink");
const linkBox = document.getElementById("linkBox");

// =======================
// LIVE PREVIEW
// =======================
from.addEventListener("input", () => {
  pFrom.textContent = from.value || "...";
});

to.addEventListener("input", () => {
  pTo.textContent = to.value || "...";
});

content.addEventListener("input", () => {
  pContent.textContent = content.value || "Nội dung sẽ hiển thị ở đây...";
});

// =======================
// CREATE LETTER
// =======================
window.createLetter = async function () {

  if (!content.value.trim()) {
    status.innerText = "Bạn chưa viết nội dung...";
    return;
  }

  status.innerText = "Đang tạo thư...";

  try {
    const id = await saveLetter({
      from: from.value || "Ẩn danh",
      to: to.value || "Không rõ",
      text: content.value
    });

    const link = window.location.origin + "/reading/reading.html?id=" + id;

    // update popup
    openLink.href = link;
    openLink.innerText = link;

    linkBox.value = link;

    // show popup
    popup.classList.remove("hidden");

    status.innerText = "Đã tạo thư ✨";

  } catch (e) {
    status.innerText = "Lỗi: " + e.message;
    console.error(e);
  }
};

// =======================
// POPUP ACTIONS
// =======================
window.closePopup = function () {
  popup.classList.add("hidden");
};

window.copyLink = function () {
  linkBox.select();
  document.execCommand("copy");
  alert("Đã copy link 💌");
};