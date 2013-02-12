function log(msg) {
  $('#log').append('<div></div>').append(document.createTextNode(msg));
}

$(document).ready(function () {
  var xmpp = new Lightstring.Connection('ws://localhost:5280');
  xmpp.load('DIGEST-MD5', 'presence', 'im', 'roster');

  xmpp.on('connecting', function(stanza) {
    log('connecting')
  });

  xmpp.on('message', function(stanza) {
    var body = stanza.getChild('body');
    if (body) {
      body = body.text();
      log(stanza.attrs.from + ' : ' + body);
      var reply = Lightstring.stanzas.im.chat(stanza.attrs.from, body);
      xmpp.send(reply);
    }
  });

  xmpp.on('presence', function(stanza) {
    if (stanza.attrs.type)
        return;

    var jid = new Lightstring.JID(stanza.attrs.from).toBare().toString();
    var link = $('<a href="#">' + jid + '</a>').click(function() {
        call(xmpp, stanza.attrs.from);
    });
    $('#contacts ul li[data-jid="' + jid.toString() + '"]').html(link);
  });

  xmpp.on('iq', function(stanza) {
    if (!stanza.getChild('offer'))
      return;
    var offer = stanza.getChild('offer').text();
    var iq = '<iq from="' + xmpp.jid + '" to="' + stanza.attrs.from +'" type="result">' +
               '<answer xmlns="webrtc:iq:sdp">' +
                 offer +
               '</answer>' +
             '</iq>'
    xmpp.send(iq);
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
});

function call(xmpp, to) {
  var offer = 'nothing relevant for now';
  var iq = '<iq from="' + xmpp.jid + '" to="' + to +'" type="set">' +
             '<offer xmlns="webrtc:iq:sdp">' +
               offer +
             '</offer>' +
           '</iq>'
  xmpp.send(iq, function(stanza) {
    var answer = stanza.getChild().text();
    console.log(anwser);
  });
}

