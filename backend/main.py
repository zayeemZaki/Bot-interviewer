from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

# Import service layer
from services.interview_service import InterviewService
from services.audio_service import AudioService
from services.pdf_service import PDFService

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

# Initialize services
interview_service = InterviewService()
audio_service = AudioService()
pdf_service = PDFService()

# Data Models
class InterviewContext(BaseModel):
    resume_text: str
    job_description: str
    candidate_name: str
    messages: List[dict] # List of {"role": "user" | "assistant", "content": "..."}
    difficulty: str = "medium"  # easy, medium, or hard

@app.post("/chat")
async def chat_endpoint(context: InterviewContext):
    """
    Main chat endpoint for the AI interviewer.
    Generates interview questions and responses with audio.
    """
    try:
        response_text, audio_data = interview_service.process_interview_turn(
            resume_text=context.resume_text,
            job_description=context.job_description,
            candidate_name=context.candidate_name,
            messages=context.messages,
            difficulty=context.difficulty
        )
        
        return {
            "response": response_text,
            "audio": audio_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """
    Transcribe audio to text using Deepgram STT.
    """
    try:
        audio_data = await file.read()
        transcript = audio_service.transcribe_audio(audio_data)
        return {"transcript": transcript}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.post("/process-pdf")
async def process_pdf(file: UploadFile = File(...)):
    """
    Process a PDF file and extract text.
    """
    try:
        content = await file.read()
        text = pdf_service.process_pdf(content)
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
       

@app.post("/feedback")
async def feedback_endpoint(context: InterviewContext):
    """
    Generate feedback based on the interview conversation.
    """
    try:
        feedback = interview_service.generate_feedback(context.messages)
        return feedback
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

