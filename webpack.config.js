const path = require("path");
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");
const DotenvWebpack = require('dotenv-webpack');
const HtmlWebpackPlugin = require("html-webpack-plugin");

if (process.env.NODE_ENV !== 'production') {
  const dotenv = require('dotenv').config(); 
}

const googleAPIKey = process.env.GOOGLE_API_KEY;
console.log("API Key in webpack config: " + googleAPIKey);

module.exports = {
  entry: __dirname + '/src/index.js',
  output: {
    path: __dirname + '/dist',
    publicPath: '/',
    filename: 'main.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ["file-loader"],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: ["file-loader"],
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
    }),
    new CopyPlugin({
      patterns: [
        { from: 'radius-checker.png', to: '.' },
        { from: 'assets', to: './assets' },
      ],
    }),
    new DotenvWebpack(),
    new HtmlWebpackPlugin({
      inject: false,
      template: path.join(__dirname, 'src', 'views', 'index.html'), // 'src/views/index.html',
      apiUrl: `https://maps.googleapis.com/maps/api/js?key=${googleAPIKey}&callback=initMap&libraries=places&v=weekly`
    }),
  ],
  devServer: {
    port: 8085,
    static: {
      directory: path.join(__dirname, 'dist')
    }
  },
};