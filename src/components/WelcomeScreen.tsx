import React from 'react';
import { AcademicSubject, StudentLevel, LearningMode } from '../types';
import { PRESET_DOUBTS } from '../data';
import { BookOpen, Sparkles, Image, BrainCircuit, Landmark, Flame, GraduationCap } from 'lucide-react';

interface WelcomeScreenProps {
  onSelectPreset: (question: string, subject: AcademicSubject) => void;
  currentLevel: StudentLevel;
  setLevel: (level: StudentLevel) => void;
  currentSubject: AcademicSubject;
  setSubject: (subject: AcademicSubject) => void;
  setMode: (mode: LearningMode) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onSelectPreset,
  currentLevel,
  setLevel,
  currentSubject,
  setSubject,
  setMode,
}) => {
  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-10 animate-fadeIn">
      {/* Hero Welcome Unit */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-700 shadow-sm animate-bounce">
          <GraduationCap className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight leading-none">
            Meet <span className="bg-gradient-to-r from-indigo-600 to-violet-700 bg-clip-text text-transparent">StudyMate AI</span>
          </h2>
          <p className="text-sm md:text-base text-slate-500 font-medium">
            Your expert educational tutor designed to help you truly master academic concepts, solve numerical homework problems, and clear doubts step-by-step.
          </p>
        </div>
      </div>

      {/* Feature Guide Bento Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 bg-white border border-slate-100/80 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] space-y-3 hover:-translate-y-1 transition-all duration-300">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm md:text-base leading-none">Explain Before Solving</h3>
          <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
            I don't just give answers! I describe the underlying academic theories and background concepts first to boost your deep understanding.
          </p>
        </div>

        <div className="p-5 bg-white border border-slate-100/80 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] space-y-3 hover:-translate-y-1 transition-all duration-300">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold">
            <Image className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm md:text-base leading-none">Solve Image Doubts</h3>
          <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
            Snap, upload, or drag-and-drop a photo of your textbook question, homework sheet, or geometry graph, and I will extract and explain it step-by-step.
          </p>
        </div>

        <div className="p-5 bg-white border border-slate-100/80 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] space-y-3 hover:-translate-y-1 transition-all duration-300">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm md:text-base leading-none">Personalized Adaptation</h3>
          <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
            Choose your learning level—Primary School, High School, or College. I'll automatically adjust my complexity, formulas, and analogies to fit you.
          </p>
        </div>
      </div>

      {/* Level Quick Selection Panel */}
      <div className="p-6 bg-slate-50/50 border border-slate-150 rounded-2xl space-y-4">
        <div className="space-y-1 text-center md:text-left">
          <h4 className="font-bold text-slate-800 text-sm md:text-base">First step: Adjust your current school level</h4>
          <p className="text-xs text-slate-500">I will calibrate all my lessons, vocabulary, logic, and practice questions to this level.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(['Primary School', 'High School', 'College'] as StudentLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => setLevel(level)}
              className={`p-4 rounded-xl border text-center transition-all ${
                currentLevel === level
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border-indigo-600 shadow-md shadow-indigo-100 scale-[1.02] font-bold'
                  : 'bg-white text-slate-700 border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 font-medium'
              }`}
            >
              <span className="block text-sm leading-none">{level}</span>
              <span className={`block text-[10px] mt-1 ${currentLevel === level ? 'text-indigo-200' : 'text-slate-400'}`}>
                {level === 'Primary School' && 'Simple language & visual analogies'}
                {level === 'High School' && 'Detailed concepts & formula application'}
                {level === 'College' && 'Advanced technical & math rigor'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Clickable Preset Doubts Matrix */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Landmark className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-800 text-base md:text-lg">Or select a standard preset doubt to begin:</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRESET_DOUBTS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                setSubject(preset.subject);
                // For kinetic energy or math, default solver, for English/photosynthesis, let's keep preset subject
                onSelectPreset(preset.question, preset.subject);
              }}
              className="p-4 bg-white border border-slate-150 rounded-xl hover:border-indigo-300 hover:shadow-md active:scale-98 transition-all text-left flex gap-3 group relative cursor-pointer"
            >
              <div className="text-2xl pt-1 flex-shrink-0 group-hover:scale-110 transition-transform">{preset.emoji}</div>
              <div className="space-y-1">
                <span className="inline-block text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                  {preset.subject}
                </span>
                <h4 className="font-bold text-slate-800 text-xs md:text-sm tracking-tight group-hover:text-indigo-600 transition-colors leading-snug">
                  {preset.title}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {preset.question}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
