

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { getHadithsByBook } from "./hadithDatabase";
import HadithItem from "./HadithItem";
import { useSQLiteContext } from "expo-sqlite";

export default function HadithBook({ route }) {
  const [hadiths, setHadiths] = useState([]);
  const [loading, setLoading] = useState(true);

  const dbContext = useSQLiteContext();

  const { book } = route.params || {};

  useEffect(() => {
    if (book && book.book_arabic) {
      fetchAllHadiths(book.book_arabic, book.collection);
    } else {
      setLoading(false);
    }
  }, [book]);

  const fetchAllHadiths = (bookArabic, collection) => {
    setLoading(true);
    getHadithsByBook(
      dbContext,
      (error, rows) => {
        if (error) {
          console.error("Erreur lors de la récupération des hadiths :", error);
        } else {
          setHadiths(rows);
        }
        setLoading(false);
      },
      bookArabic,
      collection
    );
  };

  const renderOneHadith = ({ item }) => {
    return <HadithItem hadith={item} />;
  };

  const renderSeparator = () => {
    return <View style={styles.separatorBar} />;
  };

  return (
    <View style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <ImageBackground
          source={require("../../assets/hadith/1.jpg")}
          style={styles.headerImage}
        >
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.6)"]}
            style={styles.headerGradient}
          >
            <View style={styles.headerTextContainer}>
              <Text style={styles.bookName}>{book?.book_english}</Text>

              {book?.book_arabic ? (
                <Text style={styles.bookArabic}>{book.book_arabic}</Text>
              ) : null}

              <Text style={styles.bookStats}>
                {book?.hadith_count || 0} hadiths
              </Text>

              {book?.first_hadith && book?.last_hadith ? (
                <Text style={styles.hadithRange}>
                  {book.first_hadith} à {book.last_hadith}
                </Text>
              ) : null}
            </View>
          </LinearGradient>
        </ImageBackground>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#999"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={hadiths}
          keyExtractor={(item, idx) => String(item.id || idx)}
          renderItem={renderOneHadith}
          contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
          ItemSeparatorComponent={renderSeparator}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  headerContainer: {
    height: 220,
    marginBottom: 10,
  },
  headerImage: {
    flex: 1,
    resizeMode: "cover",
  },
  headerGradient: {
    flex: 1,
    justifyContent: "flex-end",
  },
  headerTextContainer: {
    padding: 16,
  },
  bookName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
  },
  bookArabic: {
    fontSize: 20,
    fontStyle: "italic",
    color: "#FFF",
    marginBottom: 10,
  },
  bookStats: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFF",
  },
  hadithRange: {
    fontSize: 14,
    fontWeight: "500",
    color: "#DDD",
    marginTop: 4,
  },
  separatorBar: {
    alignSelf: "center",
    width: "50%",
    height: 1,
    backgroundColor: "#CCC",
    margin: 20,
  },
});
