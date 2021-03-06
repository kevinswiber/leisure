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

var mediaTypes = [
  { contentType: 'application/vnd.shop', formats: ['json', 'xml'] },
  { contentType: 'application/json' },
  { contentType: 'text/xml' }
];

var app = express.createServer();

app.use(leisure.accept(mediaTypes));

var dashboard = require('./media/dashboard');

app.get('/', function(req, res) {
  var media = dashboard.create(req.accepted);
  res.send(media);
});

app.listen(3000);
```

### ./media/dashboard.js
```javascript
exports.create = function(mediaType) {
  var mediaFactory = {
    'application/vnd.shop': createDashboardMedia(mediaType.format),
    'application/json': createDashboardMedia('json'),
    'text/xml': createDashboardMedia('xml')
  };

  var media = mediaFactory[mediaType.contentType].call(this);
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
$ curl -i -H "Accept: application/vnd.shop+json" -X GET http://localhost:3000
HTTP/1.1 200 OK
Content-Type: application/vnd.shop+json
Content-Length: 75
Connection: keep-alive

{ "account": { "href":  "/account" }, "products": { "href": "/products" } }
```

Voila!

## Install

```bash
$ npm install leisure
```

## Usage
### leisure.accept(mediaTypes, [options])
`leisure.accept` is [connect](https://github.com/senchalabs/connect)-compatible middleware that compares a list of accepted media types to those supported by the client via the HTTP `Accept` header and selects the most preferred media type available.  The preferred media type is appended to the request as `req.accepted`.  The `mediaTypes` parameter is required.

#### mediaTypes
`mediaTypes` is an array of acceptable media types for the request.  Each media type in the array needs a `contentType` property with the appropriate media type and an optional `formats` property listing acceptable formats.

Example: 

```javascript
[
  { contentType: 'application/vnd.shop', formats: ['json', 'xml'] }, 
  { contentType: 'application/json' }
]
```

The `mediaTypes` array is prioritized by index.  In the example above, the preference order is: 

1. `application/vnd.shop+json`
2. `application/vnd.shop+xml`
3. `application/json`

#### options
`options` is a collection of options for the current middleware instance.  

Example:

```javascript
leisure.accept([{ contentType: 'text/xml' }], { strictMode: true });
```

##### options.strictMode
`strictMode` sends a `406 Not Acceptable` response when no media type is matched.  The default value is taken from `leisure.options.strictMode`.

### leisure.options
Global options in leisure.

```javascript
console.log(leisure.options.strictMode); // => false
```

### leisure.setOption(key, val)
`setOption` sets a global option in leisure.

#### strictMode
When the `strictMode` option is `true`, leisure sends a `406 Not Acceptable` response when there is no matching `Accept` value in the request.  When `strictMode` is `false`, leisure will respond with the most preferable media type.  The default value is `false`.  This can be overriden for each middleware instance (see `leisure.accept`).

```javascript
leisure.setOptions('strictMode', true);
```


## Tests
Tests are written in mocha.  To run, use:

```bash
$ npm test
```

## License
MIT/X11
