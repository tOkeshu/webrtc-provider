(function(window) {
  /**
    A Service Provider Adapter based on XMPP
    @class XMPPProvider
    @constructor
  **/
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
      var type = "available";

      if (stanza.attrs.type)
        if (stanza.attrs.type != "unavailable")
          return;
        else
          type = "unavailable";

      var jid = new Lightstring.JID(stanza.attrs.from).toBare();

      /**
        Fired when the SPA receive a presence notification
        @event presence
        @param {object} who
          @param {string} who.nick
          @param {string} who.jid
      **/
      that.emit('presence', {id: stanza.attrs.from, pseudo: jid.toString()}, type);
    });

    this.xmpp.on('iq', function(stanza) {
      if (!stanza.getChild('offer'))
        return;

      var offer = JSON.parse(stanza.getChild('offer').text());
      that.webrtc.accept(stanza, offer);
    });

    this.xmpp.on('connected', function(stanza) {
      /**
        Fired when the SPA is connected to the XMPP server
        @event connected
      **/
      that.emit('connected');
      that.xmpp.roster.get(null, function(stanza) {
        var n = stanza.roster.contacts.length;
        var roster = [];

        for (var i = 0; i < n; i++) {
          var contact = stanza.roster.contacts[i];
          roster.push(contact.jid);
        }

        /**
          Fired when the SPA retrieve the roster
          @event contact-list
          @param {Array} contacts
        **/
        that.emit('contact-list', roster);
        that.xmpp.presence.send();
      });
    });

    var oldEmit = this.xmpp.emit;
    this.xmpp.emit = function() {
      console.log(arguments);
      oldEmit.apply(that.xmpp, arguments);
    };

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

  /**
    Connect the SPA to the XMPP server

    @method connect
    @param {Object} credentials xmpp credentials
       @param {String} credentials.jid
       @param {String} credentials.pass
  **/
  XMPPProvider.prototype.connect = function(credentials) {
    this.xmpp.connect(credentials.jid, credentials.pass);
  };

  /**
    Call someone

    @method call
    @param {Object} who a jid to call via WebRTC
  **/
  XMPPProvider.prototype.call = function(who) {
    this.webrtc.call(who);
  };

  window.XMPPProvider = XMPPProvider;
}(window));

