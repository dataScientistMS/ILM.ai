

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const ProposedQuestions = ({ questions, onQuestionPress, handleSend }) => {
  return (
    <View style={styles.container}>
      {questions.map((question, index) => (
        <TouchableOpacity
          key={index}
          style={styles.questionCard}
          onPress={() => handleSend(question)}
        >
          <Text style={styles.questionText}>{question}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  questionCard: {
    backgroundColor: "#E0F7FA",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginBottom: 10,
  },
  questionText: {
    color: "#00796B",
    fontSize: 16,
  },
});

export default ProposedQuestions;
