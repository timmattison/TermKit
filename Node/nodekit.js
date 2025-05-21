#!/usr/bin/env node
var termkit = {
  version: 1,
};

// Add shared path to module paths
const path = require('path');
const sharedPath = path.join(__dirname, '..', 'Shared');
const fs = require('fs');
const mime = require('mime');

// Load requirements.
var http = require('http'),  
    { Server } = require('socket.io'),
    router = require("./router");

// Load config file.
var config = require('./config').getConfig();

// HTML directory path
const htmlDir = path.join(__dirname, '..', 'HTML');

// Set up http server with static file serving and logging
var server = http.createServer(function (request, response) { 
  console.log(`[HTTP] ${request.method} ${request.url}`);
  
  // Add CORS headers
  response.setHeader('Access-Control-Allow-Origin', request.headers.origin || '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle OPTIONS preflight requests
  if (request.method === 'OPTIONS') {
    response.writeHead(200);
    response.end();
    return;
  }
  
  // Handle root request
  if (request.url === '/' || request.url === '/index.html') {
    const filePath = path.join(htmlDir, 'index.html');
    
    fs.readFile(filePath, (err, content) => {
      if (err) {
        console.error(`[ERROR] Failed to serve index.html: ${err.message}`);
        response.writeHead(500);
        response.end('Error loading index.html');
        return;
      }
      
      console.log('[HTTP] Serving index.html');
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.end(content);
    });
    return;
  }
  
  // Special case for socket.io client files
  if (request.url.startsWith('/socket.io-client/')) {
    // Map to the actual node_modules path
    const socketIOPath = path.join(__dirname, '..', 'node_modules', request.url);
    console.log(`[HTTP] Socket.IO client request, mapping to ${socketIOPath}`);
    
    fs.stat(socketIOPath, (err, stats) => {
      if (err || !stats.isFile()) {
        console.error(`[ERROR] Socket.IO file not found: ${socketIOPath}`);
        response.writeHead(404);
        response.end('Socket.IO file not found');
        return;
      }
      
      fs.readFile(socketIOPath, (err, content) => {
        if (err) {
          console.error(`[ERROR] Failed to read Socket.IO file: ${err.message}`);
          response.writeHead(500);
          response.end('Error loading Socket.IO file');
          return;
        }
        
        const mimeType = mime.getType(socketIOPath) || 'application/javascript';
        console.log(`[HTTP] Serving Socket.IO file as ${mimeType}`);
        response.writeHead(200, {'Content-Type': mimeType});
        response.end(content);
      });
    });
    return;
  }
  
  // Handle other static files
  const filePath = path.join(htmlDir, request.url);
  
  // Security check to prevent directory traversal
  if (!filePath.startsWith(htmlDir + path.sep) && !filePath.startsWith(htmlDir)) {
    console.error(`[ERROR] Invalid path requested: ${request.url}`);
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }
  
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      console.error(`[ERROR] File not found: ${filePath}`);
      response.writeHead(404);
      response.end('Not Found');
      return;
    }
    
    fs.readFile(filePath, (err, content) => {
      if (err) {
        console.error(`[ERROR] Failed to read file ${filePath}: ${err.message}`);
        response.writeHead(500);
        response.end('Error loading file');
        return;
      }
      
      const mimeType = mime.getType(filePath) || 'application/octet-stream';
      console.log(`[HTTP] Serving ${request.url} as ${mimeType}`);
      response.writeHead(200, {'Content-Type': mimeType});
      response.end(content);
    });
  });
});

console.log('Starting TermKit server on port 2222');
server.listen(2222, () => {
  console.log('TermKit server is running at http://localhost:2222');
});

// Set up WebSocket and handlers.
var ioServer = new Server(server, {
  cors: {
    origin: ["http://localhost:2222", "http://127.0.0.1:2222"],
    methods: ["GET", "POST"],
    credentials: true
  }
}); 
ioServer.on('connection', function (client) {
  console.log('[Socket.IO] New client connected');
  var p = new router.router(client);
});

// Log uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('[ERROR] Uncaught exception:', err);
});
