/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

var express = require("express"),
    app     = express();

var port = process.env.PORT || 5000;

app.use(express.static(__dirname + "/static"));
app.listen(port, function() {
    console.log("Port is " + port);
});

