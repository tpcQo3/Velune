// bình đẹp trai :)))

const starsContainer = document.querySelector(".stars");

const isMobile = window.innerWidth < 768;
const starCount = isMobile ? 25 : 60;

for (let i = 0; i < starCount; i++) {
  const star = document.createElement("div");
  star.classList.add("star");

  star.style.left = Math.random() * 100 + "vw";
  star.style.top = Math.random() * 100 + "vh";

  star.style.animationDuration = (2 + Math.random() * 3) + "s";

  starsContainer.appendChild(star);
}