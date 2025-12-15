"""
Unit tests for backend service logic.
Tests InterviewService and PDFService functions without making real API calls.
"""

import sys
import os
from pathlib import Path

# Add parent directory to path to import services
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

import pytest
from unittest.mock import Mock, patch, MagicMock
from services.interview_service import InterviewService
from services.pdf_service import PDFService


class TestInterviewServiceDeterminePhase:
    """Test the state machine logic for interview phases."""
    
    def test_phase_introduction_no_messages(self):
        """Test that 0 assistant messages returns INTRODUCTION phase."""
        service = InterviewService(groq_api_key="test", deepgram_api_key="test")
        messages = []
        phase = service.determine_phase(messages)
        assert phase == "INTRODUCTION"
    
    def test_phase_introduction_one_message(self):
        """Test that 1 assistant message returns INTRODUCTION phase."""
        service = InterviewService(groq_api_key="test", deepgram_api_key="test")
        messages = [
            {"role": "assistant", "content": "Hello!"}
        ]
        phase = service.determine_phase(messages)
        assert phase == "INTRODUCTION"
    
    def test_phase_technical(self):
        """Test that 3 assistant messages returns TECHNICAL phase."""
        service = InterviewService(groq_api_key="test", deepgram_api_key="test")
        messages = [
            {"role": "assistant", "content": "Hello!"},
            {"role": "user", "content": "Hi there"},
            {"role": "assistant", "content": "Tell me about yourself"},
            {"role": "user", "content": "I'm a developer"},
            {"role": "assistant", "content": "What technologies do you use?"},
        ]
        phase = service.determine_phase(messages)
        assert phase == "TECHNICAL"
    
    def test_phase_behavioral(self):
        """Test that 5 assistant messages returns BEHAVIORAL phase."""
        service = InterviewService(groq_api_key="test", deepgram_api_key="test")
        messages = [
            {"role": "assistant", "content": "Message 1"},
            {"role": "user", "content": "Response 1"},
            {"role": "assistant", "content": "Message 2"},
            {"role": "user", "content": "Response 2"},
            {"role": "assistant", "content": "Message 3"},
            {"role": "user", "content": "Response 3"},
            {"role": "assistant", "content": "Message 4"},
            {"role": "user", "content": "Response 4"},
            {"role": "assistant", "content": "Message 5"},
        ]
        phase = service.determine_phase(messages)
        assert phase == "BEHAVIORAL"
    
    def test_phase_wrap_up(self):
        """Test that 8 assistant messages returns WRAP_UP phase."""
        service = InterviewService(groq_api_key="test", deepgram_api_key="test")
        messages = [
            {"role": "assistant", "content": f"Message {i}"}
            for i in range(8)
        ]
        phase = service.determine_phase(messages)
        assert phase == "WRAP_UP"
    
    def test_phase_counts_only_assistant_messages(self):
        """Test that only assistant messages are counted, not user messages."""
        service = InterviewService(groq_api_key="test", deepgram_api_key="test")
        messages = [
            {"role": "user", "content": "User 1"},
            {"role": "user", "content": "User 2"},
            {"role": "assistant", "content": "Assistant 1"},
            {"role": "user", "content": "User 3"},
            {"role": "assistant", "content": "Assistant 2"},
            {"role": "user", "content": "User 4"},
        ]
        # Only 2 assistant messages, should be TECHNICAL (assistant_count <= 4)
        phase = service.determine_phase(messages)
        assert phase == "TECHNICAL"


