import React, { useRef, useEffect } from "react";
import {
  Modal,
  Animated,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
  Text,
} from "react-native";
import { BlurView } from "expo-blur";
import Markdown from "react-native-markdown-display";
import { Ionicons } from "@expo/vector-icons"; 
import * as Clipboard from "expo-clipboard";

const ModalMenu = ({
  menuVisible,
  menuPosition,
  contentPosition,
  modalContent,

  setMenuVisible,
  handleSend,
}) => {
  const modalScaleValue = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (menuVisible) {
      Animated.spring(modalScaleValue, {
        toValue: 1,
        stiffness: 140,
        damping: 12,
        mass: 1,
        useNativeDriver: true,
      }).start();
    } else {
      modalScaleValue.setValue(0.9);
    }
  }, [menuVisible]);

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(modalContent.response);
    setMenuVisible(false);
  };

  const signalError = async () => {
    handleSend(
      "Il semblerais qu'il y ai une erreur dans le message et/ou les références associé à ce message, vérifie le message et les réferences associés en t'assurant que pour les hadiths tu te base bien sur les références du site sunnah.com :" +
        modalContent.response,
      "error"
    );
    setMenuVisible(false);
  };

  const developp = async () => {
    handleSend(
      "L'utilisateur souhaite que tu développe cette réponse, n'hésites pas à structurer ta réponse et à enrichir les références. Assure toi d'utiliser le référentiel du site sunnah.com pour les hadith :" +
        modalContent.response,
      "develop"
    );
    setMenuVisible(false);
  };

  const markdownStyles = {
    body: {
      fontSize: 16,
      fontWeight: "500",
      color: "#323533",
    },
  };

  return (
    menuVisible &&
    modalContent && (
      <Modal visible={menuVisible} transparent animationType="fade">
        <BlurView style={styles.overlay} intensity={80} tint="light">
          <TouchableOpacity
            style={styles.overlay}
            onPress={() => setMenuVisible(false)}
            activeOpacity={1}
          >
            <Animated.View
              style={[
                styles.menu,
                {
                  top: contentPosition.y,
                  left: contentPosition.x,
                },
                {
                  transform: [{ scale: modalScaleValue }],
                },
              ]}
            >
              <View style={styles.response}>
                <Markdown style={markdownStyles}>
                  {modalContent.response}
                </Markdown>
              </View>
            </Animated.View>

            <View
              style={[
                styles.menuButton,
                {
                  top: menuPosition.y,
                  left: menuPosition.x + 70,
                },
              ]}
            >
              {/* Liste des Boutons */}

              <TouchableOpacity style={styles.button} onPress={copyToClipboard}>
                <Ionicons name="copy-outline" size={20} color="#007AFF" />
                <Text style={styles.buttonText}>Copier le texte</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={signalError}>
                <Ionicons
                  name="alert-circle-outline"
                  size={20}
                  color="#FF3B30"
                />
                <Text style={styles.buttonText}>Signaler une erreur</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={developp}>
                <Ionicons name="create-outline" size={20} color="#34C759" />
                <Text style={styles.buttonText}>Développer</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </BlurView>
      </Modal>
    )
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  menu: {
    position: "absolute",
    padding: 12,
    backgroundColor: "white",
    borderRadius: 20,
    width: "96%",
    elevation: 5, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  menuButton: {
    position: "absolute",
    padding: 12,
    backgroundColor: "gray",
    borderRadius: 15,
    color: "white",
  },

  response: {},
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  buttonText: {
    marginLeft: 10,
    fontSize: 16,
    color: "white",
  },
});

export default React.memo(ModalMenu);
