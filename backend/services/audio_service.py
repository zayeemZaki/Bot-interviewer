"""
Audio Processing Service
Handles speech-to-text (STT) using Deepgram.
"""

import os
from deepgram import DeepgramClient
from typing import Optional


class AudioService:
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("DEEPGRAM_API_KEY")

        if not self.api_key:
            raise ValueError("DEEPGRAM_API_KEY not found in environment")
        
        self.client = DeepgramClient(self.api_key)
    
    def transcribe_audio(self, audio_data: bytes) -> str:
        if not audio_data or len(audio_data) == 0:
            raise ValueError("Empty audio file provided")
        
        try:
            # Use the v1 media API to transcribe file
            response = self.client.listen.v1.media.transcribe_file(
                audio_data,
                model="nova-2",
                smart_format=True,
            )
            
            transcript = response.results.channels[0].alternatives[0].transcript
            return transcript
            
        except Exception as e:
            print(f"ERROR in transcription: {str(e)}")
            raise Exception(f"Transcription failed: {str(e)}")
