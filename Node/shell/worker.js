// Modern Node.js module resolution
const path = require('path');

// Add module search paths
const currentDir = __dirname;
const parentDir = path.join(__dirname, '..');

var processor = require(path.join(currentDir, 'processor'));

// Change to home directory.
process.chdir(process.env.HOME);

// Set up processor.
var p = new processor.processor(process.openStdin(), process.stdout);
