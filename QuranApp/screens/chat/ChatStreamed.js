import React, {
  useEffect,
  useState,
  useRef,
  useContext,
  useCallback,
  useMemo,
  Markdown,
} from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
} from "react-native";
import * as Haptics from "expo-haptics";
import { InitialQuestionContext } from "./InitialQuestionContext";
import {
  getMessagesByChatId,
  saveChatToLocalDB,
  saveMessageToLocalDB,
  updateChatTitle,
  updateMessageContent,
  updateChatThreadId, 
} from "../database";
import { BlurView } from "expo-blur";
import MessageComponent from "./MessageComponent";
import MessageInput from "./MessageInput";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useInteractiveStore } from "./InteractiveStore";
import { ScrollView } from "react-native-gesture-handler";
import ListEmptyComponent from "./ListEmptyComponent";
import ListFooterComponent from "./ListFooterComponent";

const ChatStreamed = React.memo(
  ({
    navigation,
    route,

    tabId,
    handleSelectChat,
    ws,
  }) => {
    const { isInteractive, anticipatedQuestions } = useInteractiveStore();
    const [messages, setMessages] = useState([]);

    const flatListRef = useRef();
    const { initialQuestion, initialQuestionSent, setInitialQuestionSent } =
      useContext(InitialQuestionContext);

   
    const [currentChatId, setCurrentChatId] = useState(tabId.chatId);
    const [currentThreadId, setCurrentThreadId] = useState(tabId.thread_id);
    const [questions, setQuestions] = useState([]);
    const [lastAssistantMessageId, setLastAssistantMessageId] = useState(null);
    const [isStreamEnded, setIsStreamEnded] = useState(false);

    const bottomSheetModalRef = useRef(null);

    const loadQuestions = async () => {
      try {
        const listQuestions = await AsyncStorage.getItem("questions");
        setQuestions(JSON.parse(listQuestions));
      } catch (error) {
        console.error("Erreur lors de la récupération des questions :", error);
      }
    };

    useEffect(() => {
      console.log("tabid", tabId.thread_id);
      loadQuestions();
      if (currentChatId) {
        getMessagesByChatId(currentChatId, (error, fetchedMessages) => {
          if (error) {
            console.error("Erreur de chargement des messages:", error);
          } else {
            setMessages(fetchedMessages);
          }
        });
      } else {
        if (initialQuestion && !initialQuestionSent) {
          handleSend(initialQuestion);
          setInitialQuestionSent(true);
        }
      }
  

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
            const lastIndex = updatedMessages.length - 1;
            const lastMessage = updatedMessages[lastIndex];

            if (lastMessage && lastMessage.sender === "assistant") {
           
              updatedMessages[lastIndex] = {
                ...lastMessage,
                content: lastMessage.content + (message.delta || message.text),
              };
            } else {
            
              updatedMessages.push({
                sender: "assistant",
                content: message.delta || message.text,
                id: lastAssistantMessageId,
              });
            }

            return updatedMessages;
          });
        } else if (message.event === "title") {
          if (currentChatId) {
            updateChatTitle({ id: currentChatId, title: message.data });
          }
        } else if (message.event === "thread_creation") {
          const newThreadId = message.thread_id;
          console.log("Thread créé avec ID:", newThreadId);

       
          if (currentChatId) {
            updateChatThreadId({ id: currentChatId, thread_id: newThreadId });
          }

 
          setCurrentThreadId(newThreadId);
        } else if (message.event === "stream_end") {
          setIsStreamEnded(true);
        } else if (message.error) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: "assistant", content: `Erreur: ${message.error}` },
          ]);
        } else {
          console.log("Événement inconnu:", message.event);
        }
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.current.onclose = (event) => {
        console.log("Connexion WebSocket fermée:", event);
      };
    }, [currentChatId]);

    useEffect(() => {
      if (isStreamEnded && lastAssistantMessageId) {
   
        const lastAssistantMessage = messages
          .slice()
          .reverse()
          .find((msg) => msg.sender === "assistant");

        if (lastAssistantMessage) {
          updateMessageContent({
            id: lastAssistantMessageId,
            content: lastAssistantMessage.content,
          })
            .then(() => {
              console.log(
                "Contenu du message mis à jour dans la base de données."
              );
            })
            .catch((error) => {
              console.error(
                "Erreur lors de la mise à jour du message :",
                error
              );
            });
        } else {
          console.log(
            "Aucun message de l'assistant trouvé pour la mise à jour."
          );
        }
     
        setIsStreamEnded(false);
      }
    }, [isStreamEnded, lastAssistantMessageId, messages]);

    const handleSend = async (text) => {
      isSticky.current = true;
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        try {
          let data;
          let newChatId;
          if (!currentChatId) {
            data = {
              is_first_message: true,
              user_id: 1,
              content: text,
            };

            newChatId = await saveChatToLocalDB({
              title: "Nouveau chat",
              thread_id: null,
            });
            setCurrentChatId(newChatId);
          } else {
            data = {
              is_first_message: false,
              user_id: 1,
              content: text,
              thread_id: currentThreadId,
            };
          }

      
          const userMessageId = await saveMessageToLocalDB({
            content: text,
            sender: "user",
            chat: currentChatId ? currentChatId : newChatId,
          });
          console.log("test");

         
          const assistantMessageId = await saveMessageToLocalDB({
            content: "",
            sender: "assistant",
            chat: currentChatId ? currentChatId : newChatId,
          });

          if (currentChatId) {
            setMessages((prevMessages) => [
              ...prevMessages,
              { sender: "user", content: text, id: userMessageId },
              { sender: "assistant", content: "", id: assistantMessageId },
            ]);
          } else {
            setMessages((prevMessages) => [
              ...prevMessages,

              { sender: "assistant", content: "", id: assistantMessageId },
            ]);
          }

          setLastAssistantMessageId(assistantMessageId);

       
          ws.current.send(JSON.stringify(data));
          console.log("Message envoyé au serveur :", data);
        } catch (error) {
          console.error("Erreur  :", error);
        }
      } else {
        console.error("WebSocket non connecté");
      }
    };

    const handleInputFocus = useCallback(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, []);

    const renderMessage = useCallback(
      ({ item, index }) => (
        <MessageComponent
          item={item}
          isMyMessage={item.sender === "user"}
          handleSend={handleSend}
          showModalAndFetch={showModalAndFetch}
        />
      ),
      [messages, handleSend]
    );

    const showModalAndFetch = useCallback(() => {
      bottomSheetModalRef.current?.present();
    }, []);

    const isSticky = useRef(false);
    const previousScrollOffset = useRef(null);
    const handleScroll = (event) => {
      const currentOffset = event.nativeEvent.contentOffset.y;
      if (currentOffset + 15 < previousScrollOffset.current) {
        isSticky.current = false;
      } else if (currentOffset > previousScrollOffset.current) {
      }
      previousScrollOffset.current = currentOffset;
    };

    useEffect(() => console.log("sticky", isSticky.current), [isSticky]);
    const listEmpty = useMemo(
      () => (
        <ListEmptyComponent questions={questions} handleSend={handleSend} />
      ),
      [questions, handleSend]
    );
    const listFooter = useMemo(
      () =>
        isInteractive && anticipatedQuestions ? (
          <ListFooterComponent
            anticipatedQuestions={anticipatedQuestions}
            handleSend={handleSend}
          />
        ) : null,
      [anticipatedQuestions, handleSend, isInteractive]
    );

    return (
      <View style={styles.container}>
        <View style={styles.svgContainer}></View>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <FlatList
            data={messages}
            ref={flatListRef}
            keyExtractor={(item, index) => index.toString()}
            removeClippedSubviews={true}
            renderItem={({ item, index }) => renderMessage({ item, index })}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            onEndReached={() => (isSticky.current = true)}
            onScroll={handleScroll}
            ListFooterComponent={listFooter}
            onContentSizeChange={(contentWidth, contentHeight) => {
              if (isSticky.current) {
                flatListRef.current?.scrollToOffset({
                  offset: contentHeight,
                  animated: true,
                });
              }
            }}
            ListEmptyComponent={listEmpty}
          />

          <View style={styles.messageInputContainer}>
            <BlurView style={styles.blurBackground} intensity={80} tint="light">
              <MessageInput onSend={handleSend} onFocus={handleInputFocus} />
            </BlurView>
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  }
);

export default ChatStreamed;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  separator: {
    height: 10,
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
  },
  questionButton: {
    backgroundColor: "#F1F1F1",
    borderRadius: 20,
    padding: 15,
    marginVertical: 5,
    alignItems: "center",
    minHeight: 60,
  },
  footerContainer: {
    padding: 10,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    flexDirection: "row",
  },
  questionButton: {
    backgroundColor: "#323533", 
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
    minWidth: 100,
    maxWidth: 200,
    alignItems: "center",
    justifyContent: "center",
 
    marginBottom: 10,
  },
  questionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
