"""
Audio Processing Service
Handles speech-to-text (STT) using Deepgram.
"""

import os
from deepgram import DeepgramClient, PrerecordedOptions, FileSource
from typing import Optional


class AudioService:
    """Service for audio transcription using Deepgram STT."""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the AudioService with Deepgram client.
        
        Args:
            api_key: Deepgram API key. If None, uses DEEPGRAM_API_KEY env variable.
        """
        self.api_key = api_key or os.getenv("DEEPGRAM_API_KEY")
        if not self.api_key:
            raise ValueError("DEEPGRAM_API_KEY not found in environment")
        self.client = DeepgramClient(self.api_key)
    
    def transcribe_audio(self, audio_data: bytes) -> str:
        """
        Transcribe audio data to text using Deepgram.
        
        Args:
            audio_data: Audio file content as bytes
            
        Returns:
            Transcribed text
            
        Raises:
            ValueError: If audio data is empty
            Exception: If transcription fails
        """
        if not audio_data or len(audio_data) == 0:
            raise ValueError("Empty audio file provided")
        
        print(f"DEBUG: Transcribing audio file of size: {len(audio_data)} bytes")
        
        payload: FileSource = {
            "buffer": audio_data,
        }
        
        options = PrerecordedOptions(
            model="nova-2",
            smart_format=True,
        )
        
        try:
            response = self.client.listen.rest.v("1").transcribe_file(payload, options)
            transcript = response.results.channels[0].alternatives[0].transcript
            
            print(f"DEBUG: Transcript generated: '{transcript}'")
            return transcript
            
        except Exception as e:
            print(f"ERROR in transcription: {str(e)}")
            raise Exception(f"Transcription failed: {str(e)}")
