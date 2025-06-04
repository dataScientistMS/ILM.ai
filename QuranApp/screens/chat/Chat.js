import React, {
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  memo,
} from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  Text,
  Image,
} from "react-native";
import LottieView from "lottie-react-native";
import MessageComponent from "./MessageComponent";
import MessageInput from "./MessageInput";
import {
  getMessagesByChatId,
  saveChatToLocalDB,
  saveMessageToLocalDB,
  updateFirstMessage,
} from "../database";
import * as Haptics from "expo-haptics";

import Toast from "react-native-toast-message";

import { BlurView } from "expo-blur";
import { InitialQuestionContext } from "./InitialQuestionContext";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { TouchableOpacity } from "@gorhom/bottom-sheet";

import SubscriptionContext from "../paywall/SubscriptionContext";

const Chat = memo(
  function Chat({ navigation, route, isInteractive, tabId, handleSelectChat }) {
    console.log("Render Chat");
    const userId = 1;
    const screenHeight = Dimensions.get("window").height;
    const [state, setState] = useState({
      messages: [],
      isLoading: false,
      newMessageAdded: false,
    });

    const { chatId, thread_id } = tabId;
    const { initialQuestion, initialQuestionSent, setInitialQuestionSent } =
      useContext(InitialQuestionContext);

    const { isSubscribed } = useContext(SubscriptionContext);
    const [questions, setQuestions] = useState([]);

    const flatListRef = useRef();
    const currentScrollY = useRef(0);

    const ws = useRef(null);

    useEffect(() => {
      loadQuestions();
      if (chatId) {
        getMessagesByChatId(chatId, (error, fetchedMessages) => {
          if (error) {
            console.error("Erreur de chargement des messages:", error);
          } else {
            setState((prevState) => ({
              ...prevState,
              messages: fetchedMessages,
            }));
          }
        });
      } else {
        console.log("initial", initialQuestion);
        if (initialQuestion && !initialQuestionSent) {
          handleSend(initialQuestion);
          setInitialQuestionSent(true);
        }
      }

      ws.current = new WebSocket("ws://192.168.1.167:8000/ws/chat/");

      ws.current.onopen = () => {
        console.log("Connexion WebSocket établie");
      };

      ws.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (
          message.event === "text_delta" ||
          message.event === "text_created"
        ) {
          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            const lastAssistantMessageIndex = updatedMessages
              .slice()
              .reverse()
              .findIndex((msg) => msg.sender === "assistant");

            const index =
              lastAssistantMessageIndex >= 0
                ? updatedMessages.length - 1 - lastAssistantMessageIndex
                : -1;

            if (index >= 0) {
              const lastMessage = updatedMessages[index];
              const newText =
                lastMessage.text + (message.delta || message.text);
              updatedMessages[index] = { ...lastMessage, text: newText };
            } else {
              updatedMessages.push({
                sender: "assistant",
                text: message.delta || message.text,
              });
            }
            flatListRef.current?.scrollToEnd({ animated: true });

            return updatedMessages;
          });
        } else if (message.error) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: "assistant", text: `Erreur: ${message.error}` },
          ]);
        } else {
          console.log(message.event);
        }
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.current.onclose = (event) => {
        console.log("Connexion WebSocket fermée:", event);
      };

      return () => {
        if (ws.current) {
          ws.current.close();
        }
      };
    }, []);

    const handleInputFocus = useCallback(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, []);

    const handleErrors = useCallback((error) => {
      if (error.message === "Network request failed") {
        Toast.show({
          type: "error",
          props: {
            title: "Erreur de Connexion",
            message: "Vérifiez votre connexion internet.",
          },
        });
      } else if (error.message === "server_down") {
        Toast.show({
          type: "error",
          props: {
            title: "Erreur Serveur",
            message: "Le serveur est momentanément indisponible.",
          },
        });
      } else {
        Toast.show({
          type: "error",
          props: {
            title: "Erreur Inconnue",
            message: "Une erreur inattendue est survenue.",
          },
        });
      }
    }, []);

    const handleSend2 = async (text, type = "message") => {
      if (!isSubscribed) {
        navigation.navigate("Paywall");
        return;
      }
      console.log("text handlesend", text);
      var content;
      if (type == "error") {
        content = "Signalement d'une erreur";
      } else if (type == "develop") {
        content = "Développement d'un message";
      }

      const messageToSend = {
        chat: chatId,
        sender: "self",
        content: type == "message" ? text : content,
        type: type ? type : "message",
      };
      const lastId = await saveMessageToLocalDB(messageToSend);

      setState((prevState) => ({
        ...prevState,
        messages: [...prevState.messages, { ...messageToSend, id: lastId }],
        newMessageAdded: true,
        isLoading: true,
      }));

      try {
        const requestBody = chatId
          ? {
              is_first_message: false,
              thread_id: thread_id,
              chat_id: chatId,
              content: text,
            }
          : {
              user_id: userId,
              is_first_message: true,
              content: text + " (oublie pas le titre)",
            };

        const response = await fetch(
          isInteractive
            ? "https://ilm-ai-backend-1a3893a877c9.herokuapp.com/ilmAI-interactive/insert/"
            : "https://ilm-ai-backend-1a3893a877c9.herokuapp.com/ilmAI/insert/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          }
        );

        if (!response.ok) {
          throw new Error("Échec de l'envoi du message");
        }

        const responseData = await response.json();

        if (!chatId) {
          const [apiResponse, newChatId, newThread_id] = responseData;
          await updateFirstMessage(lastId, newChatId);

          const title = apiResponse.title
            ? apiResponse.title
            : text.slice(0, 25) + "...";

          const savedMessage = {
            chat: newChatId,
            content: JSON.stringify(apiResponse),
            sender: "assistant",
          };

          await saveMessageToLocalDB(savedMessage);
          handleSelectChat(newChatId, newThread_id);

          saveChatToLocalDB({
            title: title,
            thread_id: newThread_id,
            id_backend: newChatId,
          });
        } else {
          const savedMessage = {
            chat: chatId,
            content: JSON.stringify(responseData),
            sender: "assistant",
          };
          const id = await saveMessageToLocalDB(savedMessage);
          setState((prevState) => ({
            ...prevState,
            messages: [...prevState.messages, { ...savedMessage, id: id }],
          }));
        }
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error("Erreur:", error);
        handleErrors(error);
      } finally {
        setState((prevState) => ({
          ...prevState,
          isLoading: false,
        }));
      }
    };

    const handleSend = async (text) => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        const data = chatId
          ? {
              is_first_message: false,
              thread_id: thread_id,
              content: text,
            }
          : {
              user_id: userId,
              is_first_message: true,
              content: text,
            };
        ws.current.send(JSON.stringify(data));

        console.log("Message envoyé au serveur :", data);

        setState((prevState) => ({
          ...prevState,
          messages: [...prevState.messages, data],
        }));

        setState((prevState) => ({
          ...prevState,
          messages: [...prevState.messages, { sender: "assistant", text: "" }],
        }));
      } else {
        console.error("WebSocket non connecté");
      }
    };

    const handleScroll = useCallback(
      (itemRef) => {
        if (itemRef && flatListRef.current) {
          itemRef.measureInWindow((x, y, width, height) => {
            const bottomOfItem = y + height;

            if (bottomOfItem > screenHeight - 110) {
              const delta = bottomOfItem - (screenHeight - 110);

              flatListRef.current.scrollToOffset({
                offset: currentScrollY.current + delta,
                animated: true,
              });
            }
          });
        }
      },
      [screenHeight]
    );

    const loadQuestions = async () => {
      try {
        const listQuestions = await AsyncStorage.getItem("questions");
        setQuestions(JSON.parse(listQuestions));
      } catch (error) {
        console.error("Erreur lors de la récupération des questions :", error);
      }
    };

    const onScroll = useCallback((event) => {
      currentScrollY.current = event.nativeEvent.contentOffset.y;
    }, []);

    const renderMessage = useCallback(
      ({ item, index }) => (
        <MessageComponent
          item={item}
          isMyMessage={item.sender === "self"}
          handleScroll={handleScroll}
          handleSend={handleSend}
          isLastMessage={index === state.messages.length - 1}
          key={item.id.toString()}
        />
      ),
      [state.messages, handleScroll, handleSend]
    );

    const renderTypingAnimation = useCallback(
      () => (
        <View style={styles.typingAnimationContainer}>
          <ActivityIndicator></ActivityIndicator>
        </View>
      ),
      []
    );

    const handleContentSizeChange = useCallback(() => {
      if (state.newMessageAdded) {
        flatListRef.current?.scrollToEnd({ animated: true });
        setState((prevState) => ({
          ...prevState,
          newMessageAdded: false,
        }));
      }
    }, [state.newMessageAdded]);

    return (
      <View style={styles.container}>
        <View style={styles.svgContainer}></View>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <FlatList
            onScroll={onScroll}
            ref={flatListRef}
            data={
              state.isLoading
                ? [...state.messages, { id: -1, type: "loading" }]
                : state.messages
            }
            keyExtractor={(item) => item.id.toString()}
            removeClippedSubviews={true}
            renderItem={({ item, index }) =>
              item.type === "loading"
                ? renderTypingAnimation()
                : renderMessage({ item, index })
            }
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            onContentSizeChange={handleContentSizeChange}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={{ alignItems: "center", marginTop: 20 }}>
                <Image
                  style={{ width: 100, height: 100, alignSelf: "center" }}
                  source={require("../../assets/Chat/ILM-01.png")}
                />
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "800",
                    marginVertical: 20,
                  }}
                >
                  Assalamu Alaykoum Mehdi. Comment puis-je vous aider ?
                </Text>

                <View style={{ width: "90%" }}>
                  {questions.slice(-3).map((question, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleSend(question.question_text)}
                      style={styles.questionButton}
                    >
                      <Text style={styles.questionText}>
                        {question.question_text}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          />

          <View style={styles.messageInputContainer}>
            <BlurView style={styles.blurBackground} intensity={80} tint="light">
              <MessageInput onSend={handleSend} onFocus={handleInputFocus} />
            </BlurView>
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.tabId === nextProps.tabId &&
      prevProps.isInteractive === nextProps.isInteractive
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  separator: {
    height: 10,
  },
  typingAnimationContainer: {
    justifyContent: "center",
    alignItems: "flex-start",
    padding: 10,
    backgroundColor: "transparent",
  },
  svgContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  blurBackground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 90, 
    zIndex: 10,
  },
  messageInputContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
    backgroundColor: "transparent",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1, 
    },
    shadowOpacity: 1, 
    shadowRadius: 0.8, 
    elevation: 3, 
  },
  questionButton: {
    backgroundColor: "#F1F1F1", 
    borderRadius: 20,
    padding: 15,
    marginVertical: 5,
    alignItems: "center",
    minHeight: 60,
  },

  questionText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
});

export default Chat;
