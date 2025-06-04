

import React from "react";
import { View, StyleSheet, Platform, UIManager } from "react-native";
import ReferenceCard from "./ReferenceCard";


if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ReferenceItem = ({ references, handleScroll }) => {
  console.log("Render ReferenceItem");
  return (
    <View style={styles.referencesContainer}>
      {references.quran_references.map((ref, index) => (
        <ReferenceCard
          key={`quran-${index}`}
          refData={ref}
          type="quran"
          handleScroll={handleScroll}
        />
      ))}

      {references.hadith_references.map((ref, index) => (
        <ReferenceCard
          key={`hadith-${index}`}
          refData={ref}
          type="hadith"
          handleScroll={handleScroll}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  referencesContainer: {
    marginTop: -10,
    marginBottom: 30,
    marginRight: "2%",
    marginLeft: 16,
  },
});

export default ReferenceItem;
