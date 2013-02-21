$(document).ready(function () {
  var provider = new XMPPProvider({webrtc: {video: true, audio: true}});

  $('form').submit(function() {
    var jid = $('#jid').val();
    var pass = $('#pass').val();
    provider.connect({jid: jid, pass: pass});
    return false;
  });

  provider.on('contact-list', function(roster) {
    var n = roster.length;
    for (var i = 0; i < n; i++) {
      $('#contacts ul')
        .append('<li data-jid="' + roster[i] + '">' + roster[i] + '</li>');
    }
  });

  provider.on('presence', function(who, type) {
    var link = $('<a>' + who.pseudo + '</a>');

    if (type === "available")
      link.attr("href", "#").click(function() { provider.call(who.id); });
    $('#contacts ul li[data-jid="' + who.pseudo + '"]').html(link);
  });

  provider.on('stream', function(stream, type, remote) {
    var video = remote ? $("#remoteVideo")[0] : $("#localVideo")[0];
    video.mozSrcObject = stream;
    video.play();
  });
});

