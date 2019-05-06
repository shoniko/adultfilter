const path = require("path");

module.exports = {
  entry: {
    main: "./background_src.js"
  },
  output: {
    filename: "background.js",
    path: path.resolve(__dirname, "")
  },
  optimization: {
    minimize: false
  },
  devtool: "source-map"
};
