import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import * as Haptics from "expo-haptics";
import SendIcon from "../../assets/Chat/send-icon3.svg";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useInteractiveStore } from "./InteractiveStore";
import InteractiveLogo from "../../assets/Chat/questionmark.circle.fill.svg";
import NotInteractiveLogo from "../../assets/Chat/questionmark.circle.svg";
const MessageInput = ({ onSend, onFocus }) => {
  const [text, setText] = useState("");

  const { isInteractive, toggleInteractive } = useInteractiveStore();

  const handleSend = () => {
    if (text) {
      onSend(text);
      setText("");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.inputContainer}>
        {isInteractive ? (
          <TouchableOpacity
            onPress={toggleInteractive}
            style={{ marginRight: 5 }}
          >
            <InteractiveLogo width={25} height={25} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={toggleInteractive}
            style={{ marginRight: 5 }}
          >
            <NotInteractiveLogo width={25} height={25} />
          </TouchableOpacity>
        )}

        <TextInput
          style={styles.input}
          placeholder="Tapez un message..."
          placeholderTextColor="#999"
          value={text}
          onChangeText={setText}
          multiline={true}
        />
        {text.length > 0 && (
          <TouchableOpacity onPress={() => setText("")}>
            <Ionicons name="close-circle" size={20} color="#8E8E93" />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
          <SendIcon width={30} height={30} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "white",
    backgroundColor: "transparent",
    
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 30,
    paddingLeft: 15,
    paddingRight: 5,
    paddingVertical: 5,

    elevation: 5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  sendButton: {
    borderRadius: 20, 
    width: 40, 
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
});

export default MessageInput;
