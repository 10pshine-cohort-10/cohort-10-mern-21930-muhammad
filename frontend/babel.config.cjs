module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
    ['@babel/preset-typescript', { isTSX: true, allExtensions: true }],
  ],
  plugins: [
    /**
     * @returns {import('@babel/core').PluginObj}
     */
    function importMetaToProcessEnv() {
      return {
        visitor: {
          /**
           * @param {import('@babel/traverse').NodePath<import('@babel/types').MetaProperty>} path
           */
          MetaProperty(path) {
            path.replaceWithSourceString('({ env: process.env })');
          },
        },
      };
    },
  ],
};
