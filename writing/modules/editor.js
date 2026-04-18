import { cleanDOM } from "./utils.js";
import { updatePreview } from "./preview.js";

export function initEditor() {
  const editor = document.getElementById("editor");

  editor.addEventListener("input", () => {
    cleanDOM(editor);
    updatePreview();
  });
}