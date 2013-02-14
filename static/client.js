function log(msg) {
  $('#log').append('<div></div>').append(document.createTextNode(msg));
}

$(document).ready(function () {
  var webrtc = new WebRTCDialer({video: true, audio: true});
  var xmpp = new Lightstring.Connection('ws://' + document.location.hostname + ':5280');
  xmpp.load('DIGEST-MD5', 'presence', 'im', 'roster', 'webrtc');

  xmpp.on('connecting', function(stanza) {
    log('connecting')
  });

  xmpp.on('presence', function(stanza) {
    if (stanza.attrs.type)
      return;

    var jid = new Lightstring.JID(stanza.attrs.from).toBare().toString();
    var link = $('<a href="#">' + jid + '</a>').click(function() {
      webrtc.call(stanza.attrs.from);
    });
    $('#contacts ul li[data-jid="' + jid.toString() + '"]').html(link);
  });

  xmpp.on('iq', function(stanza) {
    if (!stanza.getChild('offer'))
      return;

    var offer = JSON.parse(stanza.getChild('offer').text());
    webrtc.accept(stanza, offer);
  });

  xmpp.on('connected', function(stanza) {
    log('connected');
    xmpp.roster.get(null, function(stanza) {
      var n = stanza.roster.contacts.length;
      for (var i = 0; i < n; i++) {
        var contact = stanza.roster.contacts[i];
        var jid = new Lightstring.JID(contact.jid).toBare();
        $('#contacts ul')
          .append('<li data-jid="' + jid.toString() + '">' +
                    jid.toString() +
                  '</li>');
      }
      xmpp.presence.send();
    });
  });

  var oldEmit = xmpp.emit;
  xmpp.emit = function() {
    console.log(arguments);
    oldEmit.apply(xmpp, arguments);
  }

  $('form').submit(function() {
    var jid = $('#jid').val();
    var pass = $('#pass').val();
    xmpp.connect(jid, pass);
    return false;
  });

  // WebRTC Transport

  webrtc.on('call', function(to, offer) {
    var iq = Lightstring.stanzas.webrtc.offer(to, offer);
    xmpp.send(iq, function(stanza) {
        var answer = JSON.parse(stanza.getChild('answer').text());
        webrtc.answer(answer);
    });
  });

  webrtc.on('accept', function(stanza, answer) {
    var iq = Lightstring.stanzas.webrtc.answer(stanza.attrs.from, answer, stanza.attrs.id);
    xmpp.send(iq);
  });

  webrtc.on('stream', function(stream, type, remote) {
    var video = remote ? $("#remoteVideo")[0] : $("#localVideo")[0];
    video.mozSrcObject = stream;
    video.play();
  });

});

