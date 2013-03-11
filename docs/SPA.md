Service Provider Adapter (SPA)
==============================

An adapter allows the application to use a specific provider backend
by implementing a set of common interfaces.

A SPA has to be an
[event emitter](https://github.com/Wolfy87/EventEmitter) and emit
theses events:

```JavaScript
var provider = new MyProvider();
provider.on('connected', function() {});
provider.on('contact-list', function(contactList) {});
provider.on('presence', function(who, type) {
  who.nick; // nickname
  who.id;   // id identifying the contact, specific to the provider
});
provider.on('stream', function(stream, type, remote) {
  stream; // webrtc stream
  type;   // 'video' or 'audio'
  remote; // true or false
});
```

Moreover, the adapter has a few methods:

```JavaScript
var provider = MyProvider();
var credentials = {/* crendentials */};
provider.connect(credentials);

var who = { /* specific to the provider, could be an ID or anything */ };
provider.call(who);
```

