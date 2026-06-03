import React, { useState } from 'react';
import { StudentLevel, AcademicSubject, LearningMode, UserAccount } from '../types';
import { GraduationCap, Sparkles, BookOpen, Menu, LogOut, ChevronDown } from 'lucide-react';

interface HeaderProps {
  currentLevel: StudentLevel;
  onLevelChange: (level: StudentLevel) => void;
  currentSubject: AcademicSubject;
  onSubjectChange: (subject: AcademicSubject) => void;
  currentMode: LearningMode;
  onModeChange: (mode: LearningMode) => void;
  isOnline: boolean;
  onResetChat?: () => void;
  onMenuToggle?: () => void;
  currentUser: UserAccount | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLevel,
  onLevelChange,
  currentSubject,
  onSubjectChange,
  currentMode,
  onModeChange,
  isOnline,
  onResetChat,
  onMenuToggle,
  currentUser,
  onLogout,
}) => {
  const levels: StudentLevel[] = ['Primary School', 'High School', 'College'];
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Get initials or fallback
  const getInitials = () => {
    if (!currentUser) return 'GS';
    return currentUser.name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-3 md:px-8 flex items-center justify-between shadow-xs sticky top-0 z-30 w-full font-sans">
      <div className="flex items-center gap-2 md:gap-5">
        {/* Toggle menu for mobile/tablet */}
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="flex lg:hidden items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-indigo-50 border border-slate-200/60 text-slate-600 hover:text-indigo-600 transition-colors shadow-xs cursor-pointer active:scale-95"
            title="Open subjects sidebar"
            id="mobile-hamburger-button"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Brand logo for desktop header when sidebar is on the left */}
        <div className="hidden max-lg:flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <GraduationCap className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* Dynamic header options */}
        <div className="flex items-center gap-1.5 md:gap-4 text-xs md:text-sm">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] md:text-xs hidden sm:inline">Subject:</span>
          <div className="bg-indigo-50 text-indigo-700 px-2 py-0.5 md:px-4 md:py-1.5 rounded-full text-[11px] md:text-sm font-bold border border-indigo-100/80 max-w-[80px] xs:max-w-none truncate">
            {currentSubject}
          </div>
          <div className="h-4 w-[1px] bg-slate-200"></div>
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] md:text-xs hidden sm:inline">Level:</span>
          <select
            value={currentLevel}
            onChange={(e) => onLevelChange(e.target.value as StudentLevel)}
            className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer text-[11px] md:text-sm pr-1"
            id="student-school-level-select"
          >
            {levels.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Mode Switcher capsule */}
        <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs">
          <button
            onClick={() => onModeChange('doubt-solver')}
            className={`flex items-center gap-1 px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              currentMode === 'doubt-solver'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/50'
            }`}
            id="mode-doubt-solver-btn"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Doubt Solver</span>
          </button>
          <button
            onClick={() => onModeChange('concept-teacher')}
            className={`flex items-center gap-1 px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              currentMode === 'concept-teacher'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/50'
            }`}
            id="mode-concept-teacher-btn"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Teach Concept</span>
          </button>
        </div>

        {onResetChat && (
          <button
            onClick={onResetChat}
            className="text-xs text-rose-600 font-bold hover:bg-rose-50 border border-rose-100 px-2 rounded-lg py-1 transition-all cursor-pointer active:scale-95"
            title="Clear Thread"
            id="header-clear-chat-btn"
          >
            Clear
          </button>
        )}

        <div className="h-5 w-[1px] bg-slate-200 hidden md:block"></div>

        {/* Dynamic Logged-in User Profile Dropdown Widget */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 md:gap-3 text-left hover:bg-slate-50 p-1.5 rounded-xl transition-all cursor-pointer"
            id="user-profile-header-button"
          >
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-slate-800 leading-none truncate max-w-[120px]">
                {currentUser ? currentUser.name : 'Guest Student'}
              </p>
              <p className="text-[10px] text-green-500 font-bold flex items-center justify-end gap-1 mt-1 leading-none uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                {currentUser ? 'Student' : 'Guest'}
              </p>
            </div>
            
            <div className="w-10 h-10 rounded-full bg-indigo-50 border-2 border-indigo-200 shadow-xs flex items-center justify-center font-bold text-base text-indigo-700 relative">
              {currentUser ? currentUser.avatar : '🧑‍🎓'}
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {/* User Option Dropdown Overlay */}
          {dropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setDropdownOpen(false)} 
              />
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-40 animate-fadeIn">
                <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Active Classroom</p>
                  <p className="text-sm font-bold text-slate-800 mt-1 truncate">
                    {currentUser ? currentUser.name : 'Guest Student'}
                  </p>
                  <p className="text-xs text-indigo-700 mt-0.5 truncate font-semibold">
                    {currentUser ? currentUser.email : 'Unsaved Guest Mode'}
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onLogout();
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-rose-50 text-rose-600 hover:text-rose-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer mt-1"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  Sign Out Workspace
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
