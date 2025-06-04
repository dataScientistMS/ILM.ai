import React, { useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  LayoutAnimation,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import QuranIcon from "../../assets/Chat/quran-icon2.svg";
import SunnahIcon from "../../assets/Chat/sunnah-icon.svg";
import Markdown from "react-native-markdown-display";

const ReferenceCard = React.memo(({ refData, type, handleScroll }) => {
  const [isOpen, setIsOpen] = useState(false);
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const itemRef = useRef(null);

  const toggleOpen = () => {
    const isOpening = !isOpen;

    if (isOpening) {
      setIsOpen(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.timing(rotationAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        handleScroll && handleScroll(itemRef.current);
      });
    } else {
      setIsOpen(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.timing(rotationAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
    LayoutAnimation.configureNext({
      duration: 200,
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    });
  };

  const getRotationStyle = () => {
    return {
      transform: [
        {
          rotate: rotationAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ["0deg", "-180deg"],
          }),
        },
      ],
    };
  };

  const markdownStyles = {
    body: {
      fontSize: 17,
      color: "#000000",
      fontFamily: "System",
    },
    em: {
      fontStyle: "italic",
      color: "#8E8E93",
    },
  };

  const markdownContent = useMemo(() => {
    try {
      if (refData.text) {
        return <Markdown style={markdownStyles}>{refData.text}</Markdown>;
      } else {
        return null;
      }
    } catch (error) {
      console.log(error);
      return <Text style={styles.hadithText}>{refData.text}</Text>;
    }
  }, [refData.text]);

  return (
    <View
      style={[styles.card, isOpen && styles.cardOpen]}
      ref={isOpen ? itemRef : null}
    >
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={toggleOpen}
        style={styles.headerContainer}
      >
        <View style={styles.titleContainer}>
          {type === "quran" ? (
            <>
              <Text style={styles.titleText}>
                {refData.name_simple} {refData.reference}
              </Text>
              <Text style={styles.subtitleText}>Quran</Text>
            </>
          ) : (
            <>
              <Text style={styles.titleText}>{refData.reference}</Text>
              <Text style={styles.subtitleText}>Hadith</Text>
            </>
          )}
        </View>
        <Animated.View style={getRotationStyle()}>
          <Icon name="chevron-down" size={20} color="#FF2D55" />
        </Animated.View>
      </TouchableOpacity>

      {isOpen && (
        <Animated.View style={styles.animatedCard}>
          {type === "quran" ? (
            <ScrollView style={styles.cardContent} nestedScrollEnabled={true}>
              {refData.verses.map((verse, idx) => (
                <View key={idx} style={styles.verseContainer}>
                  <Text style={styles.verseText}>{verse.text_uthmani}</Text>
                  <Text style={styles.translationText}>
                    {verse.translations["French"].text}
                  </Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <ScrollView style={styles.cardContent}>
              <Text style={styles.narrationText}>
                {refData?.narration} {"\n"}
              </Text>

              <Text style={styles.hadithText}>{refData.text}</Text>
            </ScrollView>
          )}
        </Animated.View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 10,
    width: "100%",
    alignSelf: "center",
  },
  cardOpen: {
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleContainer: {
    flexDirection: "column",
  },
  titleText: {
    fontWeight: "bold",
    fontSize: 17,
    color: "#FF2D55",
  },
  subtitleText: {
    fontSize: 15,
    color: "gray",
  },
  animatedCard: {
    overflow: "hidden",
    marginTop: 10,
  },
  cardContent: {
    maxHeight: 400,
    paddingHorizontal: 10,
  },
  verseContainer: {
    marginBottom: 10,
    paddingLeft: 10, 
    borderLeftWidth: 3,
    borderLeftColor: "#FF2D55",
  },
  verseText: {
    fontSize: 17,
    lineHeight: 22,
    color: "#000000",
    textAlign: "right",
    fontFamily: "System",
  },
  translationText: {
    fontSize: 17,
    color: "#8E8E93",
    marginTop: 2,
    fontFamily: "System",
  },
  narrationText: {
    fontWeight: "700",
    fontSize: 17,
    color: "#000000",
    fontFamily: "System",
  },
  hadithText: {
    fontSize: 17,
    color: "#000000",
    fontFamily: "System",
  },
});

export default ReferenceCard;
