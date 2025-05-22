// Modern Node.js module resolution
const path = require('path');

// Add module search paths
const currentDir = __dirname;
const parentDir = path.join(__dirname, '..');

var processor = require(path.join(currentDir, 'processor'));

// Store the initial working directory
const initialCwd = process.cwd();

// Change to home directory.
try {
  process.chdir(process.env.HOME || process.env.USERPROFILE || '/tmp');
} catch (e) {
  console.error('Error changing to home directory:', e);
  // Fallback to a directory we know exists
  try {
    process.chdir('/tmp');
  } catch (e2) {
    console.error('Error changing to /tmp directory:', e2);
  }
}

// Set up processor.
try {
  var p = new processor.processor(process.openStdin(), process.stdout);
  
  // Notify parent of current working directory on startup
  // This allows the shell to recover the working directory state on restart
  setTimeout(function() {
    if (p && p.notify) {
      p.notify('shell.updatecwd', { cwd: process.cwd() });
    }
  }, 100);
} catch (e) {
  console.error('Error initializing processor:', e);
  // Try to send error back to parent
  try {
    process.stdout.write(JSON.stringify({
      method: 'shell.error',
      args: { error: e.message || 'Unknown error initializing processor' }
    }) + "\u0000");
  } catch (writeErr) {
    console.error('Error sending error message to parent:', writeErr);
  }
}

// Handle errors
process.on('uncaughtException', function(err) {
  console.error('Uncaught exception in worker:', err);
  // Try to send error back to parent
  try {
    process.stdout.write(JSON.stringify({
      method: 'shell.error',
      args: { error: err.message || 'Uncaught exception in worker' }
    }) + "\u0000");
  } catch (writeErr) {
    console.error('Error sending error message to parent:', writeErr);
  }
});
