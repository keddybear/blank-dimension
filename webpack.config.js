const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

const outputDir = 'dist';
const webpackPlugins = [
	new CleanWebpackPlugin([outputDir]),
	new HtmlWebpackPlugin({
		template: './public/index.html',
		favicon: './public/favicon.ico'
	})
];
if (process.env.NODE_ENV === 'production') {
	webpackPlugins.push(new UglifyJsPlugin({
		exclude: [/\.min\.js$/gi]
	}));
}
webpackPlugins.push(new CompressionPlugin({
	asset: '[path].gz[query]',
	algorithm: 'gzip',
	test: /\.js$|\.css$|\.html$/,
	threshold: 10240,
	minRatio: 0.8
}));

module.exports = {
	entry: ['babel-polyfill', './src/client/index.js'],
	output: {
		path: path.join(__dirname, outputDir),
		filename: '[name].bundle.js',
		chunkFilename: '[name].bundle.js'
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
	plugins: webpackPlugins
};
