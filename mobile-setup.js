const http = require('http');
const fs = require('fs');
const path = require('path');

// Simple static file server for serving the frontend on mobile
const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'GET' && req.url === '/') {
    // Serve the HTML file
    const filePath = path.join(__dirname, 'index.html');
    
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading page');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
  } else {
    // Handle 404
    res.writeHead(404);
    res.end('Page not found');
  }
});

const PORT = 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 Frontend server running on port ${PORT}`);
  
  // Get network IP addresses
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  const results = [];
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal addresses
      if (net.family === 'IPv4' && !net.internal) {
        results.push(net.address);
      }
    }
  }
  
  if (results.length > 0) {
    console.log(`📱 Mobile Access URLs:`);
    results.forEach(ip => {
      console.log(`   http://${ip}:${PORT}`);
    });
    console.log(`📱 Also access on mobile at: http://localhost:${PORT}`);
  }
});
