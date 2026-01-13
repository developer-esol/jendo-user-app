const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.unstable_conditionNames = ['browser', 'require', 'react-native'];

config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

config.resolver.extraNodeModules = {
  'react-native-vector-icons': require.resolve('@expo/vector-icons'),
};

module.exports = config;
