import React, { createContext, useState, useEffect, useRef } from "react";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";

export const PrayerContext = createContext();

export const PrayerProvider = ({ children }) => {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [nextPrayer, setNextPrayer] = useState("");
  const [locationName, setLocationName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const timeoutRef = useRef(null);

  const fetchPrayerTimes = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const today = moment();
      const dateString = today.format("DD-MM-YYYY");

  
      const cachedData = await AsyncStorage.getItem("prayerTimes");
      const cachedDate = await AsyncStorage.getItem("prayerTimesDate");

      if (cachedData && cachedDate === dateString) {
        const data = JSON.parse(cachedData);
        if (data && data.timings) {
          setPrayerTimes(data.timings);
          setLocationName(data.meta.timezone || "Inconnu");
          determineNextPrayer(data.timings);
          setIsLoading(false);
          return;
        }
      }

     
      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${dateString}?latitude=${latitude}&longitude=${longitude}&method=2&school=0`
      );
      const apiData = await response.json();

      if (apiData && apiData.data && apiData.data.timings) {
        await AsyncStorage.setItem("prayerTimes", JSON.stringify(apiData.data));
        await AsyncStorage.setItem("prayerTimesDate", dateString);

        setPrayerTimes(apiData.data.timings);
        setLocationName(apiData.data.meta.timezone || "Inconnu");
        determineNextPrayer(apiData.data.timings);
      } else {
        throw new Error("Données de prière invalides");
      }

      setIsLoading(false);
    } catch (error) {
      console.log(
        "Erreur lors de la récupération des horaires de prière :",
        error
      );
    }
  };

  const determineNextPrayer = (timings) => {
    if (!timings) {
      console.error("Horaires de prière manquants !");
      return;
    }

    const currentTime = moment();
    const format = "HH:mm";
    const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
    let foundNextPrayer = false;

    for (const prayer of prayers) {
      const prayerTime = moment(timings[prayer], format);
      if (prayerTime.isValid() && currentTime.isBefore(prayerTime)) {
        setNextPrayer(prayer);
        scheduleNextPrayerUpdate(prayerTime);
        foundNextPrayer = true;
        break;
      }
    }

    if (!foundNextPrayer) {
      const fajrTime = moment(timings["Fajr"], format).add(1, "days");
      if (fajrTime.isValid()) {
        setNextPrayer("Fajr");
        scheduleNextPrayerUpdate(fajrTime);
      } else {
        console.error("Impossible de déterminer la prochaine prière.");
      }
    }
  };

  const scheduleNextPrayerUpdate = (prayerTime) => {
    if (!prayerTime || !prayerTime.isValid()) {
      console.error("Horaire de prière invalide pour la mise à jour !");
      return;
    }

    const now = moment();
    const timeUntilNextPrayer = prayerTime.diff(now);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (prayerTimes) {
        determineNextPrayer(prayerTimes);
      }
    }, timeUntilNextPrayer);
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Permission de localisation refusée");
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

  return (
    <PrayerContext.Provider
      value={{
        prayerTimes,
        nextPrayer,
        locationName,
        isLoading,
        fetchPrayerTimes,
      }}
    >
      {children}
    </PrayerContext.Provider>
  );
};
