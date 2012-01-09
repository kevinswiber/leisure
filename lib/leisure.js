var options = exports.options = { strictMode: false };

exports.setOption = function(key, val) {
    options[key] = val;
};

exports.accept = function(mediaTypes, opts) {
  var acceptOpts = opts;
  return function(req, res, next) {
    var opts = acceptOpts || {};
    opts.strictMode = opts.strictMode || options.strictMode;

    var acceptHeader = req.headers['accept'];

    if (!mediaTypes) {
      next();
    }

    function acceptMediaType(mediaType) {
      req.accepted = mediaType;
      var contentType = mediaType.contentType;

      if (mediaType.format) {
        contentType = contentType + '+' + mediaType.format;
      }

      res.setHeader('Content-Type', contentType);
    }

    var sortedMedia = mediaTypes.reduce(mediaTypeReducer, []);

    if (!acceptHeader) {
      acceptMediaType(sortedMedia[0]);
      next();
      return;
    }

    acceptHeader = acceptHeader.replace(/\s+/g, '');

    var sortedAccepts = acceptHeader.split(',').map(acceptMapper); // add quality sorter
    var common = findCommonMediaTypes(sortedMedia, sortedAccepts);

    if (common && common.length) {
      acceptMediaType(common[0]);
    } else if(opts.strictMode) {
      var body = 'Not Acceptable';
      res.writeHead(406, { 'Content-Type': 'text/plain', 'Content-Length': body.length });
      res.end(body);
      return;
    } else {
      acceptMediaType(sortedMedia[0]);
    }

    next();
  };
};

function mediaTypeReducer(arr, media) {
  if (!media.contentType) {
    return arr;
  }

  if (media.formats) {
    for (var i = 0; i < media.formats.length; i++) {
      arr.push({ contentType: media.contentType, format: media.formats[i] });
    }
  } else {
    arr.push({ contentType: media.contentType, format: media.format || null });
  }
  
  return arr;
}

function acceptMapper(mediaType) {
  var media = mediaType.split('\+');
  return {
    contentType: media[0],
    format: media[1] || null
  };
}

function combiner(mediaTypes) {
  var hash = {};

  for(var i = 0; i < mediaTypes.length; i++) {
    var key = mediaTypes[i].contentType + '+' + (mediaTypes[i].format || '');
    hash[key] = mediaTypes[i];
  }

  return hash;
}

function findCommonMediaTypes(mediaTypes, acceptedTypes) {
  var hashedMedia = combiner(mediaTypes);
  var hashedAccepted = combiner(acceptedTypes);

  var common = [];
  for(var key in hashedMedia) {
    if (hashedAccepted[key]) {
      common.push(hashedMedia[key]);
    }
  }

  return common;
}
