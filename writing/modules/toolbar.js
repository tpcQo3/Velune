import { applyStyle } from "./utils.js";

export function initToolbar() {
  document.getElementById("font").addEventListener("change", e => {
    applyStyle("fontFamily", e.target.value);
  });

  window.setColor = function (color) {
    applyStyle("color", color);
  };
}