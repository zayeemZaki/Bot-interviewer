from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
from groq import Groq
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI()

# Enable CORS so the frontend can talk to the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Data Models
class InterviewContext(BaseModel):
    resume_text: str
    job_description: str
    messages: List[dict] # List of {"role": "user" | "assistant", "content": "..."}

@app.post("/chat")
async def chat_endpoint(context: InterviewContext):
    
    # 1. Construct the System Prompt
    # This is the "Brain" logic. We inject the resume and JD dynamically.
    system_prompt = f"""
    You are an expert technical interviewer for a software engineering role.
    
    JOB DESCRIPTION:
    {context.job_description}
    
    CANDIDATE RESUME:
    {context.resume_text}
    
    INSTRUCTIONS:
    1. Conduct a professional, semi-technical interview based on the requirements above.
    2. Start by asking the candidate to introduce themselves if it's the start of the conversation.
    3. Ask ONE question at a time.
    4. Keep your responses concise (under 3 sentences) because this will be spoken aloud later.
    5. Do not just list questions; react to the candidate's answers.
    6. If the candidate gives a vague answer, dig deeper.
    """

    # 2. Prepare the messages list for Groq
    # We put the system prompt first, then append the conversation history
    api_messages = [{"role": "system", "content": system_prompt}] + context.messages

    try:
        # 3. Call Groq (Llama 3 8b is fast and free)
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=api_messages,
            temperature=0.6,
            max_tokens=250,
            top_p=1,
            stream=False,
        )
        
        bot_response = completion.choices[0].message.content
        return {"response": bot_response}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)