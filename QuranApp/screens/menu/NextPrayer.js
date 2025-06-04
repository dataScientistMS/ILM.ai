import React, { useEffect, useState } from "react";
import { Text, StyleSheet, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

const NextPrayer = () => {
  const navigation = useNavigation();
  const [prayers, setPrayers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(null);


  const prayerTimes = [
    { name: "Fajr", time: "05:00" },
    { name: "Dhuhr", time: "12:30" },
    { name: "Asr", time: "15:45" },
    { name: "Maghrib", time: "18:20" },
    { name: "Isha", time: "20:00" },
  ];

  useEffect(() => {
    calculateNextPrayer();
  }, []);

  const calculateNextPrayer = () => {
    const currentTime = new Date();
    for (let i = 0; i < prayerTimes.length; i++) {
      const { time } = prayerTimes[i];
      const [hour, minute] = time.split(":").map(Number);
      const prayerTime = new Date();
      prayerTime.setHours(hour, minute, 0, 0);

      if (currentTime < prayerTime) {
        setCurrentIndex(i);
        return;
      }
    }

    setCurrentIndex(0);
  };

  if (currentIndex === null) {
    return null;
  }


  const previousIndex =
    currentIndex === 0 ? prayerTimes.length - 1 : currentIndex - 1;
  const previousPrayer = prayerTimes[previousIndex];
  const nextPrayer = prayerTimes[currentIndex];

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate("PrayerTimesScreen")}
    >
      <View style={styles.prayerContainer}>
        <Text style={styles.prayerLabel}>{previousPrayer.name}</Text>
        <Text style={styles.prayerTime}>{previousPrayer.time}</Text>
      </View>
      <View style={[styles.prayerContainer, styles.nextPrayer]}>
        <Text style={styles.prayerLabel}>{nextPrayer.name}</Text>
        <Text style={styles.prayerTime}>{nextPrayer.time}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
  },
  prayerContainer: {
    alignItems: "center",
    marginHorizontal: 5,
  },
  nextPrayer: {
    backgroundColor: "#F7F7F7",
    padding: 5,
    borderRadius: 8,
  },
  prayerLabel: {
    fontSize: 12,
    color: "#8e8e93",
  },
  prayerTime: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
});

export default NextPrayer;
