import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import ContextMenu from "react-native-context-menu-view";
import Play from "../../assets/Quran/play.svg";
import Pause from "../../assets/Quran/pause.svg";
import More from "../../assets/Quran/more.svg";

const VerseItem = ({
  verse,
  index,
  isCurrent,
  isPlaying,
  onPlayPausePress,
  onShowTafsir,
}) => {
  return (
    <ContextMenu actions={[{ title: "Option 1" }, { title: "Option 2" }]}>
      <View style={[styles.verseContainer, isCurrent && styles.currentVerse]}>
        <View style={styles.firstRowContainer}>
          <Text style={styles.numero}>{verse.numero}.</Text>
          <View style={styles.iconsContainer}>
            <TouchableOpacity onPress={() => onPlayPausePress(index)}>
              {isPlaying ? (
                <Pause width={17} height={17} style={styles.icon} />
              ) : (
                <Play width={17} height={17} style={styles.icon} />
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onShowTafsir(verse.id)}>
              <More width={23} height={23} style={styles.icon} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.arabicTextContainer}>
          <Text style={styles.arabicText}>{verse.texte_arabe}</Text>
        </View>
        <Text style={styles.translationText}>{verse.texte_francais}</Text>
      </View>
    </ContextMenu>
  );
};

const styles = StyleSheet.create({
  verseContainer: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  currentVerse: {
    backgroundColor: "#FFF4E6", 
  },
  arabicText: {
    fontFamily: "SF-Arabic",
    fontSize: 18,
    fontWeight: "500",
    alignSelf: "center",
    textAlign: "right",
    color: "black",
    marginBottom: 8,
  },
  translationText: {
    fontSize: 16,
    fontWeight: "500",
    alignSelf: "center",
    textAlign: "left",
    padding: 10,
    color: "#3A3A3A",
  },
  arabicTextContainer: {
    width: "100%",
    backgroundColor: "#F6F6F6",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  firstRowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  iconsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
  },
  numero: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FF2D55",
  },
  icon: {
    marginLeft: 10,
  },
});

export default VerseItem;
