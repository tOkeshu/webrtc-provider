WebRTC Provider
===============

Getting started
---------------

To try this code on your local machine you will need to have an xmpp
server. [Prosody](http://prosody.im/) is a good choice for
developement purpose. Once you have an XMPP server you should create a
few users and add them in their respective roster via an xmpp client.

On OS X, you'll need to install libicu:

    $ brew install icu4c
    # ugly workaround from https://github.com/astro/node-stringprep/pull/19/files
    $ ln -s /usr/local/Cellar/icu4c/<VERSION>/bin/icu-config /usr/local/bin/icu-config
    $ ln -s /usr/local/Cellar/icu4c/<VERSION>/include/unicode /usr/local/include

Then, checkout the code, install the dependencies and run the server:

    $ git clone https://github.com/tOkeshu/webrtc-provider.git
    $ cd webrtc-provider
    $ npm install
    $ node server.js

and open your browser at http://localhost:5000/

On OS X, conservative folks will remove the symlinks created earlier:

    $ rm /usr/local/bin/icu-config
    $ ln -s /usr/local/include/unicode

As these links are intentionally not created by the brew formula due to known
issues.

### production

    $ npm install -g forever # install forever system wide
    $ cd webrtc-provider
    $ env AUDIENCE="example.com" XMPP_DOMAIN="example.com" forever -o logs/stdout.log -e logs/stderr.log start server.js
    $ forever stop server.js

### tests

To run the tests visit http://localhost:5000/tests/

### doc

To compile the in-code documentation you need `yuidoc`:

    $ npm install -g yuidocjs
    $ yuidoc -T simple .
    $ firefox out/index.html

The rest of the documentation is in `/docs`.

License
-------

All source code here is available under the
[MPL 2.0](https://mozilla.org/MPL/2.0/) license, unless otherwise
indicated.

