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
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000, // Increase timeout to 20s
  });
  
  // Use shared protocol handler with back-end.
  if (!termkit.protocol || typeof termkit.protocol !== 'function') {
    console.error("termkit.protocol constructor not found, initializing fallback");
    // Define a local protocol constructor if the shared one isn't available
    termkit.protocol = function(connection, handler, autoconnect) {
      this.connection = connection;
      this.handler = handler;
      
      var that = this;
      connection.on('message', function(data) {
        that.receive(data);
      });
      
      this.send = function(message) {
        console.log("Sending message:", message);
        connection.emit('message', message);
      };
      
      this.receive = function(message) {
        console.log("Received message:", message);
        handler.dispatch(message);
      };
      
      this.notify = function(method, args, meta) {
        meta = meta || {};
        if (method) meta.method = method;
        if (args) meta.args = args;
        this.send(meta);
      };
      
      this.query = function(method, args, meta, callback) {
        meta = meta || {};
        meta.query = Math.floor(Math.random() * 10000);
        
        connection.callbacks = connection.callbacks || {};
        connection.callbacks[meta.query] = callback;
        
        this.notify(method, args, meta);
      };
    };
  }
  
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

