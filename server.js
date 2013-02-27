/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

var express = require("express"),
    https   = require("https"),
    crypto  = require("crypto"),
    Client  = require("node-xmpp").Client,
    nxb     = require("node-xmpp-bosh"),
    app     = express();

var port = process.env.PORT || 5000;

if (!process.env.AUDIENCE)
  throw('need a proper audience');
var audience = process.env.AUDIENCE;

app.use(express.bodyParser());
app.use(express.cookieParser("thisistehsecret"));
app.use(express.session());
app.use(express.static(__dirname + "/static"));

var users = {}

app.post("/login", function(req, res) {
  if (req.session.user) {
    console.log("User session for " + req.session.user + " already created!");
    res.send(200, JSON.stringify(users[req.session.user]));
    return;
  }
  if (!req.body.assertion) {
    res.send(500, "Invalid login request");
    return;
  }

  verifyAssertion(req.body.assertion, audience, function(val) {
    if (val) {
      finishLogin(val);
    } else {
      res.send(401, "Invalid Persona assertion");
    }
  });

  function finishLogin(email) {
    req.session.regenerate(function() {
      console.log("Creating user session for " + email);
      users[email] = users[email] || {};
      req.session.user = email;
      res.send(200, JSON.stringify(users[email]));
    });
  }
});

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
  var jid = req.session.user.split('@')[0] + '@xmpp.lo';
  var password = crypto.randomBytes(16).toString('hex');
  var xmpp = new Client({jid: jid, password: password, register: true});

  function finishProvisioning() {
    var credentials = {
      xmppProvider: {
        jid: jid,
        password: password
      }
    };
    users[req.session.user] = credentials;
    res.send(200, JSON.stringify(credentials));
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

function verifyAssertion(ast, aud, cb) {
  var data = "audience=" + encodeURIComponent(aud);
  data += "&assertion=" + encodeURIComponent(ast);

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
        cb(false);
        return;
      }
      if (val.status == "okay") {
        cb(val.email);
      } else {
        console.log(data);
        console.log(val);
        cb(false);
      }
    });
  });

  req.write(data);
  req.end();
}
