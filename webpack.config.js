const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

let prod = process.env.NODE_ENV === 'production';
let conf = {};

if (prod) {
  conf.optimization = {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          format: {
            comments: false,
          },
        },
      }),
    ],
  }
}

module.exports = {
  ...conf,
  entry: path.resolve('src/index'),
  output: {
    filename: 'bundle.[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    ...(!prod ? [new ReactRefreshPlugin()] : []),
    ...(prod ? [new CleanWebpackPlugin(), new MiniCssExtractPlugin()] : []),
    new HtmlWebpackPlugin({
      title: "我的笔记本",
      template: './index.html',
      filename: 'index.html'
    }),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
    alias: {
      '$source': path.resolve('./src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [...(prod ? [MiniCssExtractPlugin.loader] : ['style-loader']), 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(jpg|png|gif|jpeg|ico)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024,
          }
        },
        generator: {
          filename: 'images/[contenthash][ext][query]',
        }
      },
    ]
  },
  devServer: {
    hot: true,
    open: false,
  }
}

