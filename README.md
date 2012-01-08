# leisure

Add hypermedia awareness to your REST services.

leisure offers:

* Content Negotiation for preferred media type.
* Automatically sets response Content-Type.
* Work in terms of hypermedia.

## Example
### app.js

```javascript
var express = require('express');
var leisure = require('leisure');
var accept = leisure.accept;

var app = express.createServer();

var dashboard = require('./media/dashboard');

app.get('/', accept(dashboard.mediaTypes), function(req, res) {
  var media = dashboard.create(req.accepted);
  res.send(media);
});

app.listen(3000);
```

### ./media/dashboard.js
```javascript
exports.mediaTypes = [
  { contentType = 'vnd.shop.Dashboard', formats = ['json', 'xml'] },
  { contentType = 'application/json' },
  { contentType = 'text/xml' }
];

exports.create = function(mediaType) {
  var mediaFactory = {
    { 'vnd.shop.Dashboard': createDashboardMedia(mediaType.format) },
    { 'application/json': createDashboardMedia('json') },
    { 'text/xml': createDashboardMedia('xml') }
  };

  var media = mediaFactory[mediaType.contentType]();
  return media;
};

function createDashboardMedia(format) {
    return function mediaFormat() {
      var formats = {
        'json': { 'account': { 'href':  '/account' }, 'products': { 'href': '/products' } },
        'xml': '<dashboard><account href="/account" /><products href="/products" /></dashboard>'
      };

      return formats[format];
    }
}

```

### Run

Launch the app.

```bash
$ node app.js
```

Set the Accept header on a curl request to `http://localhost:3000`.

```bash
$ curl -H "Accept: vnd.shop.Order+json" -X GET "http://localhost:3000"
{ 'account': { 'href':  '/account' }, 'products': { 'href': '/products' } }
```

Voila!

## Install

```bash
$ npm install leisure
```

## Usage
### leisure.accept(mediaTypes)
`leisure.accept` is [connect](https://github.com/senchalabs/connect)-compatible middleware that compares a list of accepted media types to those supported by the client via the HTTP `Accept` header and selects the most preferred media type available.  The preferred media type is appended to the request as `req.accepted`.  The `mediaTypes` parameter is required.

#### mediaTypes
`mediaTypes` is an array of acceptable media types for the request.  Each media type in the array needs a `contentType` property with the appropriate media type and an optional `formats` property listing acceptable formats.

Example: 

```javascript
[
  { contentType: 'vnd.shop.Order', formats: ['json', 'xml'] }, 
  { contentType: 'application/json' }
]
```

The `mediaTypes` array is prioritized by index.  In the example above, the the preference order is: 

1. `vnd.shop.Order+json`
2. `vnd.shop.Order+xml`
3. `application/json`

## Tests
Tests are written in mocha.  To run, use:

```bash
$ npm test
```

## License
MIT/X11
