"use client";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Home } from "lucide-react";

interface Feedback {
  rating: number;
  feedback: string;
  improvements: string[];
}

interface ReportCardProps {
  feedback: Feedback;
  onRestart: () => void;
}

export default function ReportCard({ feedback, onRestart }: ReportCardProps) {
  // Determine score color: Red (<5), Yellow (5-7), Green (8+)
  const getScoreColor = (rating: number) => {
    if (rating >= 8) return "text-green-500";
    if (rating >= 5) return "text-yellow-500";
    return "text-red-500";
  };

  const getCircleStroke = (rating: number) => {
    if (rating >= 8) return "stroke-green-500";
    if (rating >= 5) return "stroke-yellow-500";
    return "stroke-red-500";
  };

  // Calculate circular progress (270° arc = 75% of circle)
  const circumference = 2 * Math.PI * 85;
  const progressOffset = circumference - (feedback.rating / 10) * circumference * 0.75;

  // Parse feedback to separate strengths and improvements
  const parseStrengths = () => {
    const lines = feedback.feedback.split('\n').filter(line => line.trim());
    return lines.filter(line => 
      line.toLowerCase().includes('good') || 
      line.toLowerCase().includes('well') || 
      line.toLowerCase().includes('strong') ||
      line.toLowerCase().includes('excellent')
    );
  };

  const strengths = parseStrengths();

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 sm:px-12 py-8 border-b border-slate-200 flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center">
              Performance Report
            </h1>
            <p className="text-slate-600 text-center mt-2">
              Interview Analysis & Recommendations
            </p>
          </div>
          <button
            onClick={() => {
              // Ensure any processes are cleaned up before restarting
              onRestart();
            }}
            className="ml-4 text-slate-600 hover:text-slate-900 transition-colors p-2"
            title="Back to Home"
          >
            <Home className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-12 space-y-10">
          {/* Score Section */}
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100, damping: 15 }}
              className="relative w-48 h-48 sm:w-56 sm:h-56"
            >
              {/* Background Circle */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="85"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="12"
                  className="opacity-30"
                />
                {/* Progress Circle */}
                <motion.circle
                  cx="50%"
                  cy="50%"
                  r="85"
                  fill="none"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: progressOffset }}
                  transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
                  className={getCircleStroke(feedback.rating)}
                />
              </svg>
              {/* Score Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, type: "spring", stiffness: 150 }}
                  className={`text-7xl font-bold ${getScoreColor(feedback.rating)}`}
                >
                  {feedback.rating}
                </motion.span>
                <span className="text-2xl text-slate-400 font-medium">/10</span>
              </div>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-slate-600 text-center mt-6 text-lg"
            >
              {feedback.rating >= 8 && "Outstanding Performance"}
              {feedback.rating >= 5 && feedback.rating < 8 && "Good Performance"}
              {feedback.rating < 5 && "Needs Improvement"}
            </motion.p>
          </div>

          {/* Summary Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Summary</h2>
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                {feedback.feedback}
              </p>
            </div>
          </motion.div>

          {/* Strengths Section (if any found) */}
          {strengths.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Strengths</h2>
              <div className="space-y-3">
                {strengths.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="flex items-start gap-3 bg-white border border-slate-200 rounded-lg p-4 hover:border-green-300 hover:shadow-sm transition-all"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-slate-600 leading-relaxed flex-1">{item}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Improvements Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Areas for Growth</h2>
            <div className="space-y-3">
              {feedback.improvements.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  className="flex items-start gap-3 bg-white border border-slate-200 rounded-lg p-4 hover:border-amber-300 hover:shadow-sm transition-all"
                >
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-600 leading-relaxed flex-1">{item}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="pt-4"
          >
            <button
              onClick={onRestart}
              className="w-full px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-all"
            >
              Start New Interview
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
