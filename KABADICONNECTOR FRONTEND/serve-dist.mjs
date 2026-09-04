import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, "dist");
const rootDir = __dirname;

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

function contentType(filePath) {
  return mimeTypes[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
}

async function tryRead(filePath) {
  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) return null;
    return await readFile(filePath);
  } catch {
    return null;
  }
}

async function resolveAsset(urlPath) {
  const safePath = path.normalize(decodeURIComponent(urlPath)).replace(/^([/\\])+/, "");
  const distCandidate = safePath ? path.join(distDir, safePath) : path.join(distDir, "index.html");
  const rootCandidate = safePath ? path.join(rootDir, safePath) : path.join(rootDir, "index.html");

  const fromDist = await tryRead(distCandidate);
  if (fromDist) return { body: fromDist, filePath: distCandidate };

  const fromRoot = await tryRead(rootCandidate);
  if (fromRoot) return { body: fromRoot, filePath: rootCandidate };

  const spaIndex = await tryRead(path.join(distDir, "index.html"));
  if (spaIndex) return { body: spaIndex, filePath: path.join(distDir, "index.html") };

  return null;
}

const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 3000);

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || `${host}:${port}`}`);
    let pathname = url.pathname;

    if (pathname === "/") {
      pathname = "/index.html";
    }

    const asset = await resolveAsset(pathname);
    if (!asset) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    const isSpaRoute = pathname !== "/index.html" && !path.extname(pathname);
    const finalFilePath = isSpaRoute ? path.join(distDir, "index.html") : asset.filePath;
    const finalBody = isSpaRoute ? await readFile(finalFilePath) : asset.body;

    res.writeHead(200, {
      "Content-Type": contentType(finalFilePath),
      "Cache-Control": finalFilePath.endsWith("index.html") ? "no-cache" : "public, max-age=31536000, immutable",
    });
    res.end(finalBody);
  } catch (error) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(`Server error: ${error.message}`);
  }
});

server.listen(port, host, () => {
  console.log(`Kabadiwala Connect is running at http://${host}:${port}`);
});
