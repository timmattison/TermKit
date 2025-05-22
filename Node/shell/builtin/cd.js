const path = require('path');
var view = require('view/view'),
    expandPath = require(path.join(__dirname, '..', '..', 'misc')).expandPath;

exports.main = function (tokens, pipes, exit, environment) {

  var out = new view.bridge(pipes.viewOut);
  
  // Validate syntax.
  if (tokens.length > 2) {
    out.print('Usage: cd [dir]');
    return exit(false);
  }
  var dirPath = tokens[1] || '~';
  
  // Complete path
  expandPath(dirPath, function (expandedPath) {
    // Try to change working dir.
    try {
      process.chdir(expandedPath);
      
      // Send notification to update parent process working directory
      pipes.viewOut('shell.updatecwd', { 
        cwd: process.cwd() 
      });
      
      exit(true);
    }
    catch (error) {
      out.print(error.message + ' (' + expandedPath + ')');
      return exit(false);
    }
  }); // expandPath
};
