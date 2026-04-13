const starsContainer = document.querySelector(".stars");

const isMobile = window.innerWidth < 768;

const config = {
  count: isMobile ? 25 : 60,
  minSize: 1,
  maxSize: 3,
  minSpeed: 2,
  maxSpeed: 5,
  opacity: 0.8
};

for (let i = 0; i < config.count; i++) {
  const star = document.createElement("div");
  star.classList.add("star");

  star.style.left = Math.random() * 100 + "vw";
  star.style.top = Math.random() * 100 + "vh";

  const size = config.minSize + Math.random() * (config.maxSize - config.minSize);
  star.style.width = size + "px";
  star.style.height = size + "px";

  star.style.opacity = Math.random() * config.opacity;

  const speed = config.minSpeed + Math.random() * (config.maxSpeed - config.minSpeed);
  star.style.animationDuration = speed + "s";

  starsContainer.appendChild(star);
}