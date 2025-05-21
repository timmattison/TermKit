(function ($) {

/**
 * NodeKit client.
 */
var tc = termkit.client = function () {
  var that = this;
  
  // Keep track of sessions.
  this.sessions = {};
  
  // Set up event handlers.
  this.onConnect = function () {};
  this.onDisconnect = function () {};
  this.onError = function () {};

  // Open socket to back-end.
  var host = window.location.hostname || 'localhost';
  console.log("Connecting to Socket.IO server at http://" + host + ":2222");
  var s = this.socket = io('http://' + host + ':2222', {
    reconnectionAttempts: 5,
    timeout: 10000, // Increase timeout to 10s
  });
  
  // Use shared protocol handler with back-end.
  this.protocol = new termkit.protocol(this.socket, this);
  
  s.on('connect', function () {
    console.log("Socket.IO connected successfully");
    that.onConnect();
  }); 
  
  s.on('disconnect', function() {
    console.log("Socket.IO disconnected");
    that.onDisconnect();
  }); 
  
  s.on('connect_error', function(error) {
    console.error("Socket.IO connection error:", error);
    that.onError(error);
  });
  
  s.on('connect_timeout', function() {
    console.error("Socket.IO connection timeout");
    that.onError("Connection timeout");
  });
  
  s.on('error', function(error) {
    console.error("Socket.IO error:", error);
    that.onError(error);
  });
};

tc.prototype = {
  
  add: function (session) {
    console.log("Adding client session:", session.id);
    this.sessions[session.id] = session;
  },
  
  remove: function (session) {
    console.log("Removing client session:", session.id);
    delete this.sessions[session.id];
  },

  dispatch: function (message) {
    console.log("Client dispatch:", message);
    
    if (message.query) {
      // client doesn't support queries.
      console.log("Client doesn't support queries, ignoring");
      return;
    }
  
    // must be regular viewstream message.
    if (message.session) {
      var session = this.sessions[message.session];
      if (session) {
        console.log("Dispatching to session:", message.session, message.method);
        session.dispatch(message.method, message.args);
      } else {
        console.error("Session not found:", message.session);
      }
    }
  },

  // Invoke a method on the server.
  query: function (method, args, session, callback) {
    console.log("Client query:", method, session);
    this.protocol.query(method, args, { session: session }, callback);
  },

  // Send a notification message.
  notify: function (method, args, session) {
    console.log("Client notify:", method, session);
    this.protocol.notify(method, args, { session: session });
  },

};

})(jQuery);

