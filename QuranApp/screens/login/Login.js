import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import Logo from "../../assets/Logo.svg";
import Design from "../../assets/Welcome.svg";
import * as AppleAuthentication from "expo-apple-authentication";
import GoogleIcon from "../../assets/login/google-icon.svg";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import axios from "axios";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const Login = ({ navigation }) => {
  const logoWidth = windowWidth * 0.34;
  const logoHeight = windowHeight * 0.17;

  const [headerText, setHeaderText] = useState("");
  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    const header = "Assalamu alaykum !";
    const message =
      "Accédez à ILM.ai et posez n'importe quelle question, obtenez une réponse avec des références au Quran et à la Sunnah.";

    let headerIndex = 0;
    let messageIndex = 0;
    setHeaderText([]);
    setMessageText([]);
    const headerInterval = setInterval(() => {
      setHeaderText((prev) => prev + header[headerIndex]);
      headerIndex++;
      if (headerIndex === header.length) {
        clearInterval(headerInterval);
      }
    }, 50);

    const messageInterval = setTimeout(() => {
      const interval = setInterval(() => {
        setMessageText((prev) => prev + message[messageIndex]);
        messageIndex++;
        if (messageIndex === message.length) {
          clearInterval(interval);
        }
      }, 20);
    }, 500);

    return () => {
      clearInterval(headerInterval);
      clearInterval(messageInterval);
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      const serverAuthCode = userInfo.data.serverAuthCode;

      if (!serverAuthCode) {
        console.error("Impossible de récupérer le serverAuthCode.");
        return;
      }

      const response = await axios.post(
        "https://ilm-ai-backend-1a3893a877c9.herokuapp.com/dj-rest-auth/google/",
        {
          code: serverAuthCode,
        }
      );

      console.log("Réponse du backend:", response.data);
      navigation.navigate("MainMenu");
    } catch (error) {
      console.error(
        "Erreur lors de la connexion avec Google:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const signInWithApple = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      console.log(credential);

      const { identityToken, authorizationCode } = credential;

      if (!identityToken || !authorizationCode) {
        console.error("Missing identityToken or authorizationCode");
        return;
      }

      const response = await axios.post(
        "https://ilm-ai-backend-1a3893a877c9.herokuapp.com/dj-rest-auth/apple/",
        {
          code: authorizationCode,
          id_token: identityToken,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("Réponse du backend:", response.data);
      navigation.navigate("MainMenu");
    } catch (error) {
      console.error(
        "Apple Sign-In Error:",
        error.response ? error.response.data : error.message
      );
    }
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <Design
        style={styles.background}
        width={windowWidth}
        height={windowHeight}
      />
      <Logo width={logoWidth} height={logoHeight} style={styles.logo} />
      <View style={styles.textContainer}>
        <Text style={styles.header}>{headerText}</Text>
        <Text style={styles.message}>{messageText}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.googleButtonContainer}
          onPress={signInWithGoogle}
        >
          <GoogleIcon style={styles.googleIcon} />
          <Text style={styles.googleTextButton}>Se connecter avec Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.appleButton} onPress={signInWithApple}>
          <View style={styles.appleButtonContent}>
            <Text style={styles.appleIcon}></Text>
            <Text style={styles.appleText}>Se connecter avec Apple</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.navigate("MainMenu")}
        >
          <Text style={styles.skipText}>Passer sans se connecter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    padding: 20,
    paddingTop: 40,
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  logo: {
    alignSelf: "center",
    top: 0.1 * windowHeight,
  },
  textContainer: {
    top: windowHeight * 0.35,
  },
  header: {
    textAlign: "center",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#323533",
    marginTop: 40,
  },
  message: {
    fontSize: 16,
    color: "#gray",
    paddingHorizontal: 20,
    textAlign: "center",
    alignSelf: "center",
    marginBottom: 20,
    width: "90%",
  },
  buttonContainer: {
    position: "absolute",
    alignSelf: "center",
    bottom: 30,
    width: "90%",
    alignItems: "center",
  },
  googleButtonContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 15,
    borderRadius: 80,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#d9d9d9",
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 12,
    height: 60,
  },
  googleIcon: {
    marginRight: 10,
    width: 24,
    height: 24,
  },
  googleTextButton: {
    color: "#757575",
    fontWeight: "bold",
    fontSize: 16,
  },
  appleButton: {
    width: "100%",
    alignItems: "center",
    marginTop: 15,
    borderRadius: 80,
    backgroundColor: "black",
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 12,
    height: 60,
  },
  appleButtonContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  appleIcon: {
    color: "white",
    fontSize: 30,
    marginRight: 10,
  },
  appleText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  skipButton: {
    marginTop: 15,
  },
  skipText: {
    color: "#757575",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});

export default Login;
