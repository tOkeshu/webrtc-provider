var Sequelize = require("sequelize"),
    utils     = require('./utils'),
    Promise   = utils.Promise;

var sequelize = new Sequelize('webrtc-provider', 'webrtc', null, {
    dialect: 'sqlite',
    storage: 'database.sqlite'
});

var User = sequelize.define('User', {
  email: Sequelize.STRING,
  jid: Sequelize.STRING,
  password: Sequelize.STRING
}, {
  classMethods: {
    findOrCreate: function (email) {
      var promise = new Promise();
      User.find({where: {email: email}}).success(function (user) {
        if (user)
          promise.done(user);
        else
          User.create({email: email}).success(function (user) {
            promise.done(user);
          });
      });
      return promise;
    },
  },
  instanceMethods: {
    credentials: function () {
      var cred = {};
      if (this.jid && this.password)
        cred.xmppProvider = {jid: this.jid, password: this.password};
      return cred;
    }
  }
});

User.sync();

module.exports.User = User;

