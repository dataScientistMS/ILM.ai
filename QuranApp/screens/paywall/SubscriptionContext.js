// SubscriptionContext.js

import React, { createContext, useState, useEffect } from "react";
import * as RNIap from "react-native-iap";
import { Alert } from "react-native";

const SubscriptionContext = createContext();

const productIds = ["ilm.ai_001", "ilm.ai_002", "ilm.ai_003"];

export const SubscriptionProvider = ({ children }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  /*
  useEffect(() => {
    const initIAP = async () => {
      try {
        await RNIap.initConnection();
        console.log("IAP Connection initialized");

        const subscriptions = await RNIap.getSubscriptions({
          skus: productIds,
        });
        console.log(subscriptions);

        checkSubscriptionStatus();
      } catch (err) {
        console.warn(err);
      }
    };

    initIAP();

    return () => {
      RNIap.endConnection();
    };
  }, []);*/

  const handlePurchase = async (productId) => {
    try {
      console.log("purchase", productId === "ilm.ai_001");
      const purchase = await RNIap.requestSubscription({
        sku: productId,
      });

      if (purchase.transactionReceipt) {
        setIsSubscribed(true);
        Alert.alert("Succès", "Abonnement activé !");
      }
    } catch (err) {
      console.warn("Erreur d'achat : ", err);
      Alert.alert("Erreur", "L'achat a échoué.");
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      const purchases = await RNIap.getAvailablePurchases();
      const activePurchase = purchases.find((purchase) =>
        productIds.includes(purchase.productId)
      );

      if (activePurchase) {
     
        setIsSubscribed(true);
        console.log("Abonnement actif trouvé, état mis à jour.");
      } else {
      
        setIsSubscribed(false);
        console.log("Aucun abonnement actif trouvé.");
      }
    } catch (err) {
      console.warn(
        "Erreur lors de la vérification des achats disponibles : ",
        err
      );
   
      setIsSubscribed(false);
    }
  };

  const handleRestorePurchases = async () => {
    await checkSubscriptionStatus();
    Alert.alert("Restauration terminée", "Vos achats ont été restaurés.");
  };

  return (
    <SubscriptionContext.Provider
      value={{
        isSubscribed,
        handlePurchase,
        checkSubscriptionStatus,
        handleRestorePurchases,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export default SubscriptionContext;
