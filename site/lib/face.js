const FACE_POLICY = [
  "default-src 'none'",
  "script-src 'unsafe-inline'",
  "style-src 'unsafe-inline'",
  "img-src data: blob:",
  "media-src data: blob:",
  "font-src data:",
  "connect-src 'none'",
  "frame-src 'none'",
  "object-src 'none'",
  "form-action 'none'",
  "base-uri 'none'"
].join("; ");

export function faceDocument(fragment) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${FACE_POLICY}">
<style>
  :root { color-scheme: light; }
  *, *::before, *::after { box-sizing: border-box; }
  html { background: transparent; }
  body { margin: 0; padding: clamp(1.25rem, 4vw, 3rem); color: #092c3b; font: 1.125rem/1.55 ui-sans-serif, system-ui, sans-serif; overflow-wrap: anywhere; }
  p { max-width: 65ch; margin: 0 0 1.3em; }
  h1, h2, h3 { line-height: 1.2; }
  math[display="block"] { display: block math; margin: 1.6rem 0; font-size: clamp(2rem, 6vw, 4rem); }
  .symbol { display: block; margin: 1.6rem 0; text-align: center; font-size: clamp(2rem, 6vw, 4rem); line-height: 1.2; }
  svg, img, video { display: block; max-width: 100%; height: auto; margin: 1rem auto; }
  audio { max-width: 100%; }
  pre { overflow-x: auto; padding: 1rem; border-radius: .3rem; background: #e9f2f3; line-height: 1.5; }
  code, pre { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; }
  table { border-collapse: collapse; margin-top: 1rem; width: 100%; max-width: 40rem; }
  th, td { padding: .45rem .75rem; text-align: left; border-bottom: 1px solid #b4cbd0; }
  caption { text-align: left; margin-bottom: .5rem; }
  button { padding: .7rem 1rem; border: 1px solid #092c3b; border-radius: .25rem; color: #092c3b; background: white; font: inherit; cursor: pointer; }
  button:focus-visible, a:focus-visible { outline: 3px solid #087e87; outline-offset: 3px; }
  output { display: inline-block; padding: .5rem; }
  ::selection { background: #93d9d6; color: #092c3b; }
</style>
</head>
<body>${fragment}</body>
</html>`;
}

export function showFace(container, html, side) {
  const frame = document.createElement("iframe");
  frame.setAttribute("sandbox", "allow-scripts");
  frame.setAttribute("referrerpolicy", "no-referrer");
  frame.title = `Card ${side}`;
  frame.srcdoc = faceDocument(html);
  container.replaceChildren(frame);
  return frame;
}
