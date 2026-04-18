export function initPopup() {
  window.closePopup = function () {
    document.getElementById("popup").classList.add("hidden");
  };

  window.copyLink = function () {
    const input = document.getElementById("popupLink");
    input.select();
    document.execCommand("copy");
  };
}