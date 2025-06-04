import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
} from "react-native";
import { BlurView } from "expo-blur";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");


const getCurrentWeek = () => {
  const now = new Date();
  let dayIndex = now.getDay();
  if (dayIndex === 0) dayIndex = 7; 
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayIndex - 1));
  const week = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    const iso = day.toISOString().split("T")[0];
    const dayNumber = day.getDate();
    const dayName = day.toLocaleDateString("fr-FR", { weekday: "short" });
    week.push({ iso, dayNumber, dayName });
  }
  return week;
};


const WeeklyCalendarComponent = () => {
  const week = getCurrentWeek();
  const todayIso = new Date().toISOString().split("T")[0];

  return (
    <View style={calendarStyles.calendarContainer}>
      <View style={calendarStyles.calendarHeader}>
        <MaterialIcons
          name="date-range"
          size={20}
          color="white"
          style={{ marginRight: 5 }}
        />
        <Text style={calendarStyles.headerText}>Objectifs de la semaine</Text>
      </View>
      <View style={calendarStyles.weekContainer}>
        {week.map((day) => {
          const accomplished = day.iso === todayIso; 
          return (
            <View key={day.iso} style={calendarStyles.dayContainer}>
              <View
                style={[
                  calendarStyles.dayNumberCircle,
                  {
                    backgroundColor: accomplished ? "#FF2D55" : "#d3d3d3",
                  },
                ]}
              >
                <Text
                  style={[
                    calendarStyles.dayNumberText,
                    { color: accomplished ? "#fff" : "#333" },
                  ]}
                >
                  {day.dayNumber}
                </Text>
              </View>
              <Text style={calendarStyles.dayNameText}>{day.dayName}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const calendarStyles = StyleSheet.create({
  calendarContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    marginBottom: 20,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#353332", 
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  headerText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  weekContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    backgroundColor: "#f7f7f7",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  dayContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  dayNumberCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  dayNumberText: {
    fontSize: 16,
    fontWeight: "700",
  },
  dayNameText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
});


const DailyMenu = () => {
  const navigation = useNavigation();

  // Fonction de navigation vers un écran
  const navigateTo = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
     
      <Text style={styles.sectionTitle}>Routine spirituelle</Text>
      <Text style={styles.subtitle}>Rapproche-toi de Dieu chaque jour</Text>

     
      <WeeklyCalendarComponent />

    
      <ImageBackground
        source={require("../../assets/menu/daily-background.jpg")}
        style={styles.card}
        imageStyle={styles.cardImage}
      >
        <BlurView intensity={50} style={styles.overlay} />
        <View style={styles.cardTitle}>
          <Text style={{ fontSize: 20, fontWeight: "600", color: "white" }}>
            Objectifs
          </Text>
        </View>
        <View style={styles.totalTimeContainer}>
          <MaterialIcons name="access-time" size={20} color="#FFF" />
          <Text style={styles.totalTimeText}>5 min</Text>
        </View>
        <View style={styles.contentContainer}>
   
          <TouchableOpacity style={styles.goalItem} activeOpacity={0.7}>
            <View style={styles.textContainer}>
              <Text style={styles.goalNumber}>1</Text>
              <Text style={styles.goalText}>Médite sur un verset</Text>
            </View>
          </TouchableOpacity>

        
          <TouchableOpacity style={styles.goalItem} activeOpacity={0.7}>
            <View style={styles.textContainer}>
              <Text style={styles.goalNumber}>2</Text>
              <Text style={styles.goalText}>Découvre un hadith sahih</Text>
            </View>
          </TouchableOpacity>

        
          <TouchableOpacity style={styles.goalItem} activeOpacity={0.7}>
            <View style={styles.textContainer}>
              <Text style={styles.goalNumber}>3</Text>
              <Text style={styles.goalText}>Fais du Dhikr</Text>
            </View>
          </TouchableOpacity>

    
          <TouchableOpacity style={styles.goalItem} activeOpacity={0.7}>
            <View style={styles.textContainer}>
              <Text style={styles.goalNumber}>4</Text>
              <Text style={styles.goalText}>Lis 10 versets</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.startButton}
            onPress={() => navigateTo("Meditate")}
          >
            <View style={styles.textButton}>
              <Text style={styles.goalText}>Commencer</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
};

export default DailyMenu;

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 5,
    color: "#000",
  },
  subtitle: {
    fontSize: 16,
    color: "#8e8e93",
    marginBottom: 15,
  },
  card: {
    width: "100%",
    height: 400,
    borderRadius: 16,
    overflow: "hidden",
    justifyContent: "center",
  },
  cardImage: {
    borderRadius: 16,
  },
  cardTitle: {
    position: "absolute",
    top: 20,
    left: 20,
  },
  totalTimeContainer: {
    position: "absolute",
    top: 15,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 8,
    borderRadius: 20,
  },
  totalTimeText: {
    color: "#FFF",
    marginLeft: 5,
    fontSize: 14,
    fontWeight: "600",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  contentContainer: {
    padding: 20,
  },
  goalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  textContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  goalNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FF2D55",
    marginRight: 10,
  },
  goalText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  startButton: {
    alignSelf: "center",
    position: "absolute",
    bottom: -25,
    backgroundColor: "#FF2D55",
    padding: 10,
    borderRadius: 12,
  },
});
