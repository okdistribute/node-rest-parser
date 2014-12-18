rest-parser
=============

A request parser that enforces REST style for any db model. Simply implement the required methods for the underlying object. The model object only needs to implement the methods `.post`, `.get`, `.put`, and `.delete`.

[![NPM](https://nodei.co/npm/rest-parser.png?compact=true)](https://nodei.co/npm/rest-parser/)

[![build status](https://secure.travis-ci.org/karissa/node-rest-parser.png)](http://travis-ci.org/karissa/node-rest-parser)


# Installation
This module is installed via npm:

```bash
$ npm install rest-parser
```

# Usage

Example database connection object that uses simple in-memory dictionaries for application storage.

```js
function Book(key) {
  this.db = {}
  this.key = key
}

Book.prototype.post = function (data, opts, cb) {
  if(!data) {
    return cb('Need values to save')
  }
  var key = data[this.key]
  this.db[key] = data
  return cb(null, key)
}

Book.prototype.get = function (opts, cb){
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

Book.prototype.put = function (data, opts, cb) {
  if(!opts.id) {
    return cb('Need a opts.id')
  }
  this.db[opts.id] = data
  return cb(null, opts.id)
}


Book.prototype.delete = function (opts, cb) {
  if(!opts.id) {
    return cb('Need a opts.id')
  }
  delete this.db[opts.id]
  return cb(null)
}

```

## Create a server

```js
var RestParser = require('rest-parser')
var Book = require('./book.js')

// make the book model
var bookDB = new Book()
var parser = new RestParser(bookDB)

// Wire up API endpoints
router.addRoute('/api/book/:id?', function(req, res, opts) {
    var id = parseInt(opts.params.id) || opts.params.id
    parser.dispatch(req, { id: id }, function (err, data) {
      res.end(JSON.stringify(data))
    })
  })
})

var server = http.createServer(router)
server.listen(8000)
```


The server will now have these routes available:

```
GET /book
GET /book/:id
POST /book
PUT /book/:id
DELETE /book/:id
```


# Advanced: auth, custom routes

Sometimes, you want control over the individual routes to expose only a subset, to require authentication, or some other query logic. It's easy to do with rest-parser -- just use the underlying handler methods:

```js
var RestParser = require('rest-parser')
var Book = require('./book.js')

// make the book model
var bookDB = new Book()
var parser = new RestParser(book)

// Wire up API endpoints
router.addRoute({
  GET: '/api/book/:id', function(req, res, opts) {
    var id = parseInt(opts.params.id) || opts.params.id
    parser.get(req, { id: id }, function (err, data) {
      res.end(JSON.stringify(data))
    })
  }),
  POST: '/api/book/:id', function(req, res, opts) {
    var id = parseInt(opts.params.id) || opts.params.id
    if (!req.userid) {
      res.statusCode = 401
      res.end('Unauthorized!')
      return
    }

    parser.post(req, { id: id }, function (err, data) {
      res.end(JSON.stringify(data))
    })
  })
})

var server = http.createServer(router)
server.listen(8000)
```

# API

#### RestParser(model)
Instantiates the parser with a given model.

The model object should have the following method signature:

* model#put(data, opts, cb)
* model#post(data, opts, cb)
* model#delete(opts, cb)
* model#get(opts, cb)

The parser will take the request object and route to the corresponding model method.


#### RestParser#post(req, opts, cb)
Does *not* enforce an id -- it is assumed that the id will be generated upon creation or otherwise will be handled by the model.

#### RestParser#put(req, opts, cb)
Parses the request body using ```getBodyData``` and passes to ```model.put```.

#### RestParser#delete(req, opts, cb)
Passes to `model.delete`.

#### RestParser#get(req, opts, cb)
Passes to `model.get`

#### RestParser#dispatch(req, opts, cb)
This parses the ```req.method``` to dispatch appropriately to one of the above methods.

# Examples

Create a new book

```bash
$ curl -x POST 'http://localhost:8000/api/book' -d {'author': 'Mark Twain', 'name': 'N/A'}
1
```

Update a book

```bash
$ curl -x PUT 'http://localhost:8000/api/book/1' -d {'author': 'Mark Twain', 'name': 'Life on the Mississippi'}
1
```

Get all books

```bash
$ curl 'http://localhost:8000/api/book'
[
  {
    'id': 1,
    'author': 'Mark Twain',
    'name': 'Life on the Mississippi'
  },
  etc...
]
```

Get a single book

```bash
$ curl 'http://localhost:8000/api/book/1'
{
  'id': 1,
  'author': 'Mark Twain',
  'name': 'Life on the Mississippi'
}
```

Delete a book

```bash
$ curl -x DELETE 'http://localhost:8000/api/book/1'
```

Get all books (none remain)

```bash
$ curl 'http://localhost:8000/api/book'
[]
```


# License
Copyright (c) 2014, Karissa McKelvey
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

