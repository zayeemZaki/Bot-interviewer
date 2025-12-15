import sys
import os
from pathlib import Path
from unittest.mock import Mock, patch

sys.path.insert(0, str(Path(__file__).parent.parent))

from services.interview_service import InterviewService

def test_name_recognition():
    """Test that the interview service correctly recognizes and uses the candidate's name."""
    with patch.dict(os.environ, {
        'GROQ_API_KEY': 'test_groq_key',
        'DEEPGRAM_API_KEY': 'test_deepgram_key'
    }):
        with patch('services.interview_service.Groq'), \
             patch('services.interview_service.DeepgramClient'):
            
            interview_service = InterviewService()
            
            # Mock the generate_interview_response method
            mock_response = "Nice to meet you, Raheem! Could you tell me a bit about your background?"
            interview_service.generate_interview_response = Mock(return_value=mock_response)
            
            input_text = "Hi, my name is Raheem."
            messages = [{"role": "user", "content": input_text}]
            
            actual_output = interview_service.generate_interview_response(
                resume_text="Sample resume",
                job_description="Software Engineer",
                candidate_name="Raheem",
                messages=messages
            )
            
            # Simple assertion to check the name is in the response
            assert "Raheem" in actual_output, f"Expected 'Raheem' in response, got: {actual_output}"
            assert len(actual_output) > 0, "Response should not be empty"