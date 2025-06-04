import React, { createContext, useState, useEffect } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";


const QuestionContext = createContext();

export const QuestionProvider = ({ children }) => {
  const [questions, setQuestions] = useState([]);


  const fetchQuestions = async () => {
    try {
      const response = await fetch(
        "https://ilm-ai-backend-1a3893a877c9.herokuapp.com/questions/getQuestions/"
      );
      const data = await response.json();
      setQuestions(data);
      await AsyncStorage.setItem("questions", JSON.stringify(data));
      await AsyncStorage.setItem("lastFetched", new Date().toISOString()); 
    } catch (error) {
      Alert.alert("Erreur", "Erreur lors de la récupération des questions.");
      console.error("Erreur lors de la récupération des questions:", error);
    }
  };


  const shouldFetchQuestions = async () => {
    try {
      const lastFetched = await AsyncStorage.getItem("lastFetched");
      if (!lastFetched) {
        return true;
      }
      const now = new Date();
      const lastFetchedDate = new Date(lastFetched);
      const diffInHours = (now - lastFetchedDate) / (1000 * 60 * 60);
      return diffInHours >= 24;
    } catch (error) {
      console.error(
        "Erreur lors de la vérification de la date de récupération:",
        error
      );
      return true;
    }
  };

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const shouldFetch = await shouldFetchQuestions();
        if (!shouldFetch) {
          const savedQuestions = await AsyncStorage.getItem("questions");
          if (savedQuestions) {
            setQuestions(JSON.parse(savedQuestions)); 
          }
        } else {
          await fetchQuestions(); 
        }
        console.log("context", questions);
      } catch (error) {
        console.error("Erreur lors du chargement des questions:", error);
      }
    };

    loadQuestions();
  }, []);

  return (
    <QuestionContext.Provider value={{ questions }}>
      {children}
    </QuestionContext.Provider>
  );
};


export default QuestionContext;
