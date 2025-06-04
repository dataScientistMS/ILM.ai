import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import {
  getSourateById,
  getVersesBySourateId,
  getTafsirByKeyVerse,
} from "./quranDatabase";
import { SafeAreaView } from "react-native-safe-area-context";
import Play from "../../assets/Quran/play.svg";
import Pause from "../../assets/Quran/pause.svg";
import More from "../../assets/Quran/more.svg";
import Info from "../../assets/Quran/info.svg";
import BackIcon from "../../assets/Quran/back.svg"; 
import { Audio } from "expo-av";
import ContextMenu from "react-native-context-menu-view";

import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import Markdown from "react-native-markdown-display";
import { ScrollView } from "react-native-gesture-handler";

export default function Verses({ route, navigation }) {
  const { sourateId } = route.params;

  const db = useSQLiteContext();
  const [verses, setVerses] = useState([]);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const flatListRef = useRef(null);
  const [sourateInfo, setSourateInfo] = useState();

  const bottomSheetModalRef = useRef(null);

  
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);
  const handleSheetChanges = useCallback((index) => {
    console.log("handleSheetChanges", index);
  }, []);

  const snapPoints = useMemo(() => ["50%", "80%"], []);


  useEffect(() => {
    getSourateById(db, sourateId, (err, result) => setSourateInfo(result));
    getVersesBySourateId(db, sourateId, (err, result) => setVerses(result));

    
    try {
      Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        interruptionModeIOS: 1, // DO_NOT_MIX
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: 1, // DO_NOT_MIX
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });
    } catch (error) {
      console.error("Erreur lors de la configuration du mode audio :", error);
    }
  }, []);


  useEffect(() => {
    let isCancelled = false;

    const playCurrentVerse = async () => {

      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }


      if (currentVerseIndex === null) {
        setIsPlaying(false);
        return;
      }

      try {
        const verse = verses[currentVerseIndex];
        const sourateNumber = sourateId.toString().padStart(3, "0");
        const verseNumber = verse.numero.toString().padStart(3, "0");
        const audioUrl = `https://verses.quran.com/Shuraym/mp3/${sourateNumber}${verseNumber}.mp3`;

        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          {
            shouldPlay: true,
            isLooping: false,
          }
        );

      
        newSound.setOnPlaybackStatusUpdate(async (status) => {
          if (status.didJustFinish && !isCancelled) {

            const nextIndex = currentVerseIndex + 1;
            if (nextIndex < verses.length) {
              setCurrentVerseIndex(nextIndex);
            } else {
     
              setCurrentVerseIndex(null);
            }
          }
        });

        setSound(newSound);
        setIsPlaying(true);

      
        if (flatListRef.current) {
          flatListRef.current.scrollToIndex({
            index: currentVerseIndex,
            animated: true,
          });
        }
      } catch (error) {
        console.error("Erreur lors de la lecture du verset :", error);
      }
    };

    playCurrentVerse();

   
    return () => {
      isCancelled = true;
      if (sound) {
        sound.unloadAsync();
        setSound(null);
      }
    };
  }, [currentVerseIndex]);

  useEffect(() => {
    return sound
      ? () => {
          console.log("Unloading Sound");
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);


  const onPlayPausePress = (index) => {
    if (index === currentVerseIndex) {
      
      setCurrentVerseIndex(null);
      setIsPlaying(false);
    } else {
   
      setCurrentVerseIndex(index);
    }
  };

  const renderItem = ({ item, index }) => {
    const isCurrent = index === currentVerseIndex;

    return (
      <ContextMenu actions={[{ title: "Option 1" }, { title: "Option 2" }]}>
        <View style={[styles.verseContainer, isCurrent && styles.currentVerse]}>
          <View style={styles.firstRowContainer}>
            <Text style={styles.numero}>{item.numero}.</Text>
            <View style={styles.iconsContainer}>
              <TouchableOpacity onPress={() => onPlayPausePress(index)}>
                {isCurrent && isPlaying ? (
                  <Pause width={17} height={17} style={styles.icon} />
                ) : (
                  <Play width={17} height={17} style={styles.icon} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  fetchTafsir(item.id);
                  setTitle("Tafsir du verset " + item.numero);
                }}
              >
                <More width={23} height={23} style={styles.icon} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.arabicTextContainer}>
            <Text style={styles.arabicText}>{item?.texte_arabe}</Text>
          </View>
          <Text style={styles.translationText}>{item?.texte_francais}</Text>
        </View>
      </ContextMenu>
    );
  };

  const markdownStyles = {
    body: {
      fontSize: 16,
      fontWeight: "500",
      color: "#323533",
      marginHorizontal: "6%",
    },
    heading2: {
      color: "#FF2D55",
      fontWeight: "700",
      marginLeft: "-2%",
    },
    heading3: { color: "#FF2D55", fontWeight: "600", marginLeft: "-1%" },
  };
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");

  const fetchTafsir = (numero) => {
    const keyVerse = String(sourateId) + ":" + String(numero);
    console.log(String(sourateInfo.sourateId) + ":" + String(numero));
    getTafsirByKeyVerse(db, numero, (error, result) => {
      if (error) {
        console.error("Erreur lors de la récupération du tafsir :", error);
        setTafsirText("Erreur lors de la récupération du tafsir.");
      } else {
        setContent(result?.tafsir || "Tafsir non disponible pour ce verset.");

        bottomSheetModalRef.current?.present();
      }
    });
  };

  return (
    <BottomSheetModalProvider>
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <BackIcon width={20} height={20} />
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <View style={styles.firstRow}>
              <Text style={styles.sourateName}>{sourateInfo?.name_simple}</Text>
              <Text style={styles.sourateId}> {sourateId}</Text>
            </View>

            <Text style={styles.sourateNameTranslate}>
              {sourateInfo?.name_fr}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              bottomSheetModalRef.current?.present();
              setTitle("Information de la sourate");
              setContent(sourateInfo.contexte);
            }}
            style={styles.infoButton}
          >
            <Info width={24} height={24} />
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={verses}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.list}
          extraData={[currentVerseIndex, isPlaying]}
        />
        <BottomSheetModal
          ref={bottomSheetModalRef}
          onChange={handleSheetChanges}
          backgroundStyle={styles.bottomSheetModal}
          snapPoints={snapPoints}
          enableDynamicSizing={false}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 10,
              alignSelf: "center",
            }}
          >
            {title}
          </Text>
          <BottomSheetScrollView>
            <Markdown style={markdownStyles}>{content}</Markdown>
          </BottomSheetScrollView>
        </BottomSheetModal>
      </SafeAreaView>
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "white", flex: 1 },
  list: {
    paddingHorizontal: "6%",
    paddingBottom: "20%",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 56,
  },
  backButton: {
    padding: 8,
  },
  titleContainer: {
    alignItems: "center",
  },
  firstRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sourateName: {
    fontSize: 26,
    fontWeight: "bold",
  },
  sourateId: {
    fontSize: 26,
    color: "#FF2D55",
    fontWeight: "bold",
  },
  sourateNameTranslate: {
    fontSize: 18,
    color: "gray",
    fontWeight: "500",
    alignSelf: "center",
  },
  infoButton: {
    padding: 8,
  },
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
    fontSize: 22,
    fontWeight: "500",
    alignSelf: "center",
    textAlign: "right",
    color: "black",
    marginBottom: 8,
  },
  translationText: {
    fontSize: 18,
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
  contentContainer: {
    height: 400,

    alignItems: "center",
  },
  bottomSheetModal: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2, 
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8, 
  },
});
