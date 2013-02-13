var pc = new mozRTCPeerConnection();
pc.onaddstream = function(obj) {
  var type = obj.type;
  if (type == "video") {
    var video = $("#remoteVideo")[0];
    video.mozSrcObject = obj.stream;
    video.play();
  } else if (type == "audio") {
    var audio = $("#remoteAudio")[0];
    audio.mozSrcObject = obj.stream;
    audio.play();
  } else {
    alert("sender onaddstream of unknown type, obj = " + obj.toSource());
  }
};

function log(msg) {
  $('#log').append('<div></div>').append(document.createTextNode(msg));
}

$(document).ready(function () {
  var xmpp = new Lightstring.Connection('ws://' + document.location.hostname + ':5280');
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

    var offer = JSON.parse(stanza.getChild('offer').text());
    navigator.mozGetUserMedia({video: true, audio: true}, function(stream) {
      var video = $("#localVideo")[0];
      video.mozSrcObject = stream;
      video.play();
      pc.addStream(stream);
      pc.setRemoteDescription(offer, function() {
        pc.createAnswer(function(answer) {
          pc.setLocalDescription(answer, function() {
            answer = JSON.stringify(answer);
            var iq = '<iq from="' + xmpp.jid + '" to="' + stanza.attrs.from +'" type="result" id="' + stanza.attrs.id + '">' +
                       '<answer xmlns="webrtc:iq:sdp">' +
                         answer +
                       '</answer>' +
                     '</iq>'
            xmpp.send(iq);
          }, function(err) { alert("setLocalDescription failed: " + err) });
        }, function(err) { alert("createAnswer failed: " + err); });
      }, function(err) { alert("setRemoteDescription failed: " + err); });
    }, function(err) { alert("getUserMedia failed: "  + err); });
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
  navigator.mozGetUserMedia({video: true, audio: true}, function(stream) {
    var video = $("#localVideo")[0];
    video.mozSrcObject = stream;
    video.play();
    pc.addStream(stream);
    pc.createOffer(function(offer) {
      pc.setLocalDescription(offer, function() {
        var iq = '<iq from="' + xmpp.jid + '" to="' + to +'" type="set">' +
                   '<offer xmlns="webrtc:iq:sdp">' +
                     JSON.stringify(offer) +
                   '</offer>' +
                 '</iq>';

        xmpp.send(iq, function(stanza) {
          var answer = JSON.parse(stanza.getChild('answer').text());
          pc.setRemoteDescription(answer, function() {});
        });

      }, function(err) { alert("setLocalDescription failed: " + err) });
    }, function(err) { alert("createOffer failed: " + err); });
  }, function(err) { alert("getUserMedia failed: "  + err); });
}

