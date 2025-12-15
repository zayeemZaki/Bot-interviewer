import { ChangeEvent } from "react";
import { FileText, Briefcase, Play, Clock, Target, User } from "lucide-react";

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
  duration,
  setDuration,
  difficulty,
  setDifficulty,
  startInterview,
  handleFileChange,
  loading,
}: SetupScreenProps) {
  return (
    <div className="w-full max-w-3xl bg-white rounded-xl shadow-sm border border-slate-200">
      {/* Header */}
      <div className="border-b border-slate-200 px-6 sm:px-8 py-6">
        <h2 className="text-2xl font-semibold text-slate-900">Configure interview preferences</h2>
      </div>

      {/* Form Content */}
      <div className="p-6 sm:p-8 space-y-8">
        {/* Name Input */}
        <div className="space-y-2">
          <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-slate-900">
            <User className="w-4 h-4 text-slate-500" />
            Your Name
          </label>
          <input
            id="name"
            type="text"
            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
            placeholder="e.g. John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Job Description */}
        <div className="space-y-2">
          <label htmlFor="job-description" className="flex items-center gap-2 text-sm font-medium text-slate-900">
            <Briefcase className="w-4 h-4 text-slate-500" />
            Job Description
          </label>
          <textarea
            id="job-description"
            className="flex min-h-[120px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all"
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>

        {/* Resume Upload */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-900">
            <FileText className="w-4 h-4 text-slate-500" />
            Resume
          </label>
          
          {/* File Upload */}
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-md cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
                <FileText className="w-8 h-8 mb-2 text-slate-400" />
                <p className="mb-1 text-sm text-slate-600">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-slate-500">PDF files only</p>
              </div>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Duration and Difficulty Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Duration */}
          <div className="space-y-2">
            <label htmlFor="duration" className="flex items-center gap-2 text-sm font-medium text-slate-900">
              <Clock className="w-4 h-4 text-slate-500" />
              Duration
            </label>
            <select
              id="duration"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer transition-all"
            >
              <option value={5}>5 Minutes</option>
              <option value={15}>15 Minutes</option>
              <option value={30}>30 Minutes</option>
              <option value={45}>45 Minutes</option>
            </select>
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <label htmlFor="difficulty" className="flex items-center gap-2 text-sm font-medium text-slate-900">
              <Target className="w-4 h-4 text-slate-500" />
              Difficulty
            </label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer transition-all"
            >
              <option value="easy">Beginner Mode</option>
              <option value="medium">Pro Mode</option>
              <option value="hard">Roast Mode</option>
            </select>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={startInterview}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-slate-900 text-white hover:bg-slate-800 h-11 px-8 w-full"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Setting up...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Start Interview
            </>
          )}
        </button>
      </div>
    </div>
  );
}
