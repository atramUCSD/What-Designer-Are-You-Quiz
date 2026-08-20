import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";

const port = Number.parseInt(process.env.PORT ?? "4300", 10);
const root = resolve(process.cwd());

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".gif", "image/gif"],
  [".htm", "text/html; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".js", "application/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".pdf", "application/pdf"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webp", "image/webp"],
  [".woff2", "font/woff2"],
]);

function send(res, statusCode, body, contentType = "text/plain; charset=utf-8") {
  res.writeHead(statusCode, { "Content-Type": contentType });
  res.end(body);
}

const server = createServer(async (req, res) => {
  try {
    const urlPath = new URL(req.url ?? "/", "http://localhost").pathname;
    const relativePath = urlPath === "/" ? "index.html" : normalize(decodeURIComponent(urlPath)).replace(/^\\+/, "");
    const filePath = resolve(join(root, relativePath));

    if (!filePath.startsWith(root)) {
      send(res, 403, "Forbidden");
      return;
    }

    const file = await readFile(filePath);
    const contentType = contentTypes.get(extname(filePath).toLowerCase()) ?? "application/octet-stream";

    res.writeHead(200, { "Content-Type": contentType });
    res.end(file);
  } catch (error) {
    const statusCode = error?.code === "ENOENT" ? 404 : 500;
    send(res, statusCode, statusCode === 404 ? "Not found" : "Server error");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Serving ${root} at http://localhost:${port}`);
});
