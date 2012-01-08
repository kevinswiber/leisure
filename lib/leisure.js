exports.accept = function(mediaTypes) {
  return function(req, res, next) {
    var acceptHeader = req.headers['accept'];

    if (!mediaTypes) {
      next();
    }

    if (!acceptHeader) {
      req.accepted = mediaTypes[0];
      res.headers['content-type'] = mediaTypes[0].contentType;
      next();
      return;
    }

    acceptHeader = acceptHeader.replace(/\s+/g, '');

    var sortedMedia = mediaTypes.reduce(mediaTypeReducer, []);
    var sortedAccepts = acceptHeader.split(',').map(acceptMapper); // add quality sorter
    var common = findCommonMediaTypes(sortedMedia, sortedAccepts);

    if (common && common.length) {
      req.accepted = res.headers['content-type'] = common[0];
      res.headers['content-type'] = common[0].contentType;
    } else {
      req.accepted = null; // respond with Not Accepted?
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
