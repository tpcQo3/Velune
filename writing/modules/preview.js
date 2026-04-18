import { parseMarkdown } from "./markdown.js";

const from = document.getElementById("from");
const to = document.getElementById("to");
const editor = document.getElementById("editor");
const preview = document.getElementById("preview");

export function updatePreview() {
  preview.innerHTML = `
    <div><b>Từ:</b> ${from.value || "..."}</div>
    <div><b>Đến:</b> ${to.value || "..."}</div>
    <hr>
    <div class="letter-content">
      ${parseMarkdown(editor.innerText)}
    </div>
  `;
}

export function initPreview() {
  from.addEventListener("input", updatePreview);
  to.addEventListener("input", updatePreview);
  updatePreview();
}