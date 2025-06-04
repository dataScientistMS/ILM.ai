import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import QiblaCompass from "./QiblaCompass";

const Qibla = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.loadingText}>Chargement</Text>
      <QiblaCompass
        color={"#123"} 
        backgroundColor={"#FFF"} 
        textStyles={{ textAlign: "center", fontSize: 24 }} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  loadingText: {
    fontSize: 18,
    color: "#323533",
  },
});

export default Qibla;
