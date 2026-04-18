export function initTheme() {
  const themeSelect = document.getElementById("theme");

  function applyTheme(theme) {
    document.body.className = "theme-" + theme;
  }

  themeSelect.addEventListener("change", () => {
    applyTheme(themeSelect.value);
  });

  applyTheme(themeSelect.value);
}