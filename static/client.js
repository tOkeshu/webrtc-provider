$(document).ready(function () {
  var provider = new XMPPProvider({webrtc: {video: true, audio: true}});
  var contacts = [];

  $('.login img').click(function() {
    navigator.id.request();
    return false;
  });

  $('.provisioning .add-contact').click(function() {
    var input = $(this).siblings('[type="text"]');
    var contact = input.val();
    contacts.push(contact);

    $(this).parent().prepend($('<p>').text(contact));

    return false;
  });

  $('.contacts .add-contact').click(function() {
    var input = $(this).siblings('[type="text"]');
    var contact = input.val();

    provider.subscribe(contact);

    return false;
  });

  $('.provisioning form').submit(function() {
    $.ajax({
      type: 'POST',
      url: '/provisioning',
      success: function(data, status, xhr) {
        var credentials = JSON.parse(data);
        var jid = credentials.xmppProvider.jid;
        var password = credentials.xmppProvider.password;
        provider.connect({jid: jid, pass: password});
      },
      error: function(xhr, status, err) {
        alert('provisioning failed: ' + err);
      }
    });
    return false;
  });

  navigator.id.watch({
    loggedInUser: null,
    onlogin: function(assertion) {
      $.ajax({
        type: 'POST',
        url: '/login',
        data: {assertion: assertion},
        success: function(data, status, xhr) {
          var credentials = JSON.parse(data);
          if (Object.keys(credentials).length) {
            var jid = credentials.xmppProvider.jid;
            var password = credentials.xmppProvider.password;
            provider.connect({jid: jid, pass: password});
          } else {
            $('.login').addClass('hidden');
            $('.provisioning').removeClass('hidden');
          }
        },
        error: function(xhr, status, err) {
          alert("Login failure: " + err);
        }
      });
    },
    onlogout: function() {
      $.ajax({
        type: 'POST',
        url: '/logout',
        success: function(res, status, xhr) {
          window.location.reload();
        },
        error: function(xhr, status, err) {
          alert("Logout failure: " + err);
        }
      });
    }
  });

  provider.on('connected', function() {
    $('.media').add('.contacts').removeClass('hidden');
    $('.login').add('.provisioning').addClass('hidden');

    $.each(contacts, function(i, contact) {
      provider.subscribe(contact);
    });
  });

  provider.on('contact-list', function(roster) {
    $('.contacts ul').html('');

    $.each(roster, function(id, infos) {
      var contact = $('<button class="btn btn-success disabled">' + id + '</a>');

      if (infos.presence === 'available')
        contact.removeClass('disabled');

      $('.contacts ul')
        .append($('<li data-jid="' + id + '">').append(contact));
    });
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

