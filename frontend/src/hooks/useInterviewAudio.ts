import { useState, useRef, useEffect, useCallback } from "react";

/**
 * Custom hook for managing audio recording and playback during interviews
 * 
 * Features:
 * - Recording audio from microphone
 * - Playing AI-generated audio responses
 * - Managing recording/playback state
 * - Proper cleanup on unmount
 */
export const useInterviewAudio = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioPermission, setAudioPermission] = useState<boolean>(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  /**
   * Start recording audio from the user's microphone
   * Requests permission if not already granted
   */
  const startRecording = useCallback(async (): Promise<void> => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setAudioPermission(true);

      // Initialize MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') 
          ? 'audio/webm' 
          : 'audio/mp4'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Handle incoming audio data
      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle errors during recording
      mediaRecorder.onerror = (event: Event) => {
        console.error("MediaRecorder error:", event);
        setIsRecording(false);
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);

    } catch (error) {
      console.error("Error accessing microphone:", error);
      setAudioPermission(false);
      
      // Provide user-friendly error messages
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          throw new Error("Microphone access denied. Please allow microphone permissions.");
        } else if (error.name === 'NotFoundError') {
          throw new Error("No microphone found. Please connect a microphone.");
        }
      }
      throw new Error("Failed to access microphone. Please check your settings.");
    }
  }, []);

  /**
   * Stop recording and return the recorded audio as a Blob
   * Returns a Promise that resolves with the audio Blob, or null if not recording
   * 
   * @returns Promise<Blob | null> - Audio blob or null if no active recording
   */
  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current;

      const stopMediaStreams = () => {
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => {
            track.stop();
            console.log('Stopped media track:', track.kind);
          });
          mediaStreamRef.current = null;
        }
        setIsRecording(false);
      };

      // If not recording, just clean up streams and return null
      if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        console.warn("stopRecording called but no active recording found");
        stopMediaStreams();
        resolve(null);
        return;
      }

      // Set up the stop handler
      mediaRecorder.onstop = () => {
        try {
          // Create blob from recorded chunks
          const audioBlob = new Blob(audioChunksRef.current, { 
            type: 'audio/wav' 
          });

          // Clean up
          audioChunksRef.current = [];
          stopMediaStreams();

          resolve(audioBlob);
        } catch (error) {
          console.error("Error creating audio blob:", error);
          stopMediaStreams();
          resolve(null);
        }
      };

      // Stop the recorder
      try {
        mediaRecorder.stop();
        setIsRecording(false);
      } catch (error) {
        console.error("Error stopping recorder:", error);
        stopMediaStreams();
        resolve(null);
      }
    });
  }, []);

  /**
   * Play audio from a base64 encoded string
   * Stops any currently playing audio before playing new audio
   * 
   * @param base64String - Base64 encoded audio data
   */
  const playAudio = useCallback((base64String: string): void => {
    try {
      // Stop any currently playing audio
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.currentTime = 0;
      }

      // Create new audio element
      const audio = new Audio(`data:audio/wav;base64,${base64String}`);
      audioPlayerRef.current = audio;

      // Set up event handlers
      audio.onplay = () => {
        setIsAudioPlaying(true);
      };

      audio.onended = () => {
        setIsAudioPlaying(false);
        audioPlayerRef.current = null;
      };

      audio.onerror = (error) => {
        console.error("Error playing audio:", error);
        setIsAudioPlaying(false);
        audioPlayerRef.current = null;
      };

      audio.onpause = () => {
        setIsAudioPlaying(false);
      };

      // Play the audio
      audio.play().catch((error) => {
        console.error("Failed to play audio:", error);
        setIsAudioPlaying(false);
        audioPlayerRef.current = null;
      });

    } catch (error) {
      console.error("Error setting up audio playback:", error);
      setIsAudioPlaying(false);
    }
  }, []);

  /**
   * Stop/interrupt currently playing audio immediately
   * Useful for allowing users to interrupt AI responses
   * 
   * - Pauses audio immediately
   * - Resets playback position to start
   * - Updates state to reflect audio stopped
   */
  const stopAudio = useCallback((): void => {
    if (audioPlayerRef.current) {
      // Immediately pause the audio
      audioPlayerRef.current.pause();
      
      // Reset playback position to the beginning
      audioPlayerRef.current.currentTime = 0;
      
      // Clear the reference
      audioPlayerRef.current = null;
    }
    
    // Always set state to false when stopping
    setIsAudioPlaying(false);
  }, []);

  /**
   * Toggle between recording and not recording
   * Returns a Promise that resolves with the audio Blob when stopping
   */
  const toggleRecording = useCallback(async (): Promise<Blob | null> => {
    if (isRecording) {
      return await stopRecording();
    } else {
      await startRecording();
      return null;
    }
  }, [isRecording, startRecording, stopRecording]);

  /**
   * Cleanup function - stops all audio/recording on unmount
   */
  useEffect(() => {
    return () => {
      // Stop any active recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      // Stop all media stream tracks
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }

      // Stop any playing audio
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.currentTime = 0;
      }
    };
  }, []);

  return {
    // State
    isRecording,
    isAudioPlaying,
    audioPermission,

    // Functions
    startRecording,
    stopRecording,
    playAudio,
    stopAudio,
    toggleRecording,
  };
};
