import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { getAllSourates, getVersesByKeyword } from "./quranDatabase";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSQLiteContext } from "expo-sqlite";
import { Ionicons } from "@expo/vector-icons"; 

const SurahSearch = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("sourate"); 
  const [sourates, setSourates] = useState([]);
  const [filteredSourates, setFilteredSourates] = useState([]);
  const [verses, setVerses] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [sortByRevelation, setSortByRevelation] = useState(false);
  const db = useSQLiteContext();

  useEffect(() => {
    if (activeTab === "sourate") {
      getAllSourates(db, (error, data) => {
        if (error) {
          console.error(error);
        } else {
          setSourates(data);
          setFilteredSourates(data);
        }
      });
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "sourate") {
      let data = sourates;

     
      if (searchText !== "") {
        data = data.filter(
          (item) =>
            item.name_fr.toLowerCase().includes(searchText.toLowerCase()) ||
            item.name_simple.toLowerCase().includes(searchText.toLowerCase())
        );
      }

  
      const sortedData = data.sort((a, b) => {
        if (sortByRevelation) {
          return a.ordre_revelation - b.ordre_revelation;
        } else {
          return a.id - b.id;
        }
      });

      setFilteredSourates(sortedData);
    } else if (activeTab === "mot" && searchText.length >= 3) {
      getVersesByKeyword(db, searchText, (error, data) => {
        if (error) {
          console.error(error);
        } else {
          setVerses(data);
        }
      });
    }
  }, [searchText, sortByRevelation, sourates, activeTab]);

  const handleSearch = (text) => {
    setSearchText(text);
  };

  const clearSearch = () => {
    setSearchText("");
  };

  const toggleSortMode = () => {
    setSortByRevelation((previousState) => !previousState);
  };

  const renderSourateItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("Verses", {
          sourateId: item.id,
          sourateName: item.name_simple,
          sourateNameTranslate: item.name_fr,
          sourateType: item.type_revelation,
          numero: item.numero,
          type_revelation: item.type_revelation,
        })
      }
    >
      <Text style={styles.cardNumber}>{item.id}</Text>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name_simple}</Text>
        <Text style={styles.cardSubtitle}>{item.name_fr}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderVerseItem = ({ item }) => (
    <View style={styles.verseCard}>
      <Text style={styles.verseNumber}>
        Sourate {item.sourate_id}, Verset {item.numero}
      </Text>
      <Text style={styles.verseText}>
        {item.texte_francais
          .split(new RegExp(`(${searchText})`, "gi"))
          .map((part, index) =>
            part.toLowerCase() === searchText.toLowerCase() ? (
              <Text key={index} style={styles.highlightedText}>
                {part}
              </Text>
            ) : (
              part
            )
          )}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#8E8E93"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchBar}
            placeholder="Rechercher"
            placeholderTextColor="#8E8E93"
            value={searchText}
            onChangeText={handleSearch}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#8E8E93" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={toggleSortMode}
          >
            <Ionicons
              name="swap-vertical"
              size={20}
              color="black"
              style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "sourate" && styles.activeTab]}
            onPress={() => setActiveTab("sourate")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "sourate" && styles.activeTabText,
              ]}
            >
              Recherche par Sourate
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "mot" && styles.activeTab]}
            onPress={() => setActiveTab("mot")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "mot" && styles.activeTabText,
              ]}
            >
              Recherche par Mot
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        key={activeTab === "sourate" ? "sourate-list" : "verse-list"} 
        data={activeTab === "sourate" ? filteredSourates : verses}
        renderItem={
          activeTab === "sourate" ? renderSourateItem : renderVerseItem
        }
        keyExtractor={(item) =>
          activeTab === "sourate"
            ? item.id.toString()
            : `${item.sourate_id}-${item.numero}`
        }
        numColumns={activeTab === "sourate" ? 2 : 1}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#DDDDDD",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
    backgroundColor: "#FFFFFF",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    borderRadius: 10,
    paddingHorizontal: 8,
    height: 36,
    marginBottom: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchBar: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  clearButton: {
    marginLeft: 8,
  },
  toggleButton: {
    marginLeft: 8,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#FF2D55",
  },
  tabText: {
    fontSize: 16,
    color: "#8E8E93",
  },
  activeTabText: {
    color: "#FF2D55",
    fontWeight: "bold",
  },
  list: {
    paddingHorizontal: 8,
    paddingTop: 16,
  },
  card: {
    flex: 1,
    margin: 4,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "#F8F8F8",
    borderRadius: 8,
    maxWidth: Dimensions.get("window").width / 2 - 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  },
  cardNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF2D55",
    textAlign: "center",
    marginBottom: 8,
  },
  cardContent: {
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 4,
    textAlign: "center",
  },
  verseCard: {
    backgroundColor: "#FFF8F0",
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
    marginHorizontal: 8,
  },
  verseNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    marginBottom: 4,
  },
  verseText: {
    fontSize: 16,
    color: "#000",
  },
  highlightedText: {
    fontWeight: "bold",
    color: "#FF2D55",
  },
});

export default SurahSearch;
