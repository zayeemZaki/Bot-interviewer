"use client";
import { useState, useRef, ChangeEvent, useEffect } from "react";
import axios from "axios";
import SetupScreen from "../src/components/interview/SetupScreen";
import ActiveInterview from "../src/components/interview/ActiveInterview";
import FeedbackDisplay from "../src/components/interview/FeedbackDisplay";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Feedback {
  rating: number;
  feedback: string;
  improvements: string[];
}

export default function Home() {
  // State for Setup
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);

  // State for Chat
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const [name, setName] = useState("");

  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const [duration, setDuration] = useState(15);
  const [difficulty, setDifficulty] = useState("medium");
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      // Time is up!
      setIsActive(false);
      alert("Time is up! Generating feedback...");
      endInterview(); // Auto-trigger feedback
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const startInterview = async () => {
    if (!resume || !jobDescription || !name) return alert("Please fill in all fields");

    setTimeLeft(duration * 60); // Convert minutes to seconds
    setIsActive(true);          // Start the clock
    setIsInterviewStarted(true);

    await sendMessage(`Hello, I am ${name}.`, true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const sendMessage = async (text: string, isSystemInit = false) => {
    if (!text) return;

    const newHistory = isSystemInit
      ? []
      : [...messages, { role: "user" as const, content: text }];

    if (!isSystemInit) {
      setMessages(newHistory);
      setCurrentInput("");
    }

    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/chat", {
        resume_text: resume,
        job_description: jobDescription,
        messages: newHistory,
        candidate_name: name,
        difficulty: difficulty
      });

      const botReply = response.data.response;
      const audioBase64 = response.data.audio;

      setMessages([...newHistory, { role: "assistant", content: botReply }]);

      if (audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
        audioPlayerRef.current = audio;
        
        audio.onplay = () => setIsAudioPlaying(true);
        audio.onended = () => setIsAudioPlaying(false);
        audio.onerror = () => setIsAudioPlaying(false);
        
        audio.play().catch(e => {
          console.error("Error playing audio:", e);
          setIsAudioPlaying(false);
        });
      }

    } catch (error) {
      console.error("Error talking to AI:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Microphone access denied");
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current) return;

    mediaRecorderRef.current.stop();
    setIsRecording(false);

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });

      // Send to backend
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.wav");

      setLoading(true); // Show loading while transcribing
      try {
        const response = await axios.post("http://localhost:8000/transcribe", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const transcript = response.data.transcript;

        // Auto-send the transcribed text to the chat
        if (transcript) {
          sendMessage(transcript);
        }
      } catch (error) {
        console.error("Transcription failed", error);
      } finally {
        setLoading(false);
      }
    };
  };

  const cancelAudio = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      setIsAudioPlaying(false);
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/process-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Auto-fill the resume text area
      setResume(response.data.text);
      alert("Resume parsed successfully!");
    } catch (error) {
      console.error("Error parsing PDF:", error);
      alert("Failed to parse PDF");
    } finally {
      setLoading(false);
    }
  };

  const endInterview = async () => {
    if (messages.length === 0) return alert("No interview to analyze!");

    setIsActive(false); // Stop timer
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/feedback", {
        resume_text: resume, // (Required by Pydantic model, though unused by grading prompt)
        job_description: jobDescription,
        candidate_name: name,
        messages: messages,
      });

      setFeedback(response.data);
    } catch (error) {
      console.error("Error getting feedback:", error);
      alert("Failed to generate feedback.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 flex flex-col">
      {/* Header */}
      <div className="w-full border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            AI Interview Coach
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Practice technical interviews with AI-powered feedback
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-10">
        {!isInterviewStarted ? (
        <SetupScreen
          name={name}
          setName={setName}
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
          resume={resume}
          setResume={setResume}
          duration={duration}
          setDuration={setDuration}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          startInterview={startInterview}
          handleFileChange={handleFileChange}
          loading={loading}
        />
      ) : feedback ? (
        <FeedbackDisplay
          feedback={feedback}
          onStartNew={() => {
            setFeedback(null);
            setMessages([]);
            setIsInterviewStarted(false);
          }}
        />
      ) : (
        <ActiveInterview
          messages={messages}
          loading={loading}
          isRecording={isRecording}
          isAudioPlaying={isAudioPlaying}
          currentInput={currentInput}
          setCurrentInput={setCurrentInput}
          toggleRecording={toggleRecording}
          cancelAudio={cancelAudio}
          sendMessage={sendMessage}
          timeLeft={timeLeft}
          formatTime={formatTime}
          endInterview={endInterview}
        />
      )}
      </div>
    </main>
  );
}