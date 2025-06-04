import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Image,
  ImageBackground,
  Dimensions,
} from "react-native";
import * as Location from "expo-location";
import moment from "moment";
import "moment/locale/fr";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";


import FajrIcon from "../../assets/menu/prayer/Fajr.svg";
import DhuhrIcon from "../../assets/menu/prayer/Dhuhr.svg";
import AsrIcon from "../../assets/menu/prayer/Asr.svg";
import MaghribIcon from "../../assets/menu/prayer/Maghrib.svg";
import IshaIcon from "../../assets/menu/prayer/Isha.svg";
const { width, height } = Dimensions.get("window");
const Prayer = () => {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [nextPrayer, setNextPrayer] = useState("");
  const [dateDisplay, setDateDisplay] = useState("");
  const [locationName, setLocationName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const timeoutRef = useRef(null);


  const fetchPrayerTimes = async () => {
    try {

      let location = await Location.getCurrentPositionAsync({});
      const latitude = location.coords.latitude;
      const longitude = location.coords.longitude;

     
      const today = moment();
      let dateForApi = today.clone();

      
      const cachedData = await AsyncStorage.getItem("prayerTimes");
      let isAfterIsha = false;

      if (cachedData) {
        const data = JSON.parse(cachedData);
        const ishaTime = moment(data.timings.Isha, "HH:mm");
        if (today.isAfter(ishaTime)) {
          isAfterIsha = true;
          dateForApi.add(1, "days");
        }
      }

      const dateString = dateForApi.format("DD-MM-YYYY");

     
      const cachedDate = await AsyncStorage.getItem("prayerTimesDate");

      if (cachedData && cachedDate === dateString) {
    
        const data = JSON.parse(cachedData);
        setPrayerTimes(data.timings);
        setLocationName(data.meta.timezone);
        setDateDisplay(formatDateDisplay(dateForApi, isAfterIsha));
        determineNextPrayer(data.timings);
        setIsLoading(false);
      } else {
        
        const response = await fetch(
          `https://api.aladhan.com/v1/timings/${dateString}?latitude=${latitude}&longitude=${longitude}&method=2&school=0`
        );
        const apiData = await response.json();

       
        await AsyncStorage.setItem("prayerTimes", JSON.stringify(apiData.data));
        await AsyncStorage.setItem("prayerTimesDate", dateString);

        setPrayerTimes(apiData.data.timings);
        setLocationName(apiData.data.meta.timezone);
        setDateDisplay(formatDateDisplay(dateForApi, isAfterIsha));
        determineNextPrayer(apiData.data.timings);
        setIsLoading(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  
  const formatDateDisplay = (date, isAfterIsha) => {
    const formattedDate = date.locale("fr").format("dddd D MMMM");
    return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  };


  const determineNextPrayer = (timings) => {
    const currentTime = moment();
    const format = "HH:mm";
    const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
    let foundNextPrayer = false;

    for (let i = 0; i < prayers.length; i++) {
      const prayerTime = moment(timings[prayers[i]], format);
      if (currentTime.isBefore(prayerTime)) {
        setNextPrayer(prayers[i]);
        scheduleNextPrayerUpdate(prayerTime);
        foundNextPrayer = true;
        break;
      }
    }

    if (!foundNextPrayer) {
      
      const fajrTime = moment(timings["Fajr"], format).add(1, "days");
      setNextPrayer("Fajr");
      scheduleNextPrayerUpdate(fajrTime);
    }
  };


  const scheduleNextPrayerUpdate = (prayerTime) => {
    const now = moment();
    const timeUntilNextPrayer = prayerTime.diff(now);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      determineNextPrayer(prayerTimes);
    }, timeUntilNextPrayer);

   
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  };

  useEffect(() => {
    (async () => {
    
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission refusée",
          "L'application a besoin d'accéder à votre localisation pour afficher les horaires de prière.",
          [{ text: "OK" }]
        );
        return;
      }

      await fetchPrayerTimes();
    })();


    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Chargement des horaires de prière...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require("../../assets/menu/prayer/background.jpg")}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <View style={styles.overlay} />
      <View style={styles.container}>
        <Text style={styles.dateText}>{dateDisplay}</Text>
        <Text style={styles.locationText}>{locationName}</Text>

        <BlurView intensity={30} style={styles.card}>
          {["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].map((prayer, index) => (
            <View key={index} style={styles.prayerRow}>
              <View style={styles.prayerInfo}>
                <Text
                  style={[
                    styles.prayerName,
                    prayer === nextPrayer ? styles.nextPrayerText : null,
                  ]}
                >
                  {prayer}
                </Text>
                {getPrayerIcon(prayer)}
              </View>
              <Text
                style={[
                  styles.prayerTime,
                  prayer === nextPrayer ? styles.nextPrayerText : null,
                ]}
              >
                {prayerTimes[prayer]}
              </Text>
            </View>
          ))}
        </BlurView>
      </View>
    </SafeAreaView>
  );
};

export default Prayer;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    position: "relative",
    backgroundColor: "#000",
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width,
    height: height,
    resizeMode: "cover",
  },
  overlay: {
    position: "absolute",
    width: width,
    height: height,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  container: {
    padding: 20,
    flex: 1,
    justifyContent: "flex-start", 
  },
  dateText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 5,
    textAlign: "center",
  },
  locationText: {
    fontSize: 16,
    color: "#CCCCCC",
    marginBottom: 15,
    textAlign: "center",
  },
  card: {
    borderRadius: 16,
    padding: 15,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    overflow: "hidden",
    marginBottom: 20,
  },
  prayerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  prayerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  prayerName: {
    fontSize: 18,
    color: "#FFFFFF",
    marginRight: 10,
  },
  prayerTime: {
    fontSize: 18,
    color: "#FFFFFF",
  },
  nextPrayerText: {
    fontWeight: "bold",
    color: "#FF2D55", 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noteContainer: {
    marginTop: 20,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 12,
    padding: 12,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  noteLine: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 4,
  },
});

const getPrayerIcon = (prayer) => {
  switch (prayer) {
    case "Fajr":
      return <FajrIcon width={24} height={24} />;
    case "Dhuhr":
      return <DhuhrIcon width={24} height={24} />;
    case "Asr":
      return <AsrIcon width={24} height={24} />;
    case "Maghrib":
      return <MaghribIcon width={24} height={24} />;
    case "Isha":
      return <IshaIcon width={24} height={24} />;
    default:
      return null;
  }
};
