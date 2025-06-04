import Sound from "react-native-sound";

// Vous devrez peut-être initialiser Sound selon la documentation

const playAudio = (audioPath) => {
  const audioUrl = `http://0.0.0.0:8000/media/${audioPath}`;
  const sound = new Sound(audioUrl, "", (error) => {
    if (error) {
      console.log("Failed to load the sound", error);
      return;
    }
    sound.play(() => {
      sound.release();
    });
  });
};
