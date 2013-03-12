(function(window) {
  /**
    Fired when a stream is added to the peer connection
    @event stream
    @param {Object} stream
    @param {String} type "video" or "audio"
    @param {Boolean} remote is the stream remote or not?
  **/

  /**
    A generic component to call someone via webrtc.
    The transport part has to be implemented to fit your needs.

    @class WebRTCDialer
    @constructor
  **/
  WebRTCDialer = function(options) {
    var that = this;
    EventEmitter.apply(this);

    this.pc = mozRTCPeerConnection();
    this.pc.onaddstream = function(obj) {
      that.emit('stream', obj.stream, obj.type, true);
    };

    this.options = options;
  };

  WebRTCDialer.prototype = EventEmitter.extend();

  WebRTCDialer.prototype._getMedia = function(options, callback) {
    var that = this;

    navigator.mozGetUserMedia(options, function(stream) {
      that.pc.addStream(stream);
      that.emit('stream', stream, 'video', false);
      callback();
    }, function(err) { alert("getUserMedia failed: "  + err); });
  };

  /**
    Call someone.
    This method capture the camera/microphone and emit a "call" event.
    It's up to the transport implementation to take care of the signaling.

    @method call
    @param {Any} arg1
    @param {Any} [arg2]
    @param {Any} ...
  **/
  WebRTCDialer.prototype.call = function() {
    var that = this;
    var args = Array.slice(arguments);

    this._getMedia(this.options, function() {
      that.pc.createOffer(function(offer) {
        that.pc.setLocalDescription(offer, function() {
          args.push(offer);
          args.unshift('call');

          /**
            Fired when calling someone
            @event call
          **/
          that.emit.apply(that, args);
        }, function(err) { alert("setLocalDescription failed: " + err); });
      }, function(err) { alert("createOffer failed: " + err); });
    });
  };

  /**
    Accept the call from someone else.
    This method capture the camera/microphone and emit a "accept" event.
    It's up to the transport implementation to take care of the signaling.

    @method call
    @param {Object} offer the offer sent by the caller
    @param {Any} arg1
    @param {Any} [arg2]
    @param {Any} ...
  **/
  WebRTCDialer.prototype.accept = function() {
    var that = this;
    var args = Array.slice(arguments);
    var offer = args.pop();

    this._getMedia(this.options, function() {
      that.pc.setRemoteDescription(offer, function() {
        that.pc.createAnswer(function(answer) {
          that.pc.setLocalDescription(answer, function() {
            args.push(answer);
            args.unshift('accept');


             /**
               Fired when a call has been accepted
               @event accept
             **/
            that.emit.apply(that, args);
          }, function(err) { alert("setLocalDescription failed: " + err); });
        }, function(err) { alert("createAnswer failed: " + err); });
      }, function(err) { alert("setRemoteDescription failed: " + err); });
    });
  };

  /**
    Accept the answer from someone else.
    This method emit an "accepted" event

    @method answer
    @param {Object} answer the answer sent by the callee
  **/
  WebRTCDialer.prototype.answer = function(answer) {
    var that = this;

    this.pc.setRemoteDescription(answer, function() {
      /**
        Fired when an answer has been accepted
        @event accepted
      **/
      that.emit('accepted');
    }, function(err) { alert("setRemoteDescription failed: " + err); });
  };

  window.WebRTCDialer = WebRTCDialer;
}(window));


