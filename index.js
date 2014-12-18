var jsonBody = require('body/json')
var url = require('url')
var debug = require('debug')('restful');

var RestParser = function (model) {
  this.model = model
}

RestParser.prototype.dispatch = function (req, opts, cb) {
  var self = this
  var method = req.method.toLowerCase();
  switch (method) {
    case 'post':
      self.post(req, opts, cb);
      break;
    case 'get':
      self.get(req, opts, cb);
      break;
    case 'put':
      self.put(req, opts, cb);
      break;
    case 'delete':
      self.delete(req, opts, cb);
      break;
    default:
      cb(new Error('method must be one of post put get or delete'))
      break;
  }
}

RestParser.prototype.getBodyData = function (req, cb) {
  var self = this;
  var data = {};
  jsonBody(req, function (err, data) {
    if (err || !data) {
      return cb(err);
    }
    debug('request data\n', data);
    cb(null, data);
  });
}

RestParser.prototype.post = function (req, opts, cb) {
  var self = this;
  self.getBodyData(req, function(err, data) {
    if (err || !data) {
      return cb(err)
    }
    debug('posting ', data);
    self.model.post(data, opts, cb);
  });
};

RestParser.prototype.put = function (req, opts, cb) {
  var self = this;
  if (!opts.id) return cb(new Error('need an id to put'), false);
  self.getBodyData(req, function (err, data) {
    if (err || !data) {
      return cb(err)
    }
    debug('putting ', opts, data);
    self.model.put(data, opts, cb);
  });
};

RestParser.prototype.delete = function (req, opts, cb) {
  var self = this
  if (!opts.id) return cb(new Error('need an id to delete'), false);
  debug('deleting ', opts.id);
  self.model.delete(opts, cb);
};

RestParser.prototype.get = function (req, opts, cb) {
  var self = this
  self.model.get(opts, cb);
};


module.exports = RestParser
