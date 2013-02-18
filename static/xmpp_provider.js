(function(window) {
    XMPPProvider = function(options) {
        EventEmitter.apply(this);

        this.webrtc = new WebRTCDialer(options.webrtc);
        this.xmpp = new Lightstring.Connection('ws://' + document.location.hostname + ':5280');
        this.xmpp.load('DIGEST-MD5', 'presence', 'im', 'roster', 'webrtc');
        this._setup();
    };

    XMPPProvider.prototype = EventEmitter.extend();

    XMPPProvider.prototype._setup = function() {
        var that = this;

        this.xmpp.on('presence', function(stanza) {
            if (stanza.attrs.type)
                return;

            var jid = new Lightstring.JID(stanza.attrs.from).toBare();
            that.emit('presence', {id: stanza.attrs.from, pseudo: jid.toString()}, "on");
        });

        this.xmpp.on('iq', function(stanza) {
            if (!stanza.getChild('offer'))
                return;

            var offer = JSON.parse(stanza.getChild('offer').text());
            that.webrtc.accept(stanza, offer);
        });

        this.xmpp.on('connected', function(stanza) {
            that.xmpp.roster.get(null, function(stanza) {
                var n = stanza.roster.contacts.length;
                var roster = [];

                for (var i = 0; i < n; i++) {
                    var contact = stanza.roster.contacts[i];
                    roster.push(contact.jid)
                }

                that.emit('contact-list', roster);
                that.xmpp.presence.send();
            });
        });

        var oldEmit = this.xmpp.emit;
        this.xmpp.emit = function() {
            console.log(arguments);
            oldEmit.apply(that.xmpp, arguments);
        }

        // WebRTC Transport

        this.webrtc.on('call', function(to, offer) {
            var iq = Lightstring.stanzas.webrtc.offer(to, offer);
            that.xmpp.send(iq, function(stanza) {
                var answer = JSON.parse(stanza.getChild('answer').text());
                that.webrtc.answer(answer);
            });
        });

        this.webrtc.on('accept', function(stanza, answer) {
            var iq = Lightstring.stanzas.webrtc.answer(stanza.attrs.from, answer);
            iq.attrs.id = stanza.attrs.id;
            that.xmpp.send(iq);
        });

        this.webrtc.on('stream', function(stream, type, remote) {
            that.emit('stream', stream, type, remote);
        });
    };

    XMPPProvider.prototype.connect = function(credentials) {
        this.xmpp.connect(credentials.jid, credentials.pass);
    };

    XMPPProvider.prototype.call = function(who) {
        this.webrtc.call(who);
    };

    window.XMPPProvider = XMPPProvider;
}(window));


