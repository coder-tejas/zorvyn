const http = require('node:http');
const { createApp } = require('./app');

const PORT = process.env.PORT || 3000;
const { handleRequest } = createApp();

const server = http.createServer((req, res) => {
  let rawBody = '';
  req.on('data', (chunk) => {
    rawBody += chunk;
  });

  req.on('end', () => {
    const response = handleRequest({
      method: req.method,
      path: req.url,
      headers: req.headers,
      rawBody
    });

    res.writeHead(response.code, response.headers);
    res.end(response.body);
  });
});

server.listen(PORT, () => {
  console.log(`RBAC service running on port ${PORT}`);
});
