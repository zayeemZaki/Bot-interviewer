"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, X, PhoneMissed, Clock, Home } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogOverlay,
} from "@/components/ui/alert-dialog";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface InterviewSessionProps {
  messages: Message[];
  isRecording: boolean;
  isAudioPlaying: boolean;
  timeLeft: number;
  currentInput: string;
  setCurrentInput: (input: string) => void;
  onSendMessage: (text: string) => void;
  onToggleRecording: () => void;
  onInterrupt: () => void;
  onEndInterview: () => void;
  onExit: () => void;
  loading?: boolean;
  formatTime: (seconds: number) => string;
}

export default function InterviewSession({
  messages,
  isRecording,
  isAudioPlaying,
  timeLeft,
  currentInput,
  setCurrentInput,
  onSendMessage,
  onToggleRecording,
  onInterrupt,
  onEndInterview,
  loading = false,
  formatTime,
}: InterviewSessionProps) {
  return (
    <div className="relative w-full h-[100dvh] bg-slate-50 flex flex-col overflow-hidden">
      {/* Minimalist Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white border-b border-slate-200">
        {/* Left: Home + Timer */}
        <div className="flex items-center gap-3">
          {/* Timer */}
          <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <span
            className={`text-sm font-mono font-semibold ${
              timeLeft < 60 ? "text-red-500" : "text-slate-700"
            }`}
          >
            {formatTime(timeLeft)}
          </span>
          </div>
        </div>
        {/* End Call Button with AlertDialog */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <PhoneMissed className="w-4 h-4" />
              <span className="hidden sm:inline">End Interview</span>
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Finish Interview?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you ready to submit your session and receive feedback?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onEndInterview}>Finish</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
          <AlertDialogOverlay className="backdrop-blur-sm" />
        </AlertDialog>
      </div>

      {/* Messages Area - Clean, spacious (scrollable) */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ 
                duration: 0.2,
                ease: "easeOut"
              }}
              className={`flex flex-col ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              {/* Bubble */}
              <div
                className={`px-4 py-3 max-w-[85%] sm:max-w-[70%] ${
                  msg.role === "user"
                    ? "bg-slate-800 text-white rounded-2xl rounded-tr-sm"
                    : "bg-slate-100 text-slate-800 rounded-2xl rounded-tl-sm"
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
              
              {/* Timestamp/Label */}
              <span className="text-xs text-slate-400 mt-1 px-1">
                {msg.role === "user" ? "You" : "AI Interviewer"}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Loading Indicator */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start"
          >
            <div className="bg-slate-100 text-slate-600 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
              <div className="flex gap-1">
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                  className="w-2 h-2 bg-slate-400 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                  className="w-2 h-2 bg-slate-400 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                  className="w-2 h-2 bg-slate-400 rounded-full"
                />
              </div>
              <span className="text-sm">Thinking...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Text Input Bar - Above controls */}
      <div className="px-4 sm:px-8 pb-2">
        <input
          type="text"
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          placeholder="Or type your answer..."
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && currentInput.trim() && onSendMessage(currentInput)}
          disabled={isRecording || isAudioPlaying}
        />
      </div>

      {/* Floating Control Bar - Zoom-like (outside scroll) */}
      <div className="flex items-center justify-center gap-4 px-4 py-6">
        {/* Interrupt Button - Only when AI is speaking */}
        <AnimatePresence>
          {isAudioPlaying && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onInterrupt}
              className="flex items-center justify-center h-14 w-14 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
              title="Stop AI"
            >
              <X className="w-6 h-6" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Mic Button - Circular, Zoom-style */}
        <motion.button
          onClick={onToggleRecording}
          disabled={loading || isAudioPlaying}
          whileTap={{ scale: 0.95 }}
          className={`
            relative flex items-center justify-center h-14 w-14 rounded-full
            transition-all disabled:opacity-50 disabled:cursor-not-allowed
            ${
              isRecording
                ? "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/50"
                : "bg-slate-800 hover:bg-slate-900 text-white shadow-lg"
            }
          `}
          title={isRecording ? "Stop Recording" : "Start Recording"}
        >
          {/* Pulsing Ring when Recording */}
          {isRecording && (
            <motion.span
              className="absolute inset-0 rounded-full border-4 border-red-400"
              animate={{
                scale: [1, 1.4],
                opacity: [0.8, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          )}
          
          {isRecording ? (
            <MicOff className="w-6 h-6 relative z-10" />
          ) : (
            <Mic className="w-6 h-6 relative z-10" />
          )}
        </motion.button>
      </div>
    </div>
  );
}
