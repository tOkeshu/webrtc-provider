$(document).ready(function () {
  var provider = new XMPPProvider({webrtc: {video: true, audio: true}});

  $('form').submit(function() {
    var jid = $('[name="jid"]').val();
    var pass = $('[name="password"]').val();
    provider.connect({jid: jid, pass: pass});
    return false;
  });

  provider.on('connected', function() {
    $('.media').add('.contacts').removeClass('hidden');
    $('.login').addClass('hidden');
  });

  provider.on('contact-list', function(roster) {
    var n = roster.length;
    for (var i = 0; i < n; i++) {
      $('.contacts ul')
        .append('<li data-jid="' + roster[i] + '">' + roster[i] + '</li>');
    }
  });

  provider.on('presence', function(who, type) {
    var contact = $('<button class="btn btn-success disabled">' + who.pseudo + '</a>');

    if (type === "available")
      contact.removeClass("disabled").click(function() { provider.call(who.id); });
    $('.contacts ul li[data-jid="' + who.pseudo + '"]').html(contact);
  });

  provider.on('stream', function(stream, type, remote) {
    var video = remote ? $("#remote-video")[0] : $("#local-video")[0];
    video.mozSrcObject = stream;
    video.play();
  });
});

