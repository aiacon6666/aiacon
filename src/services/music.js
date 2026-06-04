import { Audio } from 'expo-av';

let currentSound = null;

export const BACKGROUND_TRACKS = [
  { id: '1', title: 'Neon Drift', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: '2', title: 'Cyber Dawn', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: '3', title: 'Aura Flow', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  { id: '4', title: 'Void Walk', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
];

export async function playTrack(uri) {
  try {
    if (currentSound) {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      currentSound = null;
    }
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false });
    const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true, isLooping: true });
    currentSound = sound;
  } catch (err) {
    console.error('playTrack error', err);
  }
}

export async function stopTrack() {
  try {
    if (currentSound) {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      currentSound = null;
    }
  } catch (err) {
    console.error('stopTrack error', err);
  }
}

export async function pauseTrack() {
  try {
    if (currentSound) {
      await currentSound.pauseAsync();
    }
  } catch (err) {
    console.error('pauseTrack error', err);
  }
}
