const fs = require("fs");
const http = require("http");
const path = require("path");

const root = path.resolve(__dirname, "..", "dist");
const port = Number(process.env.PORT || 4173);
const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8"
};

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const pathname = decodeURIComponent(url.pathname);
  const requestedPath = path.normalize(path.join(root, pathname));
  const isInsideDist = requestedPath === root || requestedPath.startsWith(`${root}${path.sep}`);
  const filePath = isInsideDist && fs.existsSync(requestedPath) && fs.statSync(requestedPath).isFile()
    ? requestedPath
    : path.join(root, "index.html");

  response.setHeader("Content-Type", types[path.extname(filePath)] || "application/octet-stream");
  fs.createReadStream(filePath).pipe(response);
});

server.listen(port, () => {
  console.log(`Preview available at http://localhost:${port}`);
});
