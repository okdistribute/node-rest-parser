var debug = require('debug')('models');

module.exports = function(keyField) {
  var simple = new Simple(keyField)

  return {
    simple: simple
  };
};

function Simple(key) {
  this.db = {}
  this.key = key
}

Simple.prototype.post = function (data, opts, cb) {
  if(!data) {
    return cb('Need values to save')
  }
  var key = data[this.key]
  this.db[key] = data
  return cb(null, key)
}

Simple.prototype.get = function (opts, cb){
  if(!opts.id) {
    var values = []
    for (id in this.db) {
      values.push(this.db[id])
    }
    return cb(null, values)
  }
  var val = this.db[opts.id]
  if (!val) {
    return cb('NotFound')
  }
  return cb(null, this.db[opts.id])
}

Simple.prototype.put = function (data, opts, cb) {
  if(!opts.id) {
    return cb('Need a opts.id')
  }
  this.db[opts.id] = data
  return cb(null, opts.id)
}


Simple.prototype.delete = function (opts, cb) {
  if(!opts.id) {
    return cb('Need a opts.id')
  }
  delete this.db[opts.id]
  return cb(null)
}
