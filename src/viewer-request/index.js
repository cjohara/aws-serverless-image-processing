const querystring = require('querystring');

const ALLOWED_DIMENSIONS = [64, 100, 200, 400, 600, 800, 1000, 1200, 1600, 2000];
const ALLOWED_STYLES = ['bw', 'grayscale', 'greyscale'];
const MAX_DIMENSION = 2000;

exports.handler = (event, context, callback) => {
	console.log('viewer-request: %j', event);
	const request = event.Records[0].cf.request;

	// Skip non-image requests
	if (!(request.uri.match(/\.(gif|jpe?g|png|svg|tiff)/i))) {
		callback(null, request);
		return;
	}

	const query = querystring.parse(request.querystring);

	// Skip if there is no options passed
	if (!query.width && !query.height && !query.style) {
		callback(null, request);
		return;
	}

	const height = getDimension(query.height);
	const width = getDimension(query.width);
	const style = getStyle(query.style);

	// Skip if all options are defaults
	if (height === 0 && width === 0 && style === 'default') {
		callback(null, request);
		return;
	}

	const url = [];

	/**
	 * Format dimension:
	 *
	 * /400h/
	 * /400w/
	 * /400h400w/
	 * /default/
	 */
	if (height || width) {
		let dimension = height ? height + 'h' : '';
		dimension = width ? dimension + width + 'w' : dimension;
		url.push(dimension);
	} else {
		url.push('default');
	}

	/**
	 * Format Style:
	 *
	 * /800w/default/
	 * /800w/bw/
	 * /800w/greyscale/
	 */
	url.push(style);

	/**
	 * Add image to uri
	 */
	const image = request.uri.split('/').pop();
	url.push(image);

	// Final modified url is of format /400h800w/bw/image.jpg
	request.uri = '/' + url.join('/');
	callback(null, request);
};

/**
 * Get the nearest dimension rounding up.
 *
 * @param {string|int} dimension
 * @return {int}
 */
const getDimension = (dimension) => {
	let result = 0;
	dimension = (typeof dimension === 'string') ? parseInt(dimension) : dimension;
	dimension = (typeof dimension === 'number' && dimension % 1 === 0) ? dimension : 0;

	ALLOWED_DIMENSIONS.forEach(d => {
		if (result === 0 && dimension !== 0 && dimension <= d) {
			result = d;
		}
	});

	if (result > MAX_DIMENSION) {
		result = MAX_DIMENSION;
	}

	return result;
};

/**
 * @param {string} style
 * @return {string}
 */
const getStyle = (style) => {
	style = style || '';

	return ALLOWED_STYLES.includes(style) ? 'greyscale' : 'default';
};