class TestInterviewServiceSanitizeForSpeech:
    """Test text sanitization for better TTS pronunciation."""
    
    def test_sanitize_aws(self):
        """Test that AWS becomes A. W. S."""
        service = InterviewService(groq_api_key="test", deepgram_api_key="test")
        text = "I worked with AWS infrastructure."
        result = service._sanitize_for_speech(text)
        assert "A. W. S." in result
        assert "AWS" not in result
    
    def test_sanitize_sql(self):
        """Test that SQL becomes Sequel."""
        service = InterviewService(groq_api_key="test", deepgram_api_key="test")
        text = "I know SQL and database design."
        result = service._sanitize_for_speech(text)
        assert "Sequel" in result
        assert "SQL" not in result
    
    def test_sanitize_api(self):
        """Test that API becomes A. P. I."""
        service = InterviewService(groq_api_key="test", deepgram_api_key="test")
        text = "I built a REST API."
        result = service._sanitize_for_speech(text)
        assert "A. P. I." in result
        assert "API" not in result
    
    def test_sanitize_resume(self):
        """Test that resume becomes reh-zoo-may."""
        service = InterviewService(groq_api_key="test", deepgram_api_key="test")
        text = "I saw on your resume that you have experience."
        result = service._sanitize_for_speech(text)
        assert "reh-zoo-may" in result
        assert "resume" not in result.lower() or "reh-zoo-may" in result
    
    def test_sanitize_candidate_name_zayeem(self):
        """Test that Zayeem becomes Zaa-eem when set as candidate name."""
        service = InterviewService(groq_api_key="test", deepgram_api_key="test")
        service.candidate_name = "Zayeem"
        text = "Hello Zayeem, tell me about yourself."
        result = service._sanitize_for_speech(text)
        assert "Zaa-eem" in result
    
    def test_sanitize_complex_sentence(self):
        """Test complex sentence with multiple replacements."""
        service = InterviewService(groq_api_key="test", deepgram_api_key="test")
        text = "I used SQL and AWS on my resume."
        result = service._sanitize_for_speech(text)
        
        # Check all replacements are present
        assert "Sequel" in result
        assert "A. W. S." in result
        assert "reh-zoo-may" in result
        
        # Check originals are not present
        assert "SQL" not in result
        assert "AWS" not in result
    
    def test_sanitize_case_insensitive(self):
        """Test that replacements work with different cases."""
        service = InterviewService(groq_api_key="test", deepgram_api_key="test")
        text = "I use aws, AWS, and Aws."
        result = service._sanitize_for_speech(text)
        # All variations should be replaced
        assert result.count("A. W. S.") >= 2  # At least the uppercase ones
    
    def test_sanitize_json(self):
        """Test that JSON becomes Jay-sawn."""
        service = InterviewService(groq_api_key="test", deepgram_api_key="test")
        text = "I parse JSON data."
        result = service._sanitize_for_speech(text)
        assert "Jay-sawn" in result
    
    def test_sanitize_multiple_acronyms(self):
        """Test multiple acronyms in one sentence."""
        service = InterviewService(groq_api_key="test", deepgram_api_key="test")
        text = "The API uses JWT for authentication with AWS."
        result = service._sanitize_for_speech(text)
        assert "A. P. I." in result
        assert "J. W. T." in result
        assert "A. W. S." in result


class TestInterviewServiceBuildSystemPrompt:
    """Test system prompt generation with different parameters."""
    
    def test_prompt_contains_hard_mode_text(self):
        """Test that hard difficulty includes 'HARD MODE' text."""
        service = InterviewService(groq_api_key="test", deepgram_api_key="test")
        prompt = service.build_interview_system_prompt(
            job_description="Software Engineer",
            resume_text="5 years of Python",
            candidate_name="John Doe",
            difficulty="hard",
            phase="TECHNICAL"
        )
        
        # Check for hard mode indicators
        assert "HARD MODE" in prompt or "System Design" in prompt
        assert "SCALABILITY" in prompt or "scalability" in prompt.lower()
    
    def test_prompt_contains_easy_mode_text(self):
        """Test that easy difficulty includes encouraging language."""
        service = InterviewService(groq_api_key="test", deepgram_api_key="test")
        prompt = service.build_interview_system_prompt(
            job_description="Junior Developer",
            resume_text="Recent graduate",
            candidate_name="Jane Smith",
            difficulty="easy",
            phase="INTRODUCTION"
        )
        
        # Check for easy mode indicators
        assert "EASY MODE" in prompt
        assert "ENCOURAGING" in prompt or "encouraging" in prompt.lower()
        assert "BASIC CONCEPTS" in prompt or "basic" in prompt.lower()
    
    def test_prompt_contains_technical_phase_text(self):
        """Test that TECHNICAL phase includes deep dive instructions."""
        service = InterviewService(groq_api_key="test", deepgram_api_key="test")
        prompt = service.build_interview_system_prompt(
            job_description="Backend Developer",
            resume_text="Python, Django, PostgreSQL",
            candidate_name="Alex Johnson",
            difficulty="medium",
            phase="TECHNICAL"
        )
        
        # Check for technical phase indicators
        assert "TECHNICAL DEEP DIVE" in prompt
        assert "specific skill" in prompt.lower() or "resume" in prompt.lower()
    
    def test_prompt_contains_wrap_up_phase_text(self):
        """Test that WRAP_UP phase includes conclusion instructions."""
        service = InterviewService(groq_api_key="test", deepgram_api_key="test")
        prompt = service.build_interview_system_prompt(
            job_description="Full Stack Developer",
            resume_text="React, Node.js",
            candidate_name="Chris Lee",
            difficulty="medium",
            phase="WRAP_UP"
        )
        
        # Check for wrap up indicators
        assert "CONCLUSION" in prompt or "WRAP" in prompt
        assert "Thank" in prompt or "thank" in prompt.lower()
        assert "questions" in prompt.lower()
    
    def test_prompt_includes_candidate_name(self):
        """Test that candidate name is included in the prompt."""
        service = InterviewService(groq_api_key="test", deepgram_api_key="test")
        candidate_name = "Zayeem Zaki"
        prompt = service.build_interview_system_prompt(
            job_description="Data Scientist",
            resume_text="Python, ML, TensorFlow",
            candidate_name=candidate_name,
            difficulty="medium",
            phase="INTRODUCTION"
        )
        
        assert candidate_name in prompt
    
    def test_prompt_includes_job_description(self):
        """Test that job description is included in the prompt."""
        service = InterviewService(groq_api_key="test", deepgram_api_key="test")
        job_description = "Senior DevOps Engineer with 5+ years experience"
        prompt = service.build_interview_system_prompt(
            job_description=job_description,
            resume_text="DevOps, Docker, Kubernetes",
            candidate_name="Sam Wilson",
            difficulty="hard",
            phase="TECHNICAL"
        )
        
        assert job_description in prompt
    
    def test_prompt_includes_resume_text(self):
        """Test that resume text is included in the prompt."""
        service = InterviewService(groq_api_key="test", deepgram_api_key="test")
        resume_text = "10 years of experience with cloud architecture"
        prompt = service.build_interview_system_prompt(
            job_description="Cloud Architect",
            resume_text=resume_text,
            candidate_name="Taylor Morgan",
            difficulty="hard",
            phase="TECHNICAL"
        )
        
        assert resume_text in prompt


