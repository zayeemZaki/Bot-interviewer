"""
Interview Service
Handles AI interview logic including prompt generation, Groq API calls, and TTS.
"""

import os
import uuid
import base64
import json
import re
from typing import List, Dict, Optional, Tuple
from groq import Groq
from deepgram import DeepgramClient


class InterviewService:
    
    def __init__(self, groq_api_key: Optional[str] = None, deepgram_api_key: Optional[str] = None):

        self.groq_api_key = groq_api_key or os.getenv("GROQ_API_KEY")
        self.deepgram_api_key = deepgram_api_key or os.getenv("DEEPGRAM_API_KEY")
        
        if not self.groq_api_key:
            raise ValueError("GROQ_API_KEY not found in environment")
        if not self.deepgram_api_key:
            raise ValueError("DEEPGRAM_API_KEY not found in environment")
        
        self.groq_client = Groq(api_key=self.groq_api_key)
        self.deepgram_client = DeepgramClient(api_key=self.deepgram_api_key)
        self.candidate_name = None
    
    def determine_phase(self, messages: List[Dict[str, str]]) -> str:
        assistant_count = sum(1 for msg in messages if msg.get("role") == "assistant")
        
        if assistant_count <= 1:
            return "INTRODUCTION"
        elif assistant_count <= 4:
            return "TECHNICAL"
        elif assistant_count <= 7:
            return "BEHAVIORAL"
        else:
            return "WRAP_UP"
    
    def build_interview_system_prompt(
        self, 
        job_description: str, 
        resume_text: str, 
        candidate_name: str,
        difficulty: str = "medium",
        phase: str = "INTRODUCTION"
    ) -> str:

        
        difficulty_instructions = {
            "easy": """
                **EASY MODE - Foundational & Encouraging**
                - Focus on DEFINITIONS and BASIC CONCEPTS (e.g., "What is a class?", "What is an API?")
                - Ask about HIGH-LEVEL understanding without deep implementation details
                - Include SOFT SKILLS questions (teamwork, communication, work style)
                - Be ENCOURAGING and supportive in your responses
                - Examples: "What does OOP mean?", "How do you handle feedback?", "Tell me about a time you worked in a team"
                - Avoid: System design, optimization, trade-offs, complex algorithms
                """,
            "medium": """
                **MEDIUM MODE - Implementation & Practical Experience**
                - Focus on IMPLEMENTATION DETAILS and real-world scenarios
                - Ask about STANDARD PATTERNS and best practices (e.g., "How do you handle API errors?", "Explain your approach to testing")
                - Explore TRADE-OFFS between different solutions
                - Ask for CONCRETE EXAMPLES from past experience
                - Examples: "How would you structure a REST API?", "What's your debugging process?", "Explain async/await"
                - Balance: Some theory, mostly practical application
                """,
            "hard": """
                **HARD MODE - System Design & Deep Expertise**
                - Focus on SYSTEM DESIGN and SCALABILITY (e.g., "How would you scale this for 1M users?")
                - Ask about EDGE CASES, failure scenarios, and performance bottlenecks
                - Explore OPTIMIZATION strategies (time/space complexity, caching, sharding)
                - CHALLENGE ASSUMPTIONS - make them defend their architectural decisions
                - Examples: "Design a URL shortener at scale", "How would you handle eventual consistency?", "Optimize this for 10k requests/sec"
                - Expect: Deep technical knowledge, real production experience, trade-off analysis
                """
        }
        
        diff_instruction = difficulty_instructions.get(difficulty.lower(), difficulty_instructions["medium"])
        
        phase_instructions = {
            "INTRODUCTION": """
                **CURRENT PHASE: INTRODUCTION**

                **YOUR IMMEDIATE GOAL:**
                - Warmly welcome {candidate_name} to the interview
                - Keep it BRIEF (1-2 sentences max)
                - Ask them to introduce themselves and briefly describe their background
                - DO NOT ask technical questions yet - save those for the next phase

                **Example Response:**
                "Hi {candidate_name}, thanks for joining me today. Could you tell me a bit about yourself and your background?"

                **CONSTRAINTS:**
                - Keep your response under 2 sentences
                - Focus ONLY on getting their introduction
                - Be warm but professional
                """,
            "TECHNICAL": """
                **CURRENT PHASE: TECHNICAL DEEP DIVE**

                **YOUR IMMEDIATE GOAL:**
                - Pick ONE specific skill from their resume (e.g., Python, React, AWS, etc.)
                - Ask a HARD, SPECIFIC technical question about that skill
                - Do NOT accept vague answers - probe for details
                - Focus on implementation, not just theory

                **What to Cover:**
                - Architecture decisions
                - Code quality and best practices  
                - Problem-solving approach
                - Real-world experience with the technology

                **Example Questions:**
                - "I see you used React - how do you handle state management in large applications?"
                - "You mentioned Python - explain your approach to async programming and when you'd use it"
                - "Tell me about a time you had to optimize database queries. What was your approach?"

                **CONSTRAINTS:**
                - ONE question at a time
                - Make it specific to their resume
                - Challenge weak or vague answers
                - Stay in technical territory - NO behavioral questions yet
                """,
            "BEHAVIORAL": """
                **CURRENT PHASE: BEHAVIORAL & SOFT SKILLS**

                **YOUR IMMEDIATE GOAL:**
                - Shift from technical to behavioral questions
                - Assess team fit, communication, and work style
                - Focus on real situations and examples

                **What to Cover:**
                - Teamwork and collaboration
                - Handling conflict or pressure
                - Communication with non-technical stakeholders
                - Learning from failures
                - Leadership or mentorship

                **Example Questions:**
                - "Tell me about a time you disagreed with a team member. How did you handle it?"
                - "Describe a situation where you had to explain a complex technical concept to a non-technical person"
                - "What's a project that didn't go as planned? What did you learn?"

                **CONSTRAINTS:**
                - ONE question at a time
                - Ask for SPECIFIC examples (use STAR format mentally)
                - NO more technical questions - you're assessing personality and fit now
                - Listen for communication skills and self-awareness
                """,
            "WRAP_UP": """
                **CURRENT PHASE: CONCLUSION**

                **YOUR IMMEDIATE GOAL:**
                - Start wrapping up the interview
                - Thank {candidate_name} for their time
                - Ask if they have any questions for you
                - Provide brief, positive feedback
                - End the interview gracefully

                **What to Say:**
                1. "Thank you for your time today, {candidate_name}. You shared some great insights."
                2. "Before we wrap up - do you have any questions for me about the role or the team?"
                3. After their response (or if none): "Great! We'll be in touch soon. Thanks again and have a great day!"

                **CONSTRAINTS:**
                - Keep it SHORT and professional
                - Be positive (save critical feedback for the written report)
                - DO NOT ask more interview questions
                - Make them feel good about the experience
                - Signal clearly that the interview is ending
                """
        }
        
        phase_instruction = phase_instructions.get(phase, phase_instructions["INTRODUCTION"]).replace("{candidate_name}", candidate_name)
        
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

                8. **NAME FIDELITY**
                - The candidate's official name is **{candidate_name}**
                - Speech-to-text may generate phonetic errors (e.g., 'Raheem' instead of 'Zayeem')
                - You must ALWAYS use **{candidate_name}**
                - If the transcript shows a different but similar-sounding name, assume it is a typo and ignore it

                9. **NO META-TEXT**
                    - Do NOT include placeholder text like '*Awaiting response*', '[End of turn]', or any actions in asterisks
                    - Only output the spoken response content without UI cues or status markers

                **Remember:** You have full conversation history. Use it to create a coherent, adaptive interview experience.

                {phase_instruction}

                ⚠️ **CRITICAL:** The CURRENT PHASE instruction above takes ABSOLUTE PRIORITY. Follow it strictly to maintain interview flow.
            """
    
    def generate_interview_response(
        self,
        resume_text: str,
        job_description: str,
        candidate_name: str,
        messages: List[Dict[str, str]],
        difficulty: str = "medium"
    ) -> str:

        self.candidate_name = candidate_name
        
        phase = self.determine_phase(messages)
        
        system_prompt = self.build_interview_system_prompt(
            job_description, resume_text, candidate_name, difficulty, phase
        )
        
        api_messages_copy = messages.copy()
        if api_messages_copy and api_messages_copy[-1].get("role") == "user":
            original_content = api_messages_copy[-1]["content"]
            api_messages_copy[-1] = {
                "role": "user",
                "content": f"[System verified name: {candidate_name}] {original_content}"
            }
        
        api_messages = [{"role": "system", "content": system_prompt}] + api_messages_copy
        
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
    
    def _sanitize_for_speech(self, text: str) -> str:
        """
        Sanitize text for better TTS pronunciation.
        Applies pronunciation dictionary for acronyms, technical terms, and names.
        """
        # Dictionary of technical terms and names
        replace_map = {
            # Acronyms (Force letter-by-letter)
            r"\bAWS\b": "A. W. S.",
            r"\bSQL\b": "Sequel",
            r"\bAPI\b": "A. P. I.",
            r"\bCEO\b": "C. E. O.",
            r"\bCTO\b": "C. T. O.",
            r"\bUI\b": "U. I.",
            r"\bUX\b": "U. X.",
            r"\bURL\b": "U. R. L.",
            r"\bSaaS\b": "Sass",
            r"\bCI/CD\b": "C. I. C. D.",
            r"\bJWT\b": "J. W. T.",
            
            # Tech Jargon
            r"\bKubernetes\b": "Koo-ber-net-ees",
            r"\bgRPC\b": "G. R. P. C.",
            r"\bJSON\b": "Jay-sawn",
            
            # Homographs
            r"\bresume\b": "reh-zoo-may",
            r"\bResume\b": "Reh-zoo-may",
            r"\blive\b": "lye-v",  # As in "live server"
        }
        
        # User Name Injection (Dynamic)
        if self.candidate_name:
            if "Zayeem" in self.candidate_name:
                replace_map[fr"\b{re.escape(self.candidate_name)}\b"] = "Zaa-eem"
            # Add more name mappings as needed
        
        for pattern, replacement in replace_map.items():
            text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
        
        return text
    
    def text_to_speech(self, text: str) -> Optional[str]:
        try:
            sanitized_text = self._sanitize_for_speech(text)
            
            options = {
                "model": "aura-asteria-en",
            }
            
            filename = f"temp_{uuid.uuid4()}.wav"
            
            # Correct v3 syntax for TTS
            self.deepgram_client.speak.v("1").save(filename, {"text": sanitized_text}, options)
            
            # Read the saved audio file
            with open(filename, "rb") as audio_file:
                audio_data = audio_file.read()
                base64_audio = base64.b64encode(audio_data).decode("utf-8")
            
            # Clean up the temporary file
            if os.path.exists(filename):
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
        
        response_text = self.generate_interview_response(
            resume_text, job_description, candidate_name, messages, difficulty
        )
        
        audio_data = self.text_to_speech(response_text)
        
        return response_text, audio_data
    
    def build_feedback_system_prompt(self) -> str:
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

            1. **STRICT GROUNDING RULE - NO HALLUCINATIONS**
            - **YOU MUST ONLY ANALYZE TEXT PRESENT IN THE CONVERSATION HISTORY**
            - DO NOT hallucinate topics that were not discussed
            - DO NOT invent technologies, frameworks, or concepts the candidate never mentioned
            - DO NOT use example phrases like "React", "PostgreSQL", "Spring Boot" unless EXPLICITLY stated by the candidate
            - If you cannot find evidence in the transcript, do NOT make assumptions

            2. **MANDATORY CITATION RULE**
            - For EVERY improvement you suggest, you MUST quote the exact sentence the user said that triggered it
            - Format: "When you said '[EXACT QUOTE]', this was problematic because..."
            - If you cannot find an exact quote, you cannot make that improvement suggestion
            - NO GENERIC ADVICE - every piece of feedback must be grounded in the actual conversation

            3. **SHORT INTERVIEW HANDLING**
            - If the interview has fewer than 4 exchanges or lacks technical depth:
                * Give a neutral rating (5-7)
                * Explicitly state: "The interview was brief and didn't cover enough topics for a comprehensive evaluation"
                * Provide general advice: "Complete a longer session to demonstrate your full capabilities"
                * DO NOT invent technical flaws that weren't demonstrated

            4. **BE SPECIFIC - WHEN EVIDENCE EXISTS**
            - If the candidate gave a vague answer, quote it exactly and explain why it was vague
            - If they made a technical error, cite the exact statement and correct it
            - If they struggled with a concept, reference the specific exchange
            - Always tie feedback to actual evidence from the conversation

            5. **RATING SCALE (out of 10)**
            - 1-3: Poor - Major gaps, unclear communication, incorrect answers (MUST have clear evidence)
            - 4-5: Below Average - Some knowledge but lacks depth or clarity
            - 6-7: Average - Solid foundation but room for improvement
            - 8-9: Good - Strong performance with minor areas to improve
            - 10: Exceptional - Outstanding technical depth and communication

            6. **JSON OUTPUT STRUCTURE**
            Strictly follow this schema:
            - "rating": integer (1-10)
            - "feedback": string (2-3 paragraphs of analysis)
            - "improvements": array of strings (each with quoted evidence + suggestion)

            === OUTPUT FORMAT ===

            Return a valid JSON object with this EXACT structure (no markdown, no extra text):

            {
                "rating": <integer between 1-10>,
                "feedback": "<2-3 paragraph detailed analysis. Reference ONLY what actually happened. If brief, acknowledge that.>",
                "improvements": [
                    "Quote: '[EXACT USER QUOTE]' - Suggestion: [How to improve this specific response]",
                    "Quote: '[ANOTHER EXACT QUOTE]' - Suggestion: [Specific improvement]",
                    "[General advice based on interview length/depth if applicable]"
                ]
            }

            **FINAL REMINDERS:**
            - Every improvement MUST have a quoted sentence from the candidate (unless it's general length advice)
            - If the interview was too short, be honest - don't fabricate problems
            - NEVER mention technologies not discussed by the candidate
            - When in doubt: be truthful and general rather than specific and fabricated
            - Your credibility depends on grounding every claim in actual evidence

            **Your goal:** Provide honest, evidence-based feedback that helps the candidate improve based on what ACTUALLY happened.
        """
    
    def generate_feedback(self, messages: List[Dict[str, str]]) -> Dict:

        user_messages = [msg for msg in messages if msg.get("role") == "user"]
        
        if len(user_messages) < 3:
            return {
                "rating": 0,
                "feedback": "Interview was too short to provide a meaningful analysis. The conversation contained fewer than 3 exchanges, which is insufficient to evaluate technical skills, communication, or problem-solving abilities. To receive actionable feedback, please complete a longer interview session.",
                "improvements": [
                    "Complete a longer interview session (at least 5-10 exchanges) to demonstrate your full capabilities",
                    "Ensure you answer questions in detail to give the interviewer enough context to evaluate your skills",
                    "Practice mock interviews to build confidence for longer sessions"
                ]
            }
        
        system_prompt = self.build_feedback_system_prompt()
        api_messages = [{"role": "system", "content": system_prompt}] + messages
        
        try:
            completion = self.groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=api_messages,
                temperature=0.2,
                max_tokens=1000,
                top_p=1,
                stream=False,
                response_format={"type": "json_object"}
            )
            
            feedback_json = completion.choices[0].message.content
            return json.loads(feedback_json)
            
        except Exception as e:
            raise Exception(f"Feedback generation failed: {str(e)}")

