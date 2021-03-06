var webpack = require("webpack");
var path = require("path");

// variables
var isProduction = process.argv.indexOf("-p") >= 0;
var sourcePath = path.join(__dirname, "./src");
var outPath = path.join(__dirname, "./build");

// plugins
var HtmlWebpackPlugin = require("html-webpack-plugin");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  context: sourcePath,
  entry: {
    main: "./index.tsx",
    vendor: ["react", "react-dom"]
  },
  output: {
    path: outPath,
    filename: "bundle.js",
    publicPath: "/"
  },
  target: "web",
  resolve: {
    extensions: [".js", ".ts", ".tsx"],
    // Fix webpack's default behavior to not load packages with jsnext:main module
    // (jsnext:main directs not usually distributable es6 format, but es6 sources)
    mainFields: ["module", "browser", "main"]
  },
  module: {
    loaders: [
      // .ts, .tsx
      {
        test: /\.tsx?$/,
        use: isProduction
          ? "awesome-typescript-loader?module=es6"
          : ["react-hot-loader", "awesome-typescript-loader"]
      },
      // static assets
      { test: /\.html$/, use: "html-loader" },
      { test: /\.png$/, use: "url-loader?limit=10000" },
      { test: /\.jpg$/, use: "file-loader" }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      // {output}/file.txt
      { from: "assets/**/*" }
    ]),
    new webpack.LoaderOptionsPlugin({
      options: {
        context: sourcePath
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      filename: "vendor.bundle.js",
      minChunks: Infinity
    }),
    new webpack.optimize.AggressiveMergingPlugin(),
    new ExtractTextPlugin({
      filename: "styles.css",
      disable: !isProduction
    }),
    new HtmlWebpackPlugin({
      template: "index.html"
    })
  ],
  devServer: {
    contentBase: sourcePath,
    hot: true,
    stats: {
      warnings: false
    }
  },
  node: {
    // workaround for webpack-dev-server issue
    // https://github.com/webpack/webpack-dev-server/issues/60#issuecomment-103411179
    fs: "empty",
    net: "empty"
  }
};
