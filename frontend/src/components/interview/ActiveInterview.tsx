"use client";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ActiveInterviewProps {
  messages: Message[];
  loading: boolean;
  isRecording: boolean;
  isAudioPlaying: boolean;
  currentInput: string;
  setCurrentInput: (input: string) => void;
  toggleRecording: () => void;
  cancelAudio: () => void;
  sendMessage: (text: string) => void;
  timeLeft: number;
  formatTime: (seconds: number) => string;
  endInterview: () => void;
}

export default function ActiveInterview({
  messages,
  loading,
  isRecording,
  isAudioPlaying,
  currentInput,
  setCurrentInput,
  toggleRecording,
  cancelAudio,
  sendMessage,
  timeLeft,
  formatTime,
  endInterview,
}: ActiveInterviewProps) {
  return (
    <div className="w-full max-w-4xl h-[calc(100dvh-200px)] min-h-[500px] bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden">
      {/* Header with Timer */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-gradient-to-r from-slate-900 to-slate-800 px-4 sm:px-6 py-4 border-b border-slate-700">
        <div>
          <h2 className="font-bold text-lg sm:text-xl text-white">Interview in Progress</h2>
          <p className="text-sm text-slate-300 mt-0.5">
            Time Remaining:{" "}
            <span
              className={`font-mono font-bold ${
                timeLeft < 60 ? "text-red-400 animate-pulse" : "text-emerald-400"
              }`}
            >
              {formatTime(timeLeft)}
            </span>
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm("Are you sure you want to end the interview early?")) {
              endInterview();
            }
          }}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all shadow-lg hover:shadow-red-500/50 font-semibold text-sm whitespace-nowrap transform hover:scale-105"
        >
          End Interview
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 bg-gradient-to-b from-slate-50 to-white">
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ 
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1]
              }}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-3 rounded-2xl max-w-[85%] sm:max-w-[75%] shadow-sm ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
                    : "bg-white text-slate-800 border border-slate-200"
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white text-slate-600 px-4 py-3 rounded-2xl border border-slate-200 flex items-center space-x-2">
              <div className="flex space-x-1">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                  className="w-2 h-2 bg-slate-400 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  className="w-2 h-2 bg-slate-400 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  className="w-2 h-2 bg-slate-400 rounded-full"
                />
              </div>
              <span className="text-sm italic">AI is thinking...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Controls */}
      <div className="border-t border-slate-200 bg-white px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Interrupt Button - Only shows when AI is speaking */}
          <AnimatePresence>
            {isAudioPlaying && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -20 }}
                transition={{ duration: 0.2 }}
                onClick={cancelAudio}
                className="px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/30 animate-pulse text-sm sm:text-base"
              >
                ⏸️ Interrupt
              </motion.button>
            )}
          </AnimatePresence>

          {/* Toggle Recording Button */}
          <motion.button
            onClick={toggleRecording}
            disabled={loading}
            whileTap={{ scale: 0.95 }}
            className={`
              flex items-center justify-center gap-2 px-6 py-4 sm:py-3 rounded-xl font-semibold 
              transition-all disabled:opacity-50 disabled:cursor-not-allowed
              shadow-lg text-base sm:text-sm
              ${
                isRecording
                  ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-red-500/40 recording-glow"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-blue-500/30 hover:shadow-xl"
              }
            `}
          >
            <span className="text-xl">🎤</span>
            <span>{isRecording ? "Listening..." : "Click to Speak"}</span>
          </motion.button>

          {/* Text Input */}
          <input
            type="text"
            className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-slate-900 placeholder:text-slate-400"
            placeholder="Or type your answer..."
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && currentInput.trim() && sendMessage(currentInput)}
          />
        </div>
      </div>
    </div>
  );
}
