const serverConfig = {
  entry: './src/ipc/main.js',
  target: 'node',
  node: {
    __dirname: false,
    __filename: false,
  },
  output: {
    path: __dirname,
    filename: './build/dist/server/main.js'
  }
};

const clientConfig = {
  entry: './src/node.bin.js',
  target: 'node',
  output: {
    path: __dirname,
    filename: './build/dist/node.bundle.js'
  }
};

const pluginInstaller = {
  entry: './src/ipc/lib/pluginInstaller.js',
  target: 'node',
  node: {
    __dirname: false,
    __filename: false,
  },
  output: {
    path: __dirname,
    filename: './build/dist/ipc/lib/pluginInstaller.js'
  }
};

module.exports = [serverConfig, clientConfig, pluginInstaller];