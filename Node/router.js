const path = require('path');
var shell = require(path.join(__dirname, 'shell'));
var returnMeta = require(path.join(__dirname, 'misc')).returnMeta;
var protocol = require(path.join(__dirname, '..', 'Shared', 'protocol'));

/**
 * Processes incoming messages on a connection, routes them to active sessions.
 */
exports.router = function (connection) {
  var that = this;
  console.log('[Router] Creating new router instance');

  // Create a Socket.IO connection wrapper for protocol
  var connectionWrapper = {
    on: function(event, callback) {
      if (event === 'connect') {
        // Socket.IO connection is already established
        setTimeout(callback, 0);
      } else {
        connection.on(event, callback);
      }
    },
    emit: function(event, data) {
      // Make sure connection is still active before emitting
      if (connection && connection.connected) {
        connection.emit(event, data);
      } else {
        console.error('[Router] Attempted to emit on disconnected socket');
      }
    },
    disconnect: function() {
      if (connection && connection.connected) {
        connection.disconnect();
      }
    }
  };

  this.protocol = new protocol.protocol(connectionWrapper, this, true);

  this.sessions = {};
  this.counter = 1;
  
  // Ping interval to keep the connection alive
  this.pingInterval = setInterval(function() {
    if (connection && connection.connected) {
      connection.emit('ping', { timestamp: Date.now() });
    } else {
      clearInterval(that.pingInterval);
    }
  }, 30000); // 30 second ping

  // Log disconnect events
  connection.on('disconnect', function() {
    console.log('[Router] Client disconnected');
    clearInterval(that.pingInterval);
    that.disconnect();
  });
  
  // Handle errors
  connection.on('error', function(error) {
    console.error('[Router] Socket.IO error:', error);
  });
};

exports.router.prototype = {
  
  dispatch: function (message) {
    console.log(`[Router] Dispatching message: ${message.method}`);
    
    // Look up session.
    var that = this,
        session = message.session && this.getSession(message.session);
        returned = false,
    
      // Define convenient answer callback.
        exit = function (success, object, meta) {
          if (!returned) {
            meta = meta || {};
            meta.session = message.session;
            meta.success = success;
            
            console.log(`[Router] Responding to ${message.method} with success=${success}`);
            that.protocol.answer(message.query, object, meta);
            returned = true;
          }
        };

    // Find handler.
    var handler = exports.handlers[message.method];
    if (handler) {
      console.log(`[Router] Found handler for ${message.method}`);
      handler.call(this, session, message.query, message.args || {}, exit);
      return;
    }
    
    if (!session) {
      console.error(`[Router] No session found for ID: ${message.session}`);
      exit(false, null, { error: 'Session not found' });
      return;
    }
    
    // Else forward to session.
    console.log(`[Router] Forwarding ${message.method} to session ${message.session}`);
    session.dispatch(message.query, message.method, message.args || {}, exit);
    
  },
  
  forward: function (message) {
    console.log('[Router] Forwarding message to client');
    this.protocol.notify(null, null, message);
  },

  disconnect: function () {
    console.log('[Router] Disconnecting and cleaning up sessions');
    // Clean up interval if it exists
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    
    // Close all sessions properly
    for (var i in this.sessions) {
      try {
        console.log(`[Router] Closing session ${i}`);
        this.sessions[i].close();
      } catch (e) {
        console.error(`[Router] Error closing session ${i}:`, e);
      }
    }
    
    // Clear all sessions
    this.sessions = {};
    
    // Clear protocol reference
    this.protocol = null;
  },

  getSession: function (id) {
    for (i in this.sessions) {
      if (i == id) return this.sessions[id];
    }
    
    console.log(`[Router] Session ${id} not found`);
    return null;
  },
  
  addSession: function (session) {
    var id = session.id = this.counter++;
    this.sessions[id] = session;
    console.log(`[Router] Added new session with ID: ${id}`);
  },

  removeSession: function (session) {
    console.log(`[Router] Removing session with ID: ${session.id}`);
    delete this.sessions[session.id];
  },
};

/**
 * Method handlers.
 */
exports.handlers = {
  'session.open.shell': function (session, query, args, exit) {
    console.log('[Router] Opening new shell session');
    try {
      var session = new shell.shell(args, this);
      this.addSession(session);
      exit(true, { session: session.id });
    }
    catch (e) {
      console.error('[Router] Error opening shell session:', e);
      exit(false);
    }
  },
  
  'session.close': function (session, query, args, exit) {
    if (session) {
      console.log(`[Router] Closing session ${session.id}`);
      session.close();
      this.removeSession(session);
      exit(true);
    }
    else {
      console.error('[Router] Attempted to close non-existent session');
      exit(false);
    }
  },
};
