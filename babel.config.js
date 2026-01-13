module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          unstable_transformImportMeta: true,
        },
      ],
    ],
    plugins: [
      [
        'babel-plugin-module-resolver',
        {
          alias: {
            'react-native-vector-icons': '@expo/vector-icons',
            'react-native-vector-icons/MaterialCommunityIcons': '@expo/vector-icons/MaterialCommunityIcons',
            'react-native-vector-icons/MaterialIcons': '@expo/vector-icons/MaterialIcons',
            'react-native-vector-icons/Ionicons': '@expo/vector-icons/Ionicons',
            'react-native-vector-icons/FontAwesome': '@expo/vector-icons/FontAwesome',
            'react-native-vector-icons/FontAwesome5': '@expo/vector-icons/FontAwesome5',
            'react-native-vector-icons/Feather': '@expo/vector-icons/Feather',
            'react-native-vector-icons/Entypo': '@expo/vector-icons/Entypo',
            'react-native-vector-icons/AntDesign': '@expo/vector-icons/AntDesign',
            'react-native-vector-icons/EvilIcons': '@expo/vector-icons/EvilIcons',
            'react-native-vector-icons/Octicons': '@expo/vector-icons/Octicons',
            'react-native-vector-icons/SimpleLineIcons': '@expo/vector-icons/SimpleLineIcons',
            'react-native-vector-icons/Zocial': '@expo/vector-icons/Zocial',
            'react-native-vector-icons/Foundation': '@expo/vector-icons/Foundation',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
