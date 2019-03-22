const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    mode: 'production',//'development',
    entry: './web/index.js',
    output: {
        filename: 'bundle.js',
        ///必须是绝对路径
        path: path.resolve(__dirname, 'dist')
    },
    ///copy html
    plugins: [
        new CleanWebpackPlugin(
            ['dist'],//匹配删除的文件
            {
                root:     __dirname,
                // exclude:  ['shared.js'],
                verbose:  false,
                dry:      false
            }
        ),
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
    ],
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
            },
        ]
    }
};
