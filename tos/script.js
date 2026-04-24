const toggleBtn = document.getElementById("themeToggle");

/* load saved theme */
function loadTheme() {
  const saved = localStorage.getItem("theme");

  if (saved === "light") {
    document.body.classList.add("light");
    toggleBtn.innerText = "☀️";
  } else {
    toggleBtn.innerText = "🌙";
  }
}

/* toggle */
toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("light");

  const isLight = document.body.classList.contains("light");

  if (isLight) {
    localStorage.setItem("theme", "light");
    toggleBtn.innerText = "☀️";
  } else {
    localStorage.setItem("theme", "dark");
    toggleBtn.innerText = "🌙";
  }
});

/* init */
loadTheme();