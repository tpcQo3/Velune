// bình đẹp trai :)))

const starsContainer = document.querySelector(".stars");

const isMobile = window.innerWidth < 768;

// ⚙️ CONFIG
const config = {
  count: isMobile ? 25 : 60,   // số lượng sao
  minSize: 1,                  // kích thước nhỏ nhất
  maxSize: 3,                  // kích thước lớn nhất
  minSpeed: 2,                 // tốc độ chậm
  maxSpeed: 5,                 // tốc độ nhanh
  opacity: 0.8                // độ mờ
};

for (let i = 0; i < config.count; i++) {
  const star = document.createElement("div");
  star.classList.add("star");

  // random vị trí
  star.style.left = Math.random() * 100 + "vw";
  star.style.top = Math.random() * 100 + "vh";

  // random size
  const size = config.minSize + Math.random() * (config.maxSize - config.minSize);
  star.style.width = size + "px";
  star.style.height = size + "px";

  // opacity
  star.style.opacity = Math.random() * config.opacity;

  // speed
  const speed = config.minSpeed + Math.random() * (config.maxSpeed - config.minSpeed);
  star.style.animationDuration = speed + "s";

  starsContainer.appendChild(star);
}