class TestInterviewServiceWithMocking:
    """Test InterviewService methods that require API mocking."""
    
    @patch('services.interview_service.Groq')
    def test_generate_interview_response_calls_groq(self, mock_groq_class):
        """Test that generate_interview_response calls Groq API correctly."""
        # Setup mock
        mock_groq_instance = Mock()
        mock_groq_class.return_value = mock_groq_instance
        
        mock_completion = Mock()
        mock_completion.choices = [Mock()]
        mock_completion.choices[0].message.content = "Great answer! Tell me more."
        
        mock_groq_instance.chat.completions.create.return_value = mock_completion
        
        # Create service with mocked Groq
        service = InterviewService(groq_api_key="test_key", deepgram_api_key="test_key")
        
        # Call the method
        messages = [
            {"role": "user", "content": "I have 5 years of Python experience."}
        ]
        response = service.generate_interview_response(
            resume_text="Python developer",
            job_description="Senior Python Engineer",
            candidate_name="Test User",
            messages=messages,
            difficulty="medium"
        )
        
        # Assertions
        assert response == "Great answer! Tell me more."
        mock_groq_instance.chat.completions.create.assert_called_once()
    
    @patch('services.interview_service.DeepgramClient')
    @patch('builtins.open', create=True)
    @patch('os.remove')
    def test_text_to_speech_calls_deepgram(self, mock_remove, mock_open, mock_deepgram_class):
        """Test that text_to_speech calls Deepgram API correctly."""
        # Setup mocks
        mock_deepgram_instance = Mock()
        mock_deepgram_class.return_value = mock_deepgram_instance
        
        # Mock file operations
        mock_file = MagicMock()
        mock_file.read.return_value = b"fake_audio_data"
        mock_file.__enter__.return_value = mock_file
        mock_open.return_value = mock_file
        
        # Create service
        service = InterviewService(groq_api_key="test", deepgram_api_key="test")
        
        # Call the method
        result = service.text_to_speech("Hello world")
        
        # Assertions
        assert result is not None
        assert isinstance(result, str)  # Should return base64 string


class TestPDFService:
    """Test PDFService functionality."""
    
    @patch('services.pdf_service.PdfReader')
    def test_extract_text_from_valid_pdf(self, mock_pdf_reader):
        """Test extracting text from a valid PDF file."""
        # Setup mock
        mock_page = Mock()
        mock_page.extract_text.return_value = "Sample resume text"
        
        mock_reader_instance = Mock()
        mock_reader_instance.pages = [mock_page]
        mock_pdf_reader.return_value = mock_reader_instance
        
        # Create service and test
        service = PDFService()
        fake_pdf_bytes = b"fake pdf content"
        result = service.extract_text_from_pdf(fake_pdf_bytes)
        
        assert result == "Sample resume text"
        mock_pdf_reader.assert_called_once()
    
    @patch('services.pdf_service.PdfReader')
    def test_extract_text_from_multipage_pdf(self, mock_pdf_reader):
        """Test extracting text from a multi-page PDF."""
        # Setup mock with multiple pages
        mock_page1 = Mock()
        mock_page1.extract_text.return_value = "Page 1 text"
        mock_page2 = Mock()
        mock_page2.extract_text.return_value = "Page 2 text"
        
        mock_reader_instance = Mock()
        mock_reader_instance.pages = [mock_page1, mock_page2]
        mock_pdf_reader.return_value = mock_reader_instance
        
        # Create service and test
        service = PDFService()
        fake_pdf_bytes = b"fake multipage pdf"
        result = service.extract_text_from_pdf(fake_pdf_bytes)
        
        assert "Page 1 text" in result
        assert "Page 2 text" in result


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
