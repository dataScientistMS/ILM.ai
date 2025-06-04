import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Ionicons } from "@expo/vector-icons";
import SearchBySourate from "./SearchBySourate";
import SearchByKeyword from "./SearchByKeyword";
import { SafeAreaView } from "react-native-safe-area-context";

const Tab = createMaterialTopTabNavigator();

export default function SearchTabs({}) {
  const [searchText, setSearchText] = useState("");
  const [sortByRevelation, setSortByRevelation] = useState(false);

  const toggleSortMode = () => {
    setSortByRevelation((previousState) => !previousState);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "white" }}
      edges={["top", "left", "right"]}
    >


      <View style={styles.headerContainer}>
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
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Ionicons name="close-circle" size={20} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.sortContainer} onPress={toggleSortMode}>
          <Text style={styles.sortText}>
            {sortByRevelation ? "Tri par révélation" : "Tri par numéro"}
          </Text>
          <Ionicons
            name="swap-vertical"
            size={20}
            color="black"
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity>
      </View>

 
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: "#FF2D55", 
          tabBarIndicatorStyle: { backgroundColor: "#FF2D55" }, 
          tabBarLabelStyle: {
            fontWeight: "normal",
            fontFamily: "SF Pro Text",
            textTransform: "none",
            paddingHorizontal: 10, 
          },
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontWeight: "bold",
                fontFamily: "SF Pro Text",
                color: focused ? "#FF2D55" : "#8E8E93",
              }}
            >
              {route.name === "Recherche par Sourate"
                ? "Rechercher une sourate"
                : "Rechercher un mot"}
            </Text>
          ),
        })}
      >
        <Tab.Screen
          name="Recherche par Sourate"
          children={(props) => (
            <SearchBySourate
              {...props}
              searchText={searchText}
              sortByRevelation={sortByRevelation}
              setSearchText={setSearchText}
              toggleSortMode={toggleSortMode}
            />
          )}
        />
        <Tab.Screen
          name="Recherche par Mot"
          children={(props) => (
            <SearchByKeyword {...props} searchText={searchText} />
          )}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    padding: 16,
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
    fontFamily: "SF Pro Text",
  },
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sortText: {
    fontSize: 16,
    color: "#000",
  },
  toggleButton: {
    marginLeft: 8,
  },
});
