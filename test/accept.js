var leisure = require('../');

var req;
var res;

describe('leisure', function() {
  describe('#accept', function() {
    beforeEach(function() {
      var acceptHeader = 'application/vnd.shop.Order+json, application/vnd.shop.Order+xml, text/xml';
      req = { headers: { accept: acceptHeader } };
      res = {
        statusCode: 200,
        headers: { 'content-type': '' },
        body: '',
        writeHead: function(statusCode, headers) {
          this.statusCode = statusCode;
          this.headers = headers;
        },
        end: function(body) {
          this.body = body;
        },
        setHeader: function(key, value) {
          this.headers[key.toLowerCase()] = value;
        }
      };
    });

    it('adds an `accepted` property to the request', function(done) {
      var accept = leisure.accept([{ contentType: 'text/xml' }]);
      var next = function() {
        req.accepted.should.be.a('object');
        req.accepted.should.have.property('contentType');
        req.accepted.should.have.property('format');
        done();
      };

      accept(req, res, next);
    });

    it('accepts media types with no format specified', function(done) {
      var mediaTypes = [{ contentType: 'application/vnd.shop.Order' }];
      var accept = leisure.accept(mediaTypes);
      req.headers['accept'] = 'application/vnd.shop.Order';

      var next = function() {
        req.accepted.contentType.should.equal('application/vnd.shop.Order');
        done();
      };

      accept(req, res, next);
    });

    it('accepts media types with formats specified', function(done) {
      var mediaTypes = [{ contentType: 'application/vnd.shop.Order', formats: ['json', 'xml'] }];
      var accept = leisure.accept(mediaTypes);
      req.headers['accept'] = 'application/vnd.shop.Order+json';

      var next = function() {
        req.accepted.contentType.should.equal('application/vnd.shop.Order');
        req.accepted.format.should.equal('json');
        done();
      };

      accept(req, res, next);
    });

    it('sets the response content-type to the appropriate media type', function(done) {
      var mediaTypes = [{ contentType: 'text/xml' }];
      var accept = leisure.accept(mediaTypes);
      req.headers['accept'] = 'text/xml';

      var next = function() {
        res.headers['content-type'].should.equal('text/xml');
        done();
      };

      accept(req, res, next);
    });

    it('sends the top priority media type when no accept header exists', function(done) {
      var mediaTypes = [{ contentType: 'text/xml' }, { contentType: 'text/plain' }];
      var accept = leisure.accept(mediaTypes);
      if (req.headers['accept']) { delete req.headers['accept']; }

      var next = function() {
        req.accepted.contentType.should.equal('text/xml');
        done();
      };

      accept(req, res, next);
    });

    it('sends the top priority media type when no acceptable media type exists and strict mode is disabled', function(done) {
      var mediaTypes = [{ contentType: 'text/xml' }];
      var accept = leisure.accept(mediaTypes, { strictMode: false });
      req.headers['accept'] = 'text/plain';

      var next = function() {
        req.accepted.contentType.should.equal('text/xml');
        done();
      };
      
      accept(req, res, next);
    });

    it('responds with Not Acceptable when no acceptable media type exists and strict mode is enabled', function(done) {
      var mediaTypes = [{ contentType: 'text/xml' }];
      var accept = leisure.accept(mediaTypes, { strictMode: true });
      req.headers['accept'] = 'text/plain';

      var next = function() {
        res.statusCode.should.equal(406);
        done();
      };
      
      accept(req, res, next);
    });
  });
});
