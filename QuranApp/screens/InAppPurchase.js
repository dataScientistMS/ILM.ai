import React, { useEffect, useState } from "react";
import { View, Text, Button, Alert } from "react-native";
import * as RNIap from "react-native-iap";

const productIds = ["ilm.ai_001"]; 

const InAppPurchase = () => {
  const [subscription, setSubscription] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const initIAP = async () => {
      try {
        await RNIap.initConnection();
        console.log("IAP Connection initialized");
        const subscriptions = await RNIap.getSubscriptions({
          skus: productIds,
        });
        console.log("Subscriptions: ", subscriptions);
        setSubscription(subscriptions[0]);
        checkSubscription();
      } catch (err) {
        console.warn(err);
      }
    };

    initIAP();

    return () => {
      RNIap.endConnection();
    };
  }, []);

  const checkSubscription = async () => {
    try {
      const purchaseHistory = await RNIap.getPurchaseHistory();
      console.log("Purchase History: ", purchaseHistory);

      const activeSubscriptions = purchaseHistory.filter(
        (purchase) => purchase.productId === "ilm.ai_001"
      );

      if (activeSubscriptions.length > 0) {
        setIsSubscribed(true);
      } else {
        setIsSubscribed(false);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const handleSubscribe = async () => {
    try {
   
      const purchase = await RNIap.requestSubscription({ sku: productIds[0] });
      console.log("Purchase: ", purchase);
      setIsSubscribed(true);
    } catch (err) {
      console.warn(err);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      const restoredPurchases = await RNIap.restorePurchases();
      console.log("Restored Purchases: ", restoredPurchases);
      checkSubscription();
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>In-App Purchase</Text>
      {isSubscribed ? (
        <Text>You are subscribed to ilm.ai_001</Text>
      ) : (
        <Text>You are not subscribed to ilm.ai_001</Text>
      )}
      <Button
        title={isSubscribed ? "Subscribed" : "Subscribe"}
        onPress={handleSubscribe}
        disabled={isSubscribed}
      />
      <Button title="Restore Purchases" onPress={handleRestorePurchases} />
    </View>
  );
};

export default InAppPurchase;
