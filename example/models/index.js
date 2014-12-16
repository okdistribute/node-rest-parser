var debug = require('debug')('models');

var Simple = require('./simple.js')

module.exports = function(dbPath) {
  var leveldb = require('./leveldb.js')(dbPath)

  var simple = new Simple('owner_id')

  return {
    db: leveldb.db, // for closing the handler on server shutdown
    simple: simple,
    level: leveldb.Level
  };
};