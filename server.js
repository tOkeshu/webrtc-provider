/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

var express = require("express"),
    https   = require("https"),
    crypto  = require("crypto"),
    Client  = require("node-xmpp").Client,
    nxb     = require("node-xmpp-bosh"),
    utils   = require('./utils'),
    User    = require('./user').User,
    Promise = utils.Promise,
    partial = utils.partial,
    app     = express();

var port = process.env.PORT || 5000;

if (!process.env.AUDIENCE)
  throw('need a proper audience');

app.use(express.bodyParser());
app.use(express.cookieParser("thisistehsecret"));
app.use(express.session());
app.use(express.static(__dirname + "/static"));

app.post("/login", function(req, res) {
    if (req.session.user) {
        sendCredentials(req.session.user, res);
        return;
    }

    if (!req.body.assertion) {
        invalidLoginRequest(res);
        return;
    }

    var invalidAssertion = partial(invalidPersonaAssertion, res);
    var attachUser = partial(attachUserSession, req, res);

    verifyAssertion(req.body.assertion)
        .then(User.findOrCreate, invalidAssertion)
        .then(attachUser);
});

function sendCredentials(uid, res) {
    User.find(uid).success(function(user) {
        res.send(200, JSON.stringify(user.credentials()));
    });
}

function invalidLoginRequest(res) {
    res.send(400, "Invalid login request");
}

function invalidPersonaAssertion(res) {
    res.send(400, "Invalid Persona assertion");
}

function attachUserSession(req, res, user) {
    req.session.regenerate(function() {
        req.session.user = user.id;
        res.send(200, user.credentials());
    });
}

app.post("/logout", function(req, res) {
  if (!req.session.user) {
    console.log(JSON.stringify(req.session) + " " + req.session.user);
    if (res) {
      console.log("Denying logout");
      res.send(401, "No user currently logged in");
    }
    return;
  }

  req.session.destroy(function() {
    var user = req.session.user;
    console.log("Logging out " + user);
    if (res)
      res.send(200);
  });
});

app.post('/provisioning', function(req, res) {
  User.find(req.session.user).success(function(user) {
      var jid = user.email.split('@')[0] + '@xmpp.lo';
      var password = crypto.randomBytes(16).toString('hex');
      var xmpp = new Client({jid: jid, password: password, register: true});

      function finishProvisioning() {
          var credentials = {
              xmppProvider: {
                  jid: jid,
                  password: password
              }
          };

          user.jid = jid;
          user.password = password;
          user.save()
          res.send(200, JSON.stringify(user.credentials()));
          xmpp.end();
      }

      xmpp.on('online', finishProvisioning);
      xmpp.on('error', function(err) {
          if (err.message == "Registration error")
              finishProvisioning();
          else
              throw err;
      });
  });
});

app.listen(port, function() {
    console.log("Port is " + port);
});

var bosh_server = nxb.start_bosh({
  port: 5280,
  host: '0.0.0.0',
  path: '/http-bind/',
  logging: 'INFO'
});
nxb.start_websocket(bosh_server);

function verifyAssertion(assertion) {
  var promise = new Promise;
  var data = "audience=" + encodeURIComponent(audience);
  data += "&assertion=" + encodeURIComponent(assertion);

  var options = {
    host: "verifier.login.persona.org",
    path: "/verify",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": data.length
    }
  };

  var req = https.request(options, function(res) {
    var ret = "";
    res.on("data", function(chunk) {
      ret += chunk;
    });
    res.on("end", function() {
      try {
        var val = JSON.parse(ret);
      } catch(e) {
        promise.err();
      }
      if (val.status == "okay") {
        promise.done(val.email);
      } else {
        console.log(data);
        console.log(val);
        promise.err();
      }
    });
  });

  req.write(data);
  req.end();
  return promise;
}
