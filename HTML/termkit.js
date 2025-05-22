var termkit = window.termkit || {};

(function ($) {
  
///////////////////////////////////////////////////////////////////////////////
  
$(document).ready(function () {
  console.log("TermKit Initializing...");

  try {
    var client = new termkit.client();
    var shellCreated = false;
    
    client.onConnect = function () {
      console.log("Connected to TermKit server");
      try {
        // Only create a new shell if one doesn't exist
        if (!shellCreated) {
          var shell = new termkit.client.shell(client, {}, function (shell) {
            console.log("Shell created successfully");
            shellCreated = true;
            var view = new termkit.commandView(shell);
            $('#terminal').append(view.$element);
            view.newCommand();
          });
        }
      } catch (e) {
        console.error("Error creating shell:", e);
        $('#terminal').append('<div class="error">Error creating shell: ' + e.message + '</div>');
      }
    };
    
    client.onDisconnect = function() {
      console.log("Disconnected from TermKit server");
      $('#terminal').append('<div class="error">Disconnected from server. Please refresh the page to reconnect.</div>');
      
      // Set up auto-reconnect after 5 seconds
      setTimeout(function() {
        window.location.reload();
      }, 5000);
    };
    
    client.onError = function(error) {
      console.error("Socket connection error:", error);
      $('#terminal').append('<div class="error">Connection error: ' + error + '</div>');
    };
  } catch (e) {
    console.error("Error initializing TermKit:", e);
    $('#terminal').append('<div class="error">Error initializing TermKit: ' + e.message + '</div>');
  }
  
  // Remove the alert on mousedown that was probably for debugging
  // $(document).mousedown(function () {
  //   alert('wtf');
  // });
});

})(jQuery);

///////////////////////////////////////////////////////////////////////////////

function asyncCallback(func) {
  return function () { 
    var that = this;
    var args = arguments;
    setTimeout(function () { func.apply(that, args); }, 0);
  };
}

function async(func) {
  var that = this;
  setTimeout(function () { func.call(that); }, 0);
}

function escapeText(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function bug(object, type) {
  $.each(object, function (index) {
    if ($.isFunction(this)) {
      var original = this;
      object[index] = function () {
        console.log(type +'.'+ index);
        console.log(arguments);
        original.apply(this, arguments);
      };
    }
  });
}

function oneOrMany(object) {
  return (typeof object == 'object' && object.constructor == [].constructor) ? object : [ object ];
}

///////////////////////////////////////////////////////////////////////////////

function formatSize(bytes) {
  var suffixes = ['B', 'KB', 'MB', 'GB', 'TB'];
  var limit = 1, cap = 1;
  for (i in suffixes) {
    limit *= 1000;
    if (bytes > limit) {
      cap = limit;
    }
    else {
      return Math.round(bytes / cap * 10) / 10 + ' ' + suffixes[i];
    }
  }
}
