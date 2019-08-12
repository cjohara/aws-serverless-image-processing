const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

/**
 * @param {String} source
 * @param {String} out
 * @returns {Promise}
 */
function zipDirectory(source, out) {
	const archive = archiver('zip', { zlib: { level: 9 }});
	const stream = fs.createWriteStream(out);

	return new Promise((resolve, reject) => {
		archive.directory(source, false).on('error', err => reject(err)).pipe(stream);
		stream.on('close', () => resolve());
		archive.finalize();
	});
}

/**
 * Get all functions to package
 *
 * @param {string} dir
 * @param {Array} [exclude]
 * @return {Array}
 */
const getFunctions = (dir, exclude) => {
	const files = fs.readdirSync(dir, 'utf8');
	exclude = Array.isArray(exclude) ? exclude : [];

	return files.filter(file => {
		let keep = true;
		exclude.forEach(e => {
			if (file.indexOf(e) > -1) {
				keep = false;
			}
		});

		return keep;
	});
};

const exclude = ['.DS_Store', '.zip'];
const functions = getFunctions(path.resolve(__dirname, '../dist'), exclude);

let promise = Promise.resolve();
functions.forEach(func => {
	promise = promise.then(() => {
		return zipDirectory(path.resolve(__dirname, '../dist/' + func), path.resolve(__dirname, '../dist/' + func + '.zip'));
	}).then(() => {
		console.log('packaged: ' + func);
	});
});

promise.then(() => {
	console.log('finished packaging functions');
}).catch(err => {
	console.log(err);
});