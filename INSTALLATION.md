# TermKit Installation and Usage Guide

This guide explains how to install and run the updated version of TermKit that works with modern NodeJS (v14+).

## Prerequisites

- [Node.js](https://nodejs.org/) version 14 or higher
- Git

## Installation Steps

1. Clone the TermKit repository:
   ```bash
   git clone https://github.com/timmattison/TermKit.git
   cd TermKit
   ```

2. Install dependencies using npm:
   ```bash
   npm install
   ```
   This will install the required dependencies:
   - socket.io (v4.7.2)
   - socket.io-client (v4.7.2)
   - mime (v3.0.0)

## Running TermKit

TermKit consists of two components:
1. The Node.js backend (server)
2. The frontend client (WebKit app)

### Starting the Server

You can start the NodeKit daemon by running:
```bash
npm start
```
or
```bash
node Node/nodekit.js
```

This will start the server on port 2222.

### Running the Client

Depending on your operating system:

#### Mac:
* Unzip and run the Mac app in Build/TermKit.zip

#### Linux:
* See Linux/Readme.txt for Linux-specific instructions

#### Using a Browser:
You can also access TermKit in a WebKit-based browser (Chrome, Safari) by:
1. Make sure the Node.js server is running
2. Navigate to `http://localhost:2222` in your browser

*Tip:* Press ⌥⌘C (Option+Command+C) to access the WebKit console for debugging.

## Development and Testing

To run the test script:
```bash
npm test
```

## Troubleshooting

* If you encounter socket connection issues, make sure the server is running and listening on port 2222
* Check that all dependencies were correctly installed with `npm install`
* For browser-based usage, ensure you're using a WebKit-compatible browser
* Check the server console logs for detailed diagnostic information about:
  - HTTP requests (`[HTTP]` prefix)
  - Socket.IO connections (`[Socket.IO]` prefix)
  - Router operations (`[Router]` prefix)
  - Any errors (`[ERROR]` prefix)
* Browser console logs will also provide detailed information about client-side errors
* If the browser shows a blank page or hangs, check the server logs for connection issues
* If a specific error message is displayed, refer to the error details for troubleshooting guidance