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

    var rawSortedAccepts = acceptHeader.split(',').map(acceptMapper).sort(acceptSorter);

		var sortedAccepts = rawSortedAccepts.map(function(mediaType) {
			return {
				contentType: mediaType.type + '/' + mediaType.subType,
				format: mediaType.format
			};
		});

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
  // TODO: Add wildcard support.
  // TODO: Sort by most specific version.

	var separated = {};
 
  var parts = mediaType.split(';', 3);

  var fullType = parts[0].split('\+');
	var slashIndex = fullType[0].indexOf('/');

	separated.type = fullType[0].substr(0, slashIndex);
  separated.subType = fullType[0].substr(slashIndex + 1);
  separated.format = fullType[1] || null;
  separated.qualityFactor = 1;

	var regex = /^\s*q=([01](?:\.\d+))\s*$/;
	if (parts[1] && regex.test(parts[1])) {
		var quality = regex.exec(parts[1]);

		separated.qualityFactor = Number(quality[1]);
	}

	separated.extension = (parts[1] ? parts[2] : parts[1]) || null;

	return separated;
}

function acceptSorter(a, b) {
	if (a.qualityFactor > b.qualityFactor) { return -1; }
	if (a.qualityFactor < b.qualityFactor) { return 1; }
  return 0;
}

function acceptMediaMapper(mediaType) {
  return {
    contentType: mediaType.type + '/' + mediaType.subType,
    format: mediaType.format
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
