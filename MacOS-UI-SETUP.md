# Setting up the Latest UI for TermKit MacOS App

To get the latest UI working in the MacOS app, you need to ensure the Node.js backend is running and properly configured. The MacOS app acts as a WebView wrapper around the HTML UI, which connects to a Node.js server.

## Prerequisites

- Node.js 14+ installed on your system
- Latest repository code checked out
- Xcode installed (for building the MacOS app)

## Steps to Get the Latest UI

1. **Install Node.js dependencies**

   ```bash
   cd /path/to/TermKit
   npm install
   ```

   This will install all required dependencies, including `socket.io` and `socket.io-client` which are essential for communication.

2. **Start the Node.js server**

   ```bash
   npm start
   ```

   This will start the Node.js server on port 2222. You should see output like:
   ```
   Starting TermKit server on port 2222
   TermKit server is running at http://localhost:2222
   ```

3. **Build and run the MacOS app**

   Open the Xcode project:
   ```bash
   cd /path/to/TermKit/Cocoa/TermKit
   open TermKit.xcodeproj
   ```

   Then build and run the project in Xcode.

4. **How it works**

   - When you build the MacOS app, it includes the HTML UI files from the HTML directory
   - The app connects to the locally running Node.js server on port 2222
   - The Node.js server serves the latest UI files and handles the WebSocket communication
   - The socket.io client files are copied from node_modules to the app bundle during build

## Troubleshooting

- If you see only the old UI or no UI at all, make sure:
  - The Node.js server is running before you launch the MacOS app
  - There are no errors in the Xcode console
  - The socket.io-client directory exists in node_modules (run `npm install` if needed)

- If you get connection errors:
  - Check if the Node.js server is running on port 2222
  - Verify there are no firewall restrictions blocking localhost connections

## Development Workflow

When making UI changes:

1. Modify the HTML/CSS/JS files in the HTML directory
2. For immediate testing, refresh the browser at http://localhost:2222
3. For testing in the MacOS app, rebuild the app in Xcode to include your changes

Remember that the MacOS app is essentially wrapping the web UI, so keeping the Node.js server running is essential for the app to function properly.