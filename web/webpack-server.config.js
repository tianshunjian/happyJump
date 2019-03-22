const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: {
        app: ['./web/index.js',
            'webpack-dev-server/client?http://localhost:7967/'
        ]
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname,'dist')
    },
    ///copy html
    plugins: [
        new HtmlWebpackPlugin({
            template: './web/templete-index.html',
            title: 'Matt Reach'
        }),
        // to 是相对于 output.path 的
        new CopyWebpackPlugin([{
            from: './web/css',
            to: './css'
        }]),
        new CopyWebpackPlugin([{
            from: './web/libs',
            to: './libs'
        }]),
        new CopyWebpackPlugin([{
            from: './web/res',
            to: './res'
        }]),
        new webpack.HotModuleReplacementPlugin()
    ],
    devServer: {
        overlay: true,
        stats: 'errors-only',
        inline: true,
        hot: true,
        host: '0.0.0.0',
        port: 7967,
        headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': true },
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env']
                    }
                }
            }
        ]
    }
};
