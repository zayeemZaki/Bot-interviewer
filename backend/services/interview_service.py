"""
Interview Service
Handles AI interview logic including prompt generation, Groq API calls, and TTS.
"""

import os
import base64
import json
from typing import List, Dict, Optional, Tuple
from groq import Groq
from deepgram import DeepgramClient, SpeakOptions


class InterviewService:
    """Service for managing AI interview interactions."""
    
    def __init__(self, groq_api_key: Optional[str] = None, deepgram_api_key: Optional[str] = None):
        """
        Initialize the InterviewService with AI clients.
        
        Args:
            groq_api_key: Groq API key. If None, uses GROQ_API_KEY env variable.
            deepgram_api_key: Deepgram API key. If None, uses DEEPGRAM_API_KEY env variable.
        """
        self.groq_api_key = groq_api_key or os.getenv("GROQ_API_KEY")
        self.deepgram_api_key = deepgram_api_key or os.getenv("DEEPGRAM_API_KEY")
        
        if not self.groq_api_key:
            raise ValueError("GROQ_API_KEY not found in environment")
        if not self.deepgram_api_key:
            raise ValueError("DEEPGRAM_API_KEY not found in environment")
        
        self.groq_client = Groq(api_key=self.groq_api_key)
        self.deepgram_client = DeepgramClient(self.deepgram_api_key)
    
    def build_interview_system_prompt(
        self, 
        job_description: str, 
        resume_text: str, 
        candidate_name: str,
        difficulty: str = "medium"
    ) -> str:
        """
        Build the system prompt for the interview conversation.
        
        Args:
            job_description: The job description text
            resume_text: The candidate's resume text
            candidate_name: The candidate's name
            difficulty: Interview difficulty level (easy/medium/hard)
            
        Returns:
            Formatted system prompt
        """
        
        difficulty_instructions = {
            "easy": "Ask basic, foundational questions. Focus on general concepts and high-level understanding. Be encouraging.",
            "medium": "Ask intermediate questions that require practical experience. Mix conceptual and scenario-based questions.",
            "hard": "Ask advanced, deep-dive questions. Include system design, optimization, edge cases, and architectural decisions."
        }
        
        diff_instruction = difficulty_instructions.get(difficulty.lower(), difficulty_instructions["medium"])
        
        return f"""
You are a **Senior Hiring Manager** conducting a professional technical interview for a software engineering role.

=== JOB DESCRIPTION ===
{job_description}

=== CANDIDATE RESUME ===
{resume_text}

=== YOUR ROLE & RESPONSIBILITIES ===
You are evaluating {candidate_name} for this position. Act professionally, analytically, and strategically.

=== CRITICAL INSTRUCTIONS ===

1. **PROFESSIONAL CONDUCT**
   - Address the candidate as {candidate_name} occasionally to maintain rapport
   - Maintain a professional yet conversational tone
   - Be respectful but evaluative - you're assessing fit for the role

2. **QUESTION STRATEGY**
   - Ask **ONE question at a time** - never list multiple questions
   - **NEVER repeat a question** you've already asked
   - Review the conversation history carefully before asking
   - If you've covered a topic, move to a different area

3. **DYNAMIC FOLLOW-UPS**
   - **ALWAYS read the candidate's previous answer** before responding
   - Ask relevant follow-up questions based on their specific answer
   - If they mention a technology/project, dig deeper into it
   - If their answer is vague, ask for concrete examples
   - If their answer is strong, probe edge cases or advanced scenarios

4. **DIFFICULTY LEVEL: {difficulty.upper()}**
   {diff_instruction}

5. **RESPONSE FORMAT**
   - Keep responses under 3 sentences (will be spoken aloud)
   - Start by reacting to their answer ("That's interesting...", "I see...", "Good point...")
   - Then ask your next question naturally

6. **INTERVIEW FLOW**
   - If this is the start, warmly ask them to introduce themselves
   - Cover: background, technical skills, problem-solving, behavioral questions
   - Adapt based on their resume and the job requirements
   - Progress logically through topics - don't jump randomly

7. **EVALUATION MINDSET**
   - You're not just asking questions - you're assessing competency
   - Listen for: clarity, depth of knowledge, communication skills
   - Challenge weak answers politely
   - Acknowledge strong answers but keep probing

**Remember:** You have full conversation history. Use it to create a coherent, adaptive interview experience.
"""
    
    def generate_interview_response(
        self,
        resume_text: str,
        job_description: str,
        candidate_name: str,
        messages: List[Dict[str, str]],
        difficulty: str = "medium"
    ) -> str:
        """
        Generate an AI response for the interview conversation.
        
        Args:
            resume_text: The candidate's resume text
            job_description: The job description text
            candidate_name: The candidate's name
            messages: Conversation history
            difficulty: Interview difficulty level (easy/medium/hard)
            
        Returns:
            AI-generated response text
        """
        system_prompt = self.build_interview_system_prompt(
            job_description, resume_text, candidate_name, difficulty
        )
        
        api_messages = [{"role": "system", "content": system_prompt}] + messages
        
        try:
            completion = self.groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=api_messages,
                temperature=0.6,
                max_tokens=250,
                top_p=1,
                stream=False,
            )
            
            return completion.choices[0].message.content
            
        except Exception as e:
            raise Exception(f"Groq API call failed: {str(e)}")
    
    def text_to_speech(self, text: str) -> Optional[str]:
        """
        Convert text to speech using Deepgram TTS.
        
        Args:
            text: Text to convert to speech
            
        Returns:
            Base64-encoded audio data, or None if TTS fails
        """
        try:
            options = SpeakOptions(
                model="aura-asteria-en",  # Friendly female voice
                encoding="linear16",      # WAV format
                container="wav"
            )
            
            filename = "temp_output.wav"
            self.deepgram_client.speak.rest.v("1").save(filename, {"text": text}, options)
            
            with open(filename, "rb") as audio_file:
                audio_data = audio_file.read()
                base64_audio = base64.b64encode(audio_data).decode("utf-8")
            
            os.remove(filename)
            return base64_audio
            
        except Exception as e:
            print(f"TTS Error: {e}")
            return None
    
    def process_interview_turn(
        self,
        resume_text: str,
        job_description: str,
        candidate_name: str,
        messages: List[Dict[str, str]],
        difficulty: str = "medium"
    ) -> Tuple[str, Optional[str]]:
        """
        Process a complete interview turn: generate response and convert to audio.
        
        Args:
            resume_text: The candidate's resume text
            job_description: The job description text
            candidate_name: The candidate's name
            messages: Conversation history
            difficulty: Interview difficulty level (easy/medium/hard)
            
        Returns:
            Tuple of (response_text, base64_audio)
        """
        response_text = self.generate_interview_response(
            resume_text, job_description, candidate_name, messages, difficulty
        )
        
        audio_data = self.text_to_speech(response_text)
        
        return response_text, audio_data
    
    def build_feedback_system_prompt(self) -> str:
        """
        Build the system prompt for feedback generation.
        
        Returns:
            Formatted feedback system prompt
        """
        return """
You are a **Senior Technical Interviewer Manager** conducting a thorough post-interview evaluation.

Your role is to provide **critical, specific, and actionable feedback** based ONLY on the interview transcript provided.

=== EVALUATION CRITERIA ===

Analyze the candidate's performance across:
1. **Technical Accuracy**: Did they demonstrate correct understanding of concepts?
2. **Communication Clarity**: Were answers clear, structured, and well-articulated?
3. **Depth of Knowledge**: Did they provide specifics, examples, and details?
4. **Problem-Solving Approach**: Did they think through problems methodically?
5. **Relevance**: Did answers address the question asked?

=== CRITICAL INSTRUCTIONS ===

1. **STRICT NO HALLUCINATION RULE**
   - ⚠️ **ONLY** reference quotes that appear VERBATIM in the interview transcript
   - DO NOT invent or imagine things the candidate said
   - DO NOT use example phrases like "React", "PostgreSQL", "Spring Boot", etc. unless the candidate actually mentioned them
   - If you quote something, it MUST be an exact quote from the messages list
   - When in doubt, be more general rather than fabricating specifics

2. **SHORT INTERVIEW HANDLING**
   - If the interview has fewer than 4 exchanges or lacks technical depth:
     * Give a neutral rating (5-7)
     * Acknowledge the interview was brief
     * Provide general advice like "Practice with longer sessions to demonstrate your full capabilities"
     * DO NOT invent technical flaws that weren't demonstrated
   - Only critique what was actually discussed

3. **BE SPECIFIC - WHEN EVIDENCE EXISTS**
   - If the candidate gave a vague answer, quote it exactly
   - If they made a technical error, cite the exact statement
   - If they struggled with a concept, reference the specific exchange
   - Do NOT say: "When you mentioned X" if they never mentioned X

4. **BE CONSTRUCTIVELY CRITICAL - BASED ON REALITY**
   - Critique ONLY what happened in this interview
   - Be honest about gaps in knowledge or poor explanations that ACTUALLY occurred
   - Rate fairly based on what you observed
   - If there's insufficient data to critique, say so

5. **RATING SCALE (out of 10)**
   - 1-3: Poor - Major gaps, unclear communication, incorrect answers (must have clear evidence)
   - 4-5: Below Average - Some knowledge but lacks depth or clarity
   - 6-7: Average - Solid foundation but room for improvement
   - 8-9: Good - Strong performance with minor areas to improve
   - 10: Exceptional - Outstanding technical depth and communication

=== OUTPUT FORMAT ===

Return a valid JSON object with this EXACT structure (no markdown, no extra text):

{
  "rating": <integer between 1-10>,
  "feedback": "<2-3 paragraph detailed analysis. Reference ONLY what actually happened in the interview. If the interview was short, acknowledge that.>",
  "improvements": [
    "<ONLY IF YOU FOUND AN ACTUAL WEAK ANSWER: Quote it exactly> - Suggestion for improvement",
    "<ONLY IF ANOTHER ACTUAL ISSUE EXISTS: Quote or describe the specific exchange> - How to improve",
    "<General advice based on the interview length/depth>"
  ]
}

**CRITICAL REMINDERS:**
- The improvements array must be based on ACTUAL mistakes or weaknesses found in the transcript
- If the interview was too short to demonstrate skills, be honest about that instead of inventing problems
- NEVER copy-paste generic tech examples (Redis, PostgreSQL, React, etc.) unless the candidate actually discussed those specific technologies
- When in doubt: be more general and honest rather than specific and fabricated

**Your goal:** Help the candidate improve based on what ACTUALLY happened, not what you wish had happened.
"""
    
    def generate_feedback(self, messages: List[Dict[str, str]]) -> Dict:
        """
        Generate feedback based on the interview conversation.
        
        Args:
            messages: Complete interview conversation history
            
        Returns:
            Feedback dictionary with rating, feedback text, and improvements
        """
        system_prompt = self.build_feedback_system_prompt()
        api_messages = [{"role": "system", "content": system_prompt}] + messages
        
        try:
            completion = self.groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=api_messages,
                temperature=0.2,
                max_tokens=1000,  # Increased for detailed, specific feedback
                top_p=1,
                stream=False,
                response_format={"type": "json_object"}
            )
            
            feedback_json = completion.choices[0].message.content
            return json.loads(feedback_json)
            
        except Exception as e:
            raise Exception(f"Feedback generation failed: {str(e)}")
