(function(window) {

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

    WebRTCDialer.prototype.call = function() {
        var that = this;
        var args = Array.slice(arguments);

        this._getMedia(this.options, function() {
            that.pc.createOffer(function(offer) {
                that.pc.setLocalDescription(offer, function() {
                    args.push(offer);
                    args.unshift('call');
                    that.emit.apply(that, args);
                }, function(err) { alert("setLocalDescription failed: " + err); });
            }, function(err) { alert("createOffer failed: " + err); });
        });
    };

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
                        that.emit.apply(that, args);
                    }, function(err) { alert("setLocalDescription failed: " + err); });
                }, function(err) { alert("createAnswer failed: " + err); });
            }, function(err) { alert("setRemoteDescription failed: " + err); });
        });
    };

    WebRTCDialer.prototype.answer = function(answer) {
        var that = this;

        this.pc.setRemoteDescription(answer, function() {
            that.emit('accepted');
        }, function(err) { alert("setRemoteDescription failed: " + err); });
    };

    window.WebRTCDialer = WebRTCDialer;
}(window));


