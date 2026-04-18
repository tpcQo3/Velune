export function parseMarkdown(text) {
  text = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  text = text
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h1>$1</h1>");

  text = text
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
    .replace(/\*(.*?)\*/g, "<i>$1</i>")
    .replace(/__(.*?)__/g, "<u>$1</u>");

  text = text.replace(/\[(.*?)\]\((.*?)\)/g, (m, t, u) => {
    if (!u.startsWith("http")) u = "https://" + u;
    return `<a href="${u}" target="_blank">${t}</a>`;
  });

  text = text.replace(/\n/g, "<br>");

  return text;
}