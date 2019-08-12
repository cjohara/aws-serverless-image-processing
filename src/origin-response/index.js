const aws = require('aws-sdk');
const mime = require('mime');
const sharp = require('sharp');

exports.handler = (event, context, callback) => {
	console.log('origin-response: %j', event);
	let response = event.Records[0].cf.response;

	// Image exists in S3 bucket already, we're already done.
	if (response.status !== '404') {
		callback(null, response);
		return;
	}

	// Skip non-image requests
	const request = event.Records[0].cf.request;
	if (!(request.uri.match(/\.(gif|jpe?g|png|svg|tiff)/i))) {
		callback(null, response);
		return;
	}

	// Check if request matches expected input
	const match = request.uri.match(/\/(\d+h|\d+w|\d+h\d+w|default)\/(bw|default|greyscale|grayscale)\/(.*).(gif|jpe?g|png|svg|tiff)/i);
	if (!match) {
		callback(null, response);
		return;
	}

	const bucket = request.origin.s3.domainName.replace('.s3.amazonaws.com', '');

	// Perform the image manipulations
	const dimensions = match[1].match(/(\d+h)?(\d+w)?(default)?/i);
	const height = (dimensions[1] && !dimensions[3]) ? parseInt(dimensions[1]) : null;
	const width = (dimensions[2] && !dimensions[3]) ? parseInt(dimensions[2]) : null;

	const style = match[2];
	const image = match[3] + '.' + match[4];

	let buffer = null;
	const s3 = new aws.S3();
	s3.getObject({
		Bucket: bucket,
		Key: image

	}).promise().then(data => {
		// Manipulate the image
		let newImage = sharp(data.Body);
		if (style === 'greyscale') {
			newImage = newImage.greyscale();
		}
		if (height || width) {
			newImage = newImage.resize({
				height: height,
				width: width,
				fit: 'inside'
			});
		}
		return newImage.toBuffer();

	}).then(data => {
		buffer = data;
		// Save the new image
		return s3.putObject({
			Body: buffer,
			Bucket: bucket,
			ContentType: mime.getType(image),
			CacheControl: 'max-age=31536000',
			Key: request.uri.substring(1),
		}).promise().catch(err => {
			console.log('There was an error saving the manipulated image: %j', err);
		});

	}).then(() => {
		if (buffer) {
			response.status = 200;
			response.body = buffer.toString('base64');
			response.bodyEncoding = 'base64';
			response.headers['content-type'] = [{key: 'Content-Type', value: mime.getType(image)}];
		}
		callback(null, response);

	}).catch(err => {
		console.log(err);
		callback(null, response);
	});
};