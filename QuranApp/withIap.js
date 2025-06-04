const { withPlugins } = require("@expo/config-plugins");

module.exports = function withIap(config) {
  return withPlugins(config, [
    [
      "react-native-iap",
      {
        ios: {
          usesIAP: true,
        },p
      },
    ],
  ]);
};
