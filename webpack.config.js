const webpack = require('webpack');

let config = {
	entry: __dirname + '/src/index.jsx',
	output: {
		path: __dirname + '/public/js/',
		filename: 'bundle.js' 
	},
	module: {
		loaders: [
			{
				test: /\.jsx?/,
				include: __dirname + '/src',
				loader: 'babel-loader'
			}
		]
	}
};

module.exports = config;
