import { ChangeEvent } from "react";

interface SetupScreenProps {
  name: string;
  setName: (name: string) => void;
  jobDescription: string;
  setJobDescription: (jd: string) => void;
  resume: string;
  setResume: (resume: string) => void;
  duration: number;
  setDuration: (duration: number) => void;
  difficulty: string;
  setDifficulty: (difficulty: string) => void;
  startInterview: () => void;
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
}

export default function SetupScreen({
  name,
  setName,
  jobDescription,
  setJobDescription,
  resume,
  setResume,
  duration,
  setDuration,
  difficulty,
  setDifficulty,
  startInterview,
  handleFileChange,
  loading,
}: SetupScreenProps) {
  return (
    <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5">
        <h2 className="text-xl font-semibold text-white">Setup Your Interview</h2>
        <p className="text-slate-300 text-sm mt-1">Fill in your details to begin the practice session</p>
      </div>

      {/* Card Content */}
      <div className="p-6 space-y-5">
        {/* Name Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Your Name</label>
          <input
            type="text"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-slate-900 placeholder:text-slate-400"
            placeholder="e.g. Zayeem Zaki"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Job Description */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Job Description</label>
          <textarea
            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none bg-white text-slate-900 placeholder:text-slate-400 h-28"
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>

        {/* Resume Upload */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Resume</label>
          
          {/* File Input */}
          <div className="mb-3">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-600
                        file:mr-4 file:py-2.5 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-semibold
                        file:bg-slate-100 file:text-slate-700
                        hover:file:bg-slate-200
                        file:transition-colors file:cursor-pointer
                        cursor-pointer"
            />
          </div>

          {/* Text Area */}
          <label className="block text-xs font-medium text-slate-500 mb-2">
            Or paste/edit your resume text:
          </label>
          <textarea
            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none bg-white text-slate-900 placeholder:text-slate-400 h-28"
            placeholder="Resume text will appear here..."
            value={resume}
            onChange={(e) => setResume(e.target.value)}
          />
        </div>

        {/* Grid for Duration and Difficulty */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Duration */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-slate-900 cursor-pointer"
            >
              <option value={5}>5 Minutes</option>
              <option value={15}>15 Minutes</option>
              <option value={30}>30 Minutes</option>
              <option value={45}>45 Minutes</option>
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-slate-900 cursor-pointer"
            >
              <option value="easy">🌱 Easy</option>
              <option value="medium">⚡ Medium</option>
              <option value="hard">🔥 Hard</option>
            </select>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={startInterview}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-0.5"
        >
          {loading ? "Setting up..." : "Start Interview"}
        </button>
      </div>
    </div>
  );
}
