#!/usr/bin/env node
/**
 * Test script to verify server HTTP functionality
 */
const http = require('http');
const url = require('url');

console.log('Testing TermKit server connectivity...');

// Test access to protocol.js
const options = {
  hostname: '127.0.0.1',
  port: 2222,
  path: '/Shared/protocol.js',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response complete.');
    if (res.statusCode === 200) {
      console.log('Protocol.js file was served successfully.');
      console.log(`Received ${data.length} bytes of data.`);
      console.log('First 100 chars:', data.substring(0, 100));
    } else {
      console.error('Failed to load protocol.js file.');
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();

// Test a second request 2 seconds later to ensure server is still running
setTimeout(() => {
  console.log('\nTesting access to index.html...');
  const req2 = http.request({
    hostname: '127.0.0.1',
    port: 2222,
    path: '/',
    method: 'GET'
  }, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log(`Received ${data.length} bytes of data.`);
      console.log('Tests completed.');
    });
  });
  
  req2.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });
  
  req2.end();
}, 2000);