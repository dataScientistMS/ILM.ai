import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { Audio } from "expo-av";

const AudioContext = createContext();

export const useAudio = () => useContext(AudioContext);

export const AudioProvider = ({ children }) => {
  const soundRef = useRef(new Audio.Sound());
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [currentListAudio, setCurrentListAudio] = useState([]);

  useEffect(() => {
    // Chargement et autres initialisations ici `http://192.168.1.167:8000/media/${reference.verses[0].recitation}/`
    console.log("use effect appelé");
    // Définit un gestionnaire pour les mises à jour de statut de lecture
    soundRef.current.setOnPlaybackStatusUpdate((playbackStatus) => {
      if (playbackStatus.didJustFinish) {
        // La lecture vient de se terminer
        setIsPlaying(false);
      }
    });

    // N'oubliez pas de nettoyer
    return () => {
      soundRef.current.unloadAsync();
    };
  }, []);

  const playAudio = async (uri) => {
    console.log("on rentre");
    try {
      if (currentAudio === uri && soundRef.current) {
        console.log("current audio = uri");
        const status = await soundRef.current.getStatusAsync();
        // Si le même son est déjà en cours, le mettre en pause
        if (status.isPlaying) {
          console.log("isPlaying");
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
        } else {
          console.log(status.didJustFinish);
          console.log("isNotPlaying");
          await soundRef.current.playAsync();
          setIsPlaying(true);
        }
      } else {
        // Arrête le son actuel, si un est en cours
        console.log("currentAudio != uri");
        if (soundRef.current) {
          const status = await soundRef.current.getStatusAsync();
          if (status.isLoaded) {
            console.log("status is loaded");

            await soundRef.current.unloadAsync();
          }
        }

        console.log("Creating and playing sound");
        soundRef.current = null;
        // Crée et charge le nouveau son, puis le joue directement
        const { sound, status } = await Audio.Sound.createAsync(
          { uri } // Démarre la lecture immédiatement après le chargement
        );
        soundRef.current = sound; // Met à jour soundRef avec la nouvelle instance sonore

        soundRef.current.setOnPlaybackStatusUpdate((playbackStatus) => {
          if (playbackStatus.didJustFinish) {
            // La lecture vient de se terminer
            soundRef.current = null;
          }
        });

        await soundRef.current.playAsync();
        setIsPlaying(status.isPlaying);
        setCurrentAudio(uri); // Mémorise le son actuellement joué
      }
      const status = await soundRef.current.getStatusAsync();
    } catch (error) {
      console.error("Erreur lors de la lecture de l'audio:", error);
    }
  };

  return (
    <AudioContext.Provider value={{ playAudio, isPlaying }}>
      {children}
    </AudioContext.Provider>
  );
};
