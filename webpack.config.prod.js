const path = require('path');
const HtmlPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    entry: './main.js',
    output: {
        path: path.resolve(__dirname,'dist'),
        filename: 'index.js'
    },
    devtool: 'source-map',
    module: {
        rules: [{
            test: /\.js$|\.jsx$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            query: {
                presets: ['env', 'react']
            }
        }]
    },
    resolve: {
         extensions: ['.js', '.jsx'],
    },
    plugins: [
        // Configure HtmlPlugin to use our own index.html file
        // as a template.
        // Check out https://github.com/jantimon/html-webpack-plugin
        // for the full list of options.
        new HtmlPlugin({
            template: './index.html'
        }),
        new CopyWebpackPlugin([
            {
                from: './libs',
                to: './libs',
                toType: 'dir'
            },
            {
                from: './img',
                to: './img',
                toType: 'dir'
            }
        ]),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        new webpack.optimize.UglifyJsPlugin(),
    ]
}