import { Platform } from "react-native";

const productSkus = Platform.select({
  ios: ["ilm.ai_001"],

  android: [
    "android.test.purchased",
    "android.test.canceled",
    "android.test.refunded",
    "android.test.item_unavailable",
  ],

  default: [],
});
