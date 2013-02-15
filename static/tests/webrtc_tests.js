module( "WebRTCDialer" );

test("it should be an EventEmitter instance", function() {
    var webrtc = new WebRTCDialer();
    ok(webrtc.on !== undefined, "WebRTCDialer has a on method");
});

asyncTest("it should capture the video and fire an strema event", function() {
    expect(4);

    var webrtc = new WebRTCDialer();
    webrtc._getMedia({video: true, fake: true}, function() {});
    webrtc.on("stream", function(stream, type, remote) {
        ok(true, "A stream event has been fired");
        ok(stream instanceof LocalMediaStream, "The stream is correct");
        equal(type, "video", "The stream has the good type");
        equal(remote, false, "It's a local stream");

        start();
    });
});

asyncTest("it should call _getMedia and fire a call event", function() {
    expect(4);

    var webrtc = new WebRTCDialer({video: true, fake: true});
    webrtc._getMedia = function getMediaMock(options, cb) {
        ok(true, "_getMedia has been caled");
        deepEqual(options, {video: true, fake: true}, "_getMedia receives the good options");
        cb();
    };

    webrtc.on("call", function(to, offer) {
        ok(true, "A call event has been fired");
        var args = Array.slice(arguments);
        deepEqual(args, ["someone", offer], "arguments have been forwarded");

        start();
    });

    webrtc.call("someone");
});

asyncTest("it should call _getMedia an fire a accept event", function() {
    expect(4);

    var webrtc = new WebRTCDialer({video: true, fake: true});

    webrtc.on("accept", function(from, answer) {
        var args = Array.slice(arguments);
        ok(true, "An accept event has been fired");
        deepEqual(args, ["someone else", answer], "arguments have been forwarded");

        start();
    });

    webrtc.on("call", function(to, offer) {
        webrtc._getMedia = function getMediaMock(options, cb) {
            ok(true, "_getMedia has been caled");
            deepEqual(options, {video: true, fake: true}, "_getMedia receives the good options");
            cb();
        };
        webrtc.accept("someone else", offer);
    });
    webrtc.call("someone");
});

asyncTest("it should triggers the peer connection and fire an accepted event", function() {
    expect(1);

    var webrtc = new WebRTCDialer({video: true, fake: true});
    var _getMedia = webrtc._getMedia;
    webrtc._getMedia = function getMediaMock(options, callback) {
        callback();
    }

    webrtc.on("call", function(to, offer) {
        webrtc._getMedia = _getMedia;
        webrtc.accept("someone else", offer);
    });
    webrtc.on("accept", function(to, answer) {
        webrtc.answer(answer);
    });
    webrtc.on("accepted", function() {
        ok(true, "An accepted event has been fired");
        start();
    });
    webrtc.call("someone");
});

