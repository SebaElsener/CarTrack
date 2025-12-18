import { Audio } from 'expo-av';

const sounds = {
  success: require('../utils/beep-success.mp3'),
  error: require('../utils/beep-error.mp3'),
};

export default async function playSound(type = 'success') {
  try {
    const { sound } = await Audio.Sound.createAsync(
      sounds[type],
      { shouldPlay: true }
    );

    await sound.playAsync();

    sound.setOnPlaybackStatusUpdate(status => {
      if (status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (e) {
    console.log('Error sonido:', e);
  }
}