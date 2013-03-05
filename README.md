WebRTC Provider
===============

Getting started
---------------

To try this code on your local machine you will need to have an xmpp
server. [Prosody](http://prosody.im/) is a good choice for
developement purpose. Once you have an XMPP server you should create a
few users and add them in their respective roster via an xmpp client.

Then, checkout the code, install the dependencies and run the server:

    $ git clone https://github.com/tOkeshu/webrtc-provider.git
    $ cd webrtc-provider
    $ npm install
    $ node server.js

and open your browser at http://localhost:5000/

### production

    $ npm install -g forever # install forever system wide
    $ cd webrtc-provider
    $ env AUDIENCE="example.com" XMPP_DOMAIN="example.com" forever -o logs/stdout.log -e logs/stderr.log start server.js
    $ forever stop server.js

### tests

To run the tests visit http://localhost:5000/tests/

License
-------

All source code here is available under the
[MPL 2.0](https://mozilla.org/MPL/2.0/) license, unless otherwise
indicated.

