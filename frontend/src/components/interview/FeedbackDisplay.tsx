"use client";
import { motion } from "framer-motion";

interface Feedback {
  rating: number;
  feedback: string;
  improvements: string[];
}

interface FeedbackDisplayProps {
  feedback: Feedback;
  onStartNew: () => void;
}

export default function FeedbackDisplay({ feedback, onStartNew }: FeedbackDisplayProps) {
  // Determine color scheme based on rating
  const getScoreColor = (rating: number) => {
    if (rating >= 8) return "from-emerald-600 to-emerald-700";
    if (rating >= 6) return "from-blue-600 to-blue-700";
    if (rating >= 4) return "from-amber-600 to-amber-700";
    return "from-red-600 to-red-700";
  };

  const getScoreTextColor = (rating: number) => {
    if (rating >= 8) return "text-emerald-600";
    if (rating >= 6) return "text-blue-600";
    if (rating >= 4) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBorderColor = (rating: number) => {
    if (rating >= 8) return "border-emerald-600";
    if (rating >= 6) return "border-blue-600";
    if (rating >= 4) return "border-amber-600";
    return "border-red-600";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 sm:px-8 py-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center">Interview Report</h2>
        <p className="text-slate-300 text-sm text-center mt-1">Your performance analysis</p>
      </div>

      {/* Content */}
      <div className="p-6 sm:p-8">
        {/* Score Circle */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex justify-center mb-8"
        >
          <div className={`relative w-36 h-36 sm:w-40 sm:h-40 rounded-full border-8 ${getScoreBorderColor(feedback.rating)} flex items-center justify-center bg-white shadow-lg`}>
            <div className="text-center">
              <span className={`text-5xl sm:text-6xl font-bold ${getScoreTextColor(feedback.rating)}`}>
                {feedback.rating}
              </span>
              <span className="text-2xl text-slate-400">/10</span>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="font-bold text-lg text-slate-900 mb-3 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Summary
            </h3>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5">
              <p className="text-slate-700 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                {feedback.feedback}
              </p>
            </div>
          </motion.div>

          {/* Improvements */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="font-bold text-lg text-slate-900 mb-3 flex items-center gap-2">
              <span className="text-2xl">💡</span>
              Areas for Improvement
            </h3>
            <div className="space-y-3">
              {feedback.improvements.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold">
                      {i + 1}
                    </span>
                    <p className="text-slate-700 text-sm sm:text-base leading-relaxed flex-1">
                      {item}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Action Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStartNew}
            className={`w-full bg-gradient-to-r ${getScoreColor(feedback.rating)} text-white py-4 rounded-xl font-bold text-base hover:shadow-xl transition-all transform hover:-translate-y-0.5 shadow-lg`}
          >
            Start New Interview
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
