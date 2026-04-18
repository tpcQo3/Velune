export function applyStyle(style, value) {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;

  const range = sel.getRangeAt(0);
  if (range.collapsed) return;

  const span = document.createElement("span");
  span.style[style] = value;

  const content = range.extractContents();
  span.appendChild(content);
  range.insertNode(span);
}

export function cleanDOM(root) {
  mergeSpans(root);
  removeEmpty(root);
}

function mergeSpans(root) {
  const spans = root.querySelectorAll("span");

  spans.forEach(span => {
    let next = span.nextSibling;

    if (
      next &&
      next.nodeType === 1 &&
      next.nodeName === "SPAN" &&
      span.style.cssText === next.style.cssText
    ) {
      span.innerHTML += next.innerHTML;
      next.remove();
    }
  });
}

function removeEmpty(root) {
  root.querySelectorAll("span").forEach(span => {
    if (!span.textContent.trim()) span.remove();
  });
}