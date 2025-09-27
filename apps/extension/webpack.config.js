const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('react-refresh-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isDevelopment = process.env.NODE_ENV !== 'production';

// Ensure React Refresh is completely disabled in production
if (!isDevelopment) {
  process.env.FAST_REFRESH = 'false';
}

module.exports = {
  mode: isDevelopment ? 'development' : 'production',
  devtool: isDevelopment ? 'cheap-module-source-map' : 'source-map',
  entry: {
    popup: ['./src/pages/Popup/react-refresh-fix.js', './src/pages/Popup/index.jsx'],
    options: './src/pages/Options/index.jsx',
    background: './src/pages/Background/index.js',
    content: './src/pages/Content/index.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                '@babel/preset-react'
              ],
              plugins: [
                ...(isDevelopment ? [require.resolve('react-refresh/babel')] : [])
              ]
            }
          }
        ],
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.jsx', '.js']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/pages/Popup/popup.html',
      filename: 'popup.html',
      chunks: ['popup']
    }),
    new HtmlWebpackPlugin({
      template: './src/pages/Options/options.html',
      filename: 'options.html',
      chunks: ['options']
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'manifest.json',
          to: 'manifest.json'
        },
        {
          from: 'icons',
          to: 'icons',
          noErrorOnMissing: true
        },
        {
          from: 'src/assets',
          to: 'src/assets',
          noErrorOnMissing: true
        },
        {
          from: 'src/assets/sources/svgs/Frame 427319394.png',
          to: 'icon.png',
          noErrorOnMissing: true
        }
      ]
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),
    ...(isDevelopment ? [new ReactRefreshWebpackPlugin()] : [])
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist')
    },
    port: 3000,
    hot: true
  }
};
