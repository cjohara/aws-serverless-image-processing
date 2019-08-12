'use strict';

const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
	mode: process.env.NODE_ENV || 'development',
	entry: {
		'origin-response': './src/origin-response/index.js',
		'viewer-request': './src/viewer-request/index.js'
	},
	output: {
		filename: '[name]/index.js',
		library: '[name]',
		libraryTarget: 'commonjs2',
		path: path.resolve(__dirname, 'dist'),
	},
	target: 'node',
	externals: {
		'aws-sdk': 'commonjs aws-sdk',
		'sharp': 'commonjs sharp',
	},
	resolve: {
		modules: ['node_modules']
	},
	plugins: [
		new CopyWebpackPlugin([
			{from: './src/origin-response/*.json', to: 'origin-response/[name].[ext]'},
		])
	]
};