import { useState, useCallback } from 'react';
import * as Speech from 'expo-edge-speech';
import { start, stop, requestPermissions, isAvailable, addSpeechResultListener, addSpeechErrorListener, addSpeechEndListener } from '@dbkable/react-native-speech-to-text';

export const useVoice = () => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // ========== Text-to-Speech (expo-edge-speech) ==========
  const speak = useCallback(async (text, options = {}) => {
    try {
      setIsSpeaking(true);
      await Speech.speak(text, {
        voice: options.voice || 'en-US-AriaNeural', // High-quality neural voice
        rate: options.rate || 1.0,
        ...options,
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
    }
  }, []);

  // Stop speaking (for interrupting)
  const stopSpeaking = useCallback(async () => {
    await Speech.stop();
    setIsSpeaking(false);
  }, []);

  // Get list of available voices (optional, for voice picker)
  const getVoices = useCallback(async () => {
    return await Speech.getVoices();
  }, []);

  // ========== Speech-to-Text (react-native-speech-to-text) ==========
  const startListening = useCallback(async (language = 'en-US') => {
    try {
      const available = await isAvailable();
      if (!available) {
        console.warn('Speech recognition not available');
        return false;
      }
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        console.warn('Microphone permission denied');
        return false;
      }
      setIsListening(true);
      await start({ language });
      return true;
    } catch (error) {
      console.error('STT start error:', error);
      setIsListening(false);
      return false;
    }
  }, []);

  const stopListening = useCallback(async () => {
    try {
      await stop();
    } catch (error) {
      console.error('STT stop error:', error);
    } finally {
      setIsListening(false);
    }
  }, []);

  // Set up listeners for speech results
  const setupListeners = useCallback((onResult, onError) => {
    const resultListener = addSpeechResultListener((result) => {
      setTranscript(result.transcript);
      if (onResult) onResult(result.transcript);
    });
    const errorListener = addSpeechErrorListener((error) => {
      console.error('STT error:', error);
      if (onError) onError(error);
    });
    const endListener = addSpeechEndListener(() => {
      setIsListening(false);
    });
    return () => {
      resultListener.remove();
      errorListener.remove();
      endListener.remove();
    };
  }, []);

  return {
    // TTS
    speak,
    stopSpeaking,
    getVoices,
    isSpeaking,
    // STT
    startListening,
    stopListening,
    setupListeners,
    transcript,
    isListening,
  };
};
