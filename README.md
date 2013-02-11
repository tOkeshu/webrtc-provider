WebRTC Provider
===============

Getting started
---------------

To try this code on your local machine you will need to have an xmpp
server. [Prosody](http://prosody.im/) is a good choice for
developement purpose. Once you have an XMPP server you should create a
few users and add them in their respective roster via an xmpp client.

Then, install the dependencies and run the gateway:

    $ npm install
    $ ./node_modules/node-xmpp-bosh/run-server.js

Now you can start the static web server in another terminal:

    $ node server.js

and open your browser at http://localhost:5000/


License
-------

All source code here is available under the
[MPL 2.0](https://mozilla.org/MPL/2.0/) license, unless otherwise
indicated.

