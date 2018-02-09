const path = require('path');

module.exports = {
    entry: './main.js',
    output: {
        path: path.resolve(__dirname,'dist'),
        filename: 'index.js'
    },
    devServer: {
        host: '0.0.0.0',
        inline: true,
        port: 3000
    },
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
    }
}