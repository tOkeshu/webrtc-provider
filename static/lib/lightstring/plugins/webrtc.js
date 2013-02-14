'use strict';

/**
  Copyright (c) 2012, Romain Gauthier <rgauthier@mozilla.com>

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted, provided that the above
  copyright notice and this permission notice appear in all copies.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
  WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
  MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
  ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
  WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
  ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
  OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

Lightstring.plugins['webrtc'] = {
  namespaces: {
    sdp: 'urn:webrtc:iq:sdp'
  },
  stanzas: {
    offer: function (aTo, aOffer){
      return(
        "<iq to='" + aTo + "' type='set'>" +
          "<offer xmlns='" + Lightstring.ns.sdp + "'>" +
            JSON.stringify(aOffer) +
          '</offer>' +
        "</iq>"
      );
    },
    answer: function (aTo, aAnswer, aId){
      return(
        "<iq to='" + aTo + "' type='result' id='" + aId + "'>" +
          "<answer xmlns='" + Lightstring.ns.sdp + "'>" +
            JSON.stringify(aAnswer) +
          '</answer>' +
        "</iq>"
      );
    },
  },
};
