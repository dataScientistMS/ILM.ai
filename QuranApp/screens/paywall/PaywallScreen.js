import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import Crown from "../../assets/paywall/crown.svg";
import Brain from "../../assets/paywall/brain.head.profile.fill.svg";
import Reference from "../../assets/paywall/book.pages.fill.svg";
import Lecture from "../../assets/paywall/text.book.closed.fill.svg";
import Tools from "../../assets/paywall/wrench.and.screwdriver.fill.svg";
import Quizz from "../../assets/paywall/questionmark.svg";
import Close from "../../assets/paywall/close.svg";
import SubscriptionContext from "./SubscriptionContext";

import * as RNIap from "react-native-iap";
import InAppPurchase from "../InAppPurchase";

const productIds = ["ilm.ai_001", "ilm.ai_002", "ilm.ai_003"]; 

const PaywallScreen = ({ navigation }) => {
  const [subscription, setSubscription] = useState(2);
  const [containerWidth, setContainerWidth] = useState(0);
  const selectionPosition = useRef(new Animated.Value(0)).current;


  const options = [
    { id: 1, price: "1.99€", period: "/Semaine", productId: "ilm.ai_002" },
    { id: 2, price: "4.99€", period: "/Mois", productId: "ilm.ai_001" },
    { id: 3, price: "39.99€", period: "/Année", productId: "ilm.ai_003" },
  ];


  const { handlePurchase, isSubscribed } = useContext(SubscriptionContext);

  useEffect(() => {
    if (containerWidth > 0) {
      const optionWidth = containerWidth / options.length;
      const toValue = (subscription - 1) * optionWidth;
      Animated.timing(selectionPosition, {
        toValue,
        duration: 150,
        useNativeDriver: false,
      }).start();
    }
  }, [subscription, containerWidth]);


  const handleSubscribe = () => {
    const selectedProductId = options[subscription - 1].productId;
    handlePurchase(selectedProductId);
  };

  return (
    <View style={styles.container}>
   
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Close width={30} height={30} />
      </TouchableOpacity>

      <View style={styles.content}>
    
        <View style={{ marginBottom: 20, alignItems: "center" }}>
          <View style={styles.illustrationContainer}>
            <Image
              style={styles.logo}
              source={require("../../assets/Chat/ILM-01.png")}
            />
          </View>
          <View style={{ flexDirection: "row" }}>
            <Text style={styles.title}>ILM.ai </Text>
            <Text style={{ fontSize: 20, fontWeight: "800", color: "#FF2D55" }}>
              Premium{" "}
            </Text>
          </View>
        </View>

       
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <Brain width={24} height={24} />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>
                Accès illimité à notre modèle d'IA
              </Text>
              <Text style={styles.featureDescription}>
                Notre IA détaille les sources de toute ses réponses en
                s'appuyant sur les versets du Quran et des Hadiths du messager
                Muhammad ﷺ !
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Reference width={24} height={24} />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Références interactives</Text>
              <Text style={styles.featureDescription}>
                Cliquez sur les sources pour accéder aux textes, écouter les
                récitations, et explorer les Tafsirs — même sans connexion !
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Lecture width={24} height={24} />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>
                Lecture du Quran et des Hadiths
              </Text>
              <Text style={styles.featureDescription}>
                Lisez le Quran et les Hadiths comme à votre habitude.
                Récitation, Tafsirs, recherche de mots.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Tools width={24} height={24} />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Outils classiques</Text>
              <Text style={styles.featureDescription}>
                Appel à la prière, Qibla. D'autres fonctionnalités viendront
                prochainement, inch'Allah.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Quizz width={24} height={24} />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Quizz (à venir ⏳)</Text>
              <Text style={styles.featureDescription}>
                Testez vos connaissances grâce à des quizz élaborés par des gens
                de science, et apprenez grâce aux corrections détaillées.
              </Text>
            </View>
          </View>
        </View>

      
        <View
          style={styles.subscriptionOptions}
          onLayout={(event) => {
            const { width } = event.nativeEvent.layout;
            setContainerWidth(width);
          }}
        >
          <Animated.View
            style={[
              styles.selectionIndicator,
              {
                left: selectionPosition,
                width: containerWidth / options.length,
              },
            ]}
          >
            <Ionicons
              name="checkmark-circle"
              size={24}
              color="#FF2D55"
              style={styles.checkmarkIcon}
            />
          </Animated.View>
          {options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.subscriptionOption}
              onPress={() => setSubscription(option.id)}
            >
              <Text style={styles.subscriptionPrice}>{option.price}</Text>
              <Text style={styles.subscriptionPeriod}>{option.period}</Text>
            </TouchableOpacity>
          ))}
        </View>

      
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleSubscribe}
          activeOpacity={0.9}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "baseline",
              alignItems: "center",
            }}
          >
            <Text style={styles.continueButtonText}>Pay</Text>
            <Text style={{ color: "#FFF", fontSize: 26 }}> </Text>
          </View>
          <Text style={{ fontSize: 10, color: "gray" }}>Sans engagement</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 10,
  },
  content: {
    paddingTop: 60,
    marginHorizontal: 20,
    alignItems: "center",
  },
  illustrationContainer: {
    marginBottom: 10,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#333",
    marginBottom: 20,
  },
  featuresList: {
    width: "100%",
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  featureTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  featureDescription: {
    fontSize: 14,
    color: "#666",
  },
  subscriptionOptions: {
    flexDirection: "row",
    position: "relative",
    width: "100%",
    marginBottom: 20,
  },
  subscriptionOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  selectionIndicator: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    backgroundColor: "rgba(255,141,187,0.2)",
    borderRadius: 10,
    alignItems: "flex-end",
    paddingRight: 5,
    paddingTop: 5,
  },
  checkmarkIcon: {
    
  },
  subscriptionPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  subscriptionPeriod: {
    fontSize: 14,
    color: "#666",
  },
  continueButton: {
    width: "100%",
    paddingVertical: 10,
    backgroundColor: "black",
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  continueButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerLink: {
    fontSize: 14,
    color: "#FF2D55",
    textDecorationLine: "underline",
  },
  footerSeparator: {
    fontSize: 14,
    color: "#333",
  },
});
export default PaywallScreen;
