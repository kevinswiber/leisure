var _ = require('underscore');

exports.accept = function(mediaTypes) {
	return function(req, res, next) {
		var acceptHeader = req.headers['accept'];

		if (!mediaTypes || !acceptHeader) {
			next();
		}

		acceptHeader = acceptHeader.replace(/\s+/g, '');

		var sortedMedia = _.reduce(mediaTypes, mediaTypeReducer, []);
		var sortedAccepts = _.map(acceptHeader.split(','), acceptMapper); // add quality sorter
		var common = findCommonMediaTypes(sortedMedia, sortedAccepts);

		if (common && common.length) {
			req.accepted = common[0];
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
		// iterate over formats and push each unique {contentType, format}
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
