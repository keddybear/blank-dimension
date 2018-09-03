const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

const outputDir = 'dist';

module.exports = {
	entry: ['babel-polyfill', './src/client/index.js'],
	output: {
		path: path.join(__dirname, outputDir),
		filename: 'bundle.js'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader'
				}
			},
			{
				test: /\.(s*)css$/,
				use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader']
			},
			{
				test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/,
				use: {
					loader: 'file-loader'
				}
			}
		]
	},
	resolve: {
		modules: ['node_modules'],
		alias: {
			client: path.resolve(__dirname, 'src/client/'),
			vendors: path.resolve(__dirname, 'src/client/vendors/'),
			assets: path.resolve(__dirname, 'src/client/assets/'),
			helpers: path.resolve(__dirname, 'src/client/helpers/'),
			actions: path.resolve(__dirname, 'src/client/actions/'),
			components: path.resolve(__dirname, 'src/client/components/'),
			reducers: path.resolve(__dirname, 'src/client/reducers/'),
			server: path.resolve(__dirname, 'src/server/')
		}
	},
	devServer: {
		historyApiFallback: true,
		port: 3000,
		open: true,
		proxy: {
			'/api': 'http://localhost:8080'
		}
	},
	plugins: [
		new CleanWebpackPlugin([outputDir]),
		new HtmlWebpackPlugin({
			template: './public/index.html',
			favicon: './public/favicon.ico'
		}),
		new UglifyJsPlugin({
			exclude: [/\.min\.js$/gi]
		}),
		new CompressionPlugin({
			asset: '[path].gz[query]',
			algorithm: 'gzip',
			test: /\.js$|\.css$|\.html$/,
			threshold: 10240,
			minRatio: 0.8
		})
	]
};
