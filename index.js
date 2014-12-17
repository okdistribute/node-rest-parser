var jsonBody = require('body/json');
var url = require('url')
var debug = require('debug')('restful');

var RestParser = {}

/*
Parameters
------
model : object
the model object should have the following method signature:
.put(id, data, function (err, data))
 -- data to be updated by id
.get(id, function (err, data))
.query(params, function (err, data))
 -- params a dictionary of field: value for filtering the db
 -- returns all matching rows
.all(function (err, data))
 -- returns all data
.post(data, function (err, data))
 -- data is the post parameters in the request
 -- returns the given row with id value
*/

RestParser.dispatch = function (model, req, res, id, cb) {
  var self = this
  var method = req.method.toLowerCase();
  switch (method) {
    case 'post':
      RestParser.handlers.post(model, req, res, cb);
      break;
    case 'get':
      RestParser.handlers.get(model, req, res, id, cb);
      break;
    case 'put':
      RestParser.handlers.put(model, req, res, id, cb);
      break;
    case 'delete':
      RestParser.handlers.delete(model, req, res, id, cb);
      break;
    default:
      cb('method must be one of post put get or delete')
      break;
  }
}

RestParser.getBodyData = function (req, res, cb) {
  var self = this;
  var data = {};
  jsonBody(req, res, function (err, data) {
    if (err || !data) {
      return cb(err);
    }
    debug('request data\n', data);
    cb(null, data);
  });
}

RestParser.handlers = {};

RestParser.handlers.post = function (model, req, res, cb) {
  var self = this;
  RestParser.getBodyData(req, res, function(err, data) {
    if (err || !data) {
      return cb(err)
    }
    debug('posting ', data);
    model.post(data, cb);
  });
};

RestParser.handlers.put = function (model, req, res, id, cb) {
  var self = this;
  if (!id) return cb('need an id to put', false);
  RestParser.getBodyData(req, res, function (err, data) {
    if (err || !data) {
      return cb(err)
    }
    debug('putting ', id, data);
    model.put(id, data, cb);
  });
};

RestParser.handlers.delete = function (model, req, res, id, cb) {
  var self = this
  if (!id) return cb('need an id to delete', false);
  debug('deleting ', id);
  model.delete(id, cb);
};

RestParser.handlers.get = function (model, req, res, id, cb) {
  // cb = function (err, data)
  var self = this
  if (!id) {
    // get by url query parameters
    var qs = url.parse(req.url, true).query

    if (Object.keys(qs).length > 0) {
      debug('looking up qs', qs)
      model.query(qs, cb);
    }
    else {
      debug('returning all values')
      model.all(cb);
    }
  }
  else {
    debug('getting by id', id)
    model.get(id, cb);
  }
};


module.exports = RestParser
