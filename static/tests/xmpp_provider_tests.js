module( "XMPPProvider" );

test("it should be an EventEmitter instance", function() {
    var provider = new XMPPProvider({webrtc: {video: true, fake: true}});
    ok(provider.on !== undefined, "XMPPProvider has a on method");
});

asyncTest("it should emit a presence", function() {
    expect(1);

    var provider = new XMPPProvider({webrtc: {video: true, fake: true}});
    var stanza = new Lightstring.Stanza('<presence from="someone@xmpp.example.com/resource"/>');
    provider.on('presence', function(who, type) {
        deepEqual(who, {id: "someone@xmpp.example.com/resource", pseudo: "someone@xmpp.example.com"});
        start();
    });
    provider.xmpp.emit("presence", stanza);
});

asyncTest("it should reply with an sdp iq", function() {
    var provider = new XMPPProvider({webrtc: {video: true, fake: true}});
    provider.webrtc.pc.createOffer(function(offer) {
        provider.xmpp.send = function sendMock(iq) {
            var answer = JSON.parse(iq.getChild('answer').text());
            equal(answer.type, 'answer');
            start();
        };

        var stanza = Lightstring.stanzas.webrtc.offer("someone@xmpp.example.com/resource", offer);
        provider.xmpp.emit('iq', stanza);
    });
});

asyncTest("once connected it should retrieve the roster and send a presence", function() {
    var provider = new XMPPProvider({webrtc: {video: true, fake: true}});

    provider.xmpp.roster.get = function rosterMock(a, callback) {
        var stanza = {roster: {contacts: [{jid: "someone@xmpp.example"}]}};
        callback(stanza);
    };
    provider.xmpp.presence.send = function presenceMock() {
        ok(true, "a presence has been sent");
    };

    provider.on('contact-list', function(roster) {
        ok(true, "a contact-list event has been fired");
        deepEqual(roster, ["someone@xmpp.example"]);
        start();
    });
    provider.xmpp.emit('connected');
});

module( "XMPPProvider WebRTC transport" );

asyncTest("it should send an iq and wait for the response", function() {
    expect(2);

    var provider = new XMPPProvider({webrtc: {video: true, fake: true}});

    provider.webrtc.pc.createOffer(function(offer) {
        provider.xmpp.send = function sendMock(iq, callback) {
            equal(iq.toString(),
                  Lightstring.stanzas.webrtc.offer("someone@xmpp.example.com/resource", offer).toString(),
                  "The iq sent is well formed");

            var stanza = new Element("iq").c("answer").t(JSON.stringify({type: "answer"})).up();;
            callback(stanza);
        };

        provider.webrtc.answer = function(answer) {
            equal(answer.type, "answer", "the answer has been accepted");
            start();
        };

        provider.webrtc.emit('call', "someone@xmpp.example.com/resource", offer);
    });
});

asyncTest("it should reply back by a result iq", function() {
    expect(1);

    var provider = new XMPPProvider({webrtc: {video: true, fake: true}});

    provider.xmpp.send = function sendMock(iq) {
        var expected = Lightstring.stanzas.webrtc.answer("someone@xmpp.example.com/resource", {type: "answer"});
        equal(iq.toString(), expected.toString(), "the iq is well formed");
        start();
    };

    var stanza = {attrs: {from: "someone@xmpp.example.com/resource"}};
    provider.webrtc.emit("accept", stanza, {type: "answer"});
});
