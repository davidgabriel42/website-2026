module.exports = {
  style: {
    postcss: {
      mode: "file",
    },
  },
  devServer: (devServerConfig) => {
    devServerConfig.headers = {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    };
    return devServerConfig;
  },
};
