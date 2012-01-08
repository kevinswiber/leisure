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
  { contentType: 'application/vnd.shop.Dashboard', formats: ['json', 'xml'] },
  { contentType: 'application/json' },
  { contentType: 'text/xml' }
];

exports.create = function(mediaType) {
  var mediaFactory = {
    { 'application/vnd.shop.Dashboard': createDashboardMedia(mediaType.format) },
    { 'application/json': createDashboardMedia('json') },
    { 'text/xml': createDashboardMedia('xml') }
  };

  var media = mediaFactory[mediaType.contentType]();
  return media;
};

function createDashboardMedia(format) {
    return function mediaFormat() {
      var formats = {
        'json': '{ "account": { "href":  "/account" }, "products": { "href": "/products" } }',
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
$ curl -H "Accept: application/vnd.shop.Dashboard+json" -X GET "http://localhost:3000"
{ "account": { "href":  "/account" }, "products": { "href": "/products" } }
```

Voila!

## Install

```bash
$ npm install leisure
```

## Usage
### leisure.options
Read global options in leisure.

### leisure.options.strictMode
When `strictMode` is `true`, leisure sends a `406 Not Acceptable` response when there is no matching `Accept` value in the request.  When `strictMode` is `false`, leisure will respond with the most preferable media type.  The default value is `false`.

### leisure.setOption(key, val)
`setOption` sets a global option in leisure.

### leisure.accept(mediaTypes, [options])
`leisure.accept` is [connect](https://github.com/senchalabs/connect)-compatible middleware that compares a list of accepted media types to those supported by the client via the HTTP `Accept` header and selects the most preferred media type available.  The preferred media type is appended to the request as `req.accepted`.  The `mediaTypes` parameter is required.

#### mediaTypes
`mediaTypes` is an array of acceptable media types for the request.  Each media type in the array needs a `contentType` property with the appropriate media type and an optional `formats` property listing acceptable formats.

Example: 

```javascript
[
  { contentType: 'application/vnd.shop.Order', formats: ['json', 'xml'] }, 
  { contentType: 'application/json' }
]
```

The `mediaTypes` array is prioritized by index.  In the example above, the the preference order is: 

1. `application/vnd.shop.Order+json`
2. `application/vnd.shop.Order+xml`
3. `application/json`

#### options
`options` is a collection of options for the current middleware instance.  

Example:

```javascript
leisure.accept([{ contentType: 'text/xml' }], { strictMode: true });
```

##### options.strictMode
`strictMode` sends a `406 Not Acceptable` response when no media type is matched.  The default value is taken from `leisure.options.strictMode`.

## Tests
Tests are written in mocha.  To run, use:

```bash
$ npm test
```

## License
MIT/X11
