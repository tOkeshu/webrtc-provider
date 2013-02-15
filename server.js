/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

var express = require("express"),
    nxb     = require("node-xmpp-bosh"),
    app     = express();

var port = process.env.PORT || 5000;

app.use(express.static(__dirname + "/static"));
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

