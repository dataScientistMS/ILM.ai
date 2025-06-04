import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";

const HorizontalQuestions = ({ questions, onQuestionPress }) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {questions.slice(0, 3).map((question, index) => (
          <TouchableOpacity
            key={index}
            style={styles.questionButton}
            onPress={() => onQuestionPress && onQuestionPress(question)}
          >
            <Text style={styles.questionText}>{question}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingVertical: 10,

    borderTopColor: "#ccc",
    borderTopWidth: 1,
  },
  scrollContainer: {
    paddingHorizontal: 10,
    alignItems: "center",
  },
  questionButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
  },
  questionText: {
    color: "#fff",
    fontSize: 14,
  },
});

export default HorizontalQuestions;
