const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;

/**
 * Wraps child_process.exec with a Promise
 *
 * @param {String} command
 * @returns {Promise}
 */
const run = (command) => {
	return new Promise((resolve, reject) => {
		exec(command, (err) => {
			if (err) {
				reject(err);
			}
			resolve();
		}).stdout.pipe(process.stdout);
	});
};

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
	const files = fs.readdirSync(path.resolve(__dirname, '../dist/' + func), 'utf8');
	files.forEach(file => {
		if (file.indexOf('package.json') > -1) {
			promise = promise.then(() => {
				const volumePath = path.resolve(__dirname, '../dist/' + func);
				return run('docker run --rm --volume ' + volumePath + ':/build amazonlinux:nodejs /bin/bash -c "source ~/.bashrc; npm install --only=prod"');
			}).then(() => {
				console.log('installed libraries: ' + func);
			});
		}
	});
});

promise.then(() => {
	console.log('finished installing libraries');
}).catch(err => {
	console.log(err);
});