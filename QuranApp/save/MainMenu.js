import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TouchableHighlight,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Logo from "../assets/Logo.svg"; // Assurez-vous d'avoir votre logo SVG
import LinearGradient from "react-native-linear-gradient";
import Mosquee from "../assets/MainMenu/designFirstPartMainMenu.svg";
import DesignAiButton from "../assets/MainMenu/designAiButton.svg";

const { width, height } = Dimensions.get("window");

const MainMenu = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#389960", "#EEDBA4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.firstPart}
      >
        <View style={styles.welcomeView}>
          <Text style={styles.welcomeText}>Assalamu Alaikum</Text>
          <Text style={styles.name}>Mehdi</Text>
        </View>
        <Mosquee
          style={[
            styles.mosquee,
            {
              bottom: 0,
              right: 0,
            },
          ]}
          width="60%"
        />
      </LinearGradient>
      <ScrollView style={styles.secondPart}>
        <TouchableHighlight
          underlayColor="#389960"
          onPress={() => console.log("pressed")}
          style={styles.aiButton}
        >
          <View style={styles.viewAiButton}>
            <DesignAiButton></DesignAiButton>
            <Text style={styles.mainTextAiButton}>Chat with ILM.ai</Text>
          </View>
        </TouchableHighlight>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  firstPart: {
    backgroundColor: "#389960",
    flex: 3,
    overflow: "hidden",
    zIndex: 1,
  },
  secondPart: {
    flexGrow: 7,
    backgroundColor: "#F0F0F0",
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: "7%",
    zIndex: 2,
    overflow: "hidden",
  },
  mosquee: {
    position: "absolute",
  },
  welcomeText: {
    fontSize: 16,
    color: "white",
    fontWeight: "800",
  },
  welcomeView: {
    position: "absolute",
    top: "20%",
    padding: 20,
  },
  name: {
    fontSize: 26,
    fontWeight: "800",
    color: "white",
    paddingTop: 10,
  },
  aiButton: {
    width: "100%",

    backgroundColor: "white",
    marginTop: "5%",
    padding: "5%",
    borderRadius: 15,
  },
  mainTextAiButton: {
    color: "black",
    alignSelf: "center",
  },
  viewAiButton: { flexDirection: "row" },
});

export default MainMenu;
