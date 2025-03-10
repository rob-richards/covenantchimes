var webpack           = require('webpack');
var path              = require('path');
var BabiliPlugin      = require("babili-webpack-plugin");
var BrowserSyncPlugin = require('browser-sync-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    context: __dirname,
    devtool: false,
    entry: "./source/javascript/app.js",
    output: {
        path: "./public/assets/javascript",
        filename: "scripts.min.js"
    },

    plugins: [
        new BabiliPlugin(),
        new BrowserSyncPlugin({
            files: ["public/**/*.js", "public/**/*.css", "public/**/*.html"],
            host: 'localhost',
            port: 3000,
            server: { baseDir: ['public'] }
        })
    ],
};