Architecture
============

Overview
--------


     Browser                                |  Internet     | Providers
    ---------------------------------------------------------------------------

     +-----------+-----------+
     |           |           |------------+                   +------------+
     |           |           |            |                   |            |
     |           |           | Talkilla   |                   | Talkilla   |
     |           |           | essentials |<----------------->| essentials |
     |           |           | adapter    |                   | Provider   |
     |           |           |            |                   |            |
     | Talkilla  | Talkilla  |------------+                   +------------+
     | Webapp    | Library   |
     |           |           |------------+                   +------------+
     |           |           |            |                   |            |
     |           |           |            |                   |            |
     |           |           | X Provider |<----------------->| X Provider |
     |           |           | adapter    |                   |            |
     |           |           |            |                   |            |
     |           |           |------------+                   +------------+
     +-----------+-----------+


Talkilla is composed of multiple layers: the Talkilla Webapp, The
Talkilla Library, The Service providers adapters and the providers.

### Talkilla Webapp

This is the Web application that abstracts everything and exposes a UI
on top of the different service providers.

### Talkilla Library

The Talkilla Library is a shared code component to help writing the
Webapp and plug different service providers adapters.

### Service provider adpater (SPA)

An adapter allows the application to use a specific provider backend
by implementing a set of common interfaces.

### Provider

A provider is a backend component that brings specific features to
WebRTC applications. I could be basic signaling, presence, gateway
etc.

Talkilla essentials
-------------------

Talkilla essentials is a default provider for Talkilla with a
corresponding adpater.

Talkilla essentials offers signaling, presence, chat, and file
transfers.

Here is an diagram of the current implementation:

    +-----------+--------------------+-----------+            +--------------+          +-------------+
    |           |                    |           |            |              |          |             |
    |           |                    | webrtc.js |            |              |          |             |
    |           |                    |           |     ws     |              |          |             |
    | client.js | xmpp_provider.js   +-----------+<---------->| XMPP Gateway |<-------->| XMPP Server |
    |           |                                |            |              |          |             |
    |           |                                |            |              |          |             |
    |           |                                |            |              |          |             |
    +-----------+--------------------------------+            +--------------+          +-------------+

The provider is composed of an XMPP server and a corresponding gateway.
This server takes care of the presence and signaling parts.

On the client side, `xmpp_provider.js` is the Talkilla SPA.
It deals with the XMPP protocol and bubbles up presence and signaling informations to the UI.

`client.js` is the web application exposing the UI to the user.

`webrtc.js` is a special component that implements a WebRTC
"dialer". It's a generic interface and thus is protocol agnostic. Each
SPA can use it but needs to implement the transport part. In the case
of Talkilla, it's the XMPP SPA that implements the XMPP transport.

