"use client";
import { useState } from "react";
import axios from "axios";

interface Message {
  role: "user" | "assistant";
  content: string;
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

  const startInterview = async () => {
    if (!resume || !jobDescription) return alert("Please fill in both fields");
    setIsInterviewStarted(true);
    
    // Trigger the first message from the AI
    // We send an empty user message to "poke" the AI to start
    await sendMessage("Hello, I am ready for the interview.", true);
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
      });

      const botReply = response.data.response;
      setMessages([...newHistory, { role: "assistant", content: botReply }]);
    } catch (error) {
      console.error("Error talking to AI:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-10 bg-gray-50 text-gray-800">
      <h1 className="text-3xl font-bold mb-8">AI Interviewer (Milestone 1)</h1>

      {!isInterviewStarted ? (
        // --- SETUP SCREEN ---
        <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label className="block font-semibold mb-2">Paste Job Description</label>
            <textarea
              className="w-full p-3 border rounded h-32 text-sm"
              placeholder="Paste JD here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label className="block font-semibold mb-2">Paste Your Resume</label>
            <textarea
              className="w-full p-3 border rounded h-32 text-sm"
              placeholder="Paste Resume text here..."
              value={resume}
              onChange={(e) => setResume(e.target.value)}
            />
          </div>
          <button
            onClick={startInterview}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
          >
            Start Interview
          </button>
        </div>
      ) : (
        // --- CHAT SCREEN ---
        <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-md flex flex-col h-[600px]">
          <div className="flex-1 overflow-y-auto mb-4 border-b p-2 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg max-w-[80%] ${
                  msg.role === "user"
                    ? "bg-blue-100 ml-auto text-right"
                    : "bg-gray-100 mr-auto"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
              </div>
            ))}
            {loading && <div className="text-gray-400 text-sm italic">AI is thinking...</div>}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 border p-3 rounded-lg"
              placeholder="Type your answer..."
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(currentInput)}
            />
            <button
              onClick={() => sendMessage(currentInput)}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold"
              disabled={loading}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </main>
  );
}