import React, { useState } from 'react';
import { AcademicSubject, StudySession, UserAccount } from '../types';
import { BookOpen, X, Trash2, History, Layers, Download, LogOut } from 'lucide-react';

interface SidebarProps {
  currentSubject: AcademicSubject;
  onSubjectChange: (subject: AcademicSubject) => void;
  onResetChat: () => void;
  messageCount: number;
  isOpen?: boolean;
  onClose?: () => void;
  
  // Study history props
  sessions: StudySession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;

  // PWA props
  showInstallBtn?: boolean;
  onInstallPWA?: () => void;

  // Profile fields for responsive/mobile displays
  currentUser?: UserAccount | null;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSubject,
  onSubjectChange,
  onResetChat,
  messageCount,
  isOpen = false,
  onClose,
  sessions = [],
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  showInstallBtn = false,
  onInstallPWA,
  currentUser,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'subjects' | 'history'>('subjects');

  const subjectsWithEmoji: { name: AcademicSubject; emoji: string }[] = [
    { name: 'Mathematics', emoji: '📐' },
    { name: 'Physics', emoji: '⚡' },
    { name: 'Chemistry', emoji: '🧪' },
    { name: 'Biology', emoji: '🧬' },
    { name: 'Computer Science', emoji: '💻' },
    { name: 'English', emoji: '📝' },
    { name: 'General Knowledge', emoji: '🌍' },
  ];

  // Calculate dynamic daily progress
  // Every bot response adds 20%. Starts at 20% for first load.
  const progressPercent = Math.min(20 + messageCount * 20, 100);

  const handleSubjectSelect = (sub: AcademicSubject) => {
    onSubjectChange(sub);
    setActiveTab('subjects');
    if (onClose) onClose();
  };

  const handleNewSession = () => {
    onResetChat();
    if (onClose) onClose();
  };


  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
          id="mobile-sidebar-backdrop"
        />
      )}

      {/* Sidebar navigation column */}
      <aside
        id="sidebar-container"
        className={`bg-indigo-700 flex flex-col p-6 text-white h-screen shrink-0 select-none transition-transform duration-300 ease-in-out z-50
          ${isOpen
            ? 'fixed inset-y-0 left-0 w-72 shadow-2xl translate-x-0 flex'
            : 'fixed inset-y-0 left-0 w-72 -translate-x-full lg:translate-x-0 lg:static lg:w-64 lg:flex hidden'
          }
        `}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl shadow-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-white font-black text-lg tracking-tight uppercase">StudyMate AI</h1>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-white/10 rounded-xl text-white transition-colors cursor-pointer"
              title="Close menu"
              id="close-sidebar-button"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* New Study Session Button */}
        <button
          onClick={handleNewSession}
          className="w-full py-3 bg-indigo-455-button bg-indigo-400/30 hover:bg-indigo-400/40 text-white rounded-2xl font-bold flex items-center justify-center gap-2 border-2 border-indigo-300/20 transition-all mb-6 shadow-xs cursor-pointer"
          id="new-session-sidebar-button"
        >
          <span className="text-lg leading-none">+</span> New Study Session
        </button>

        {/* Dual Tab Control Grid */}
        <div className="flex bg-indigo-800/40 p-1 rounded-xl gap-1 mb-6 shrink-0">
          <button
            onClick={() => setActiveTab('subjects')}
            className={`flex-1 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-all outline-none cursor-pointer ${
              activeTab === 'subjects' ? 'bg-indigo-600 text-white shadow-xs' : 'text-indigo-200 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Subjects
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-all outline-none relative cursor-pointer ${
              activeTab === 'history' ? 'bg-indigo-600 text-white shadow-xs' : 'text-indigo-200 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            History
            {sessions.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-400 text-indigo-900 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {sessions.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Context Content Container */}
        <nav className="flex-1 flex flex-col min-h-0 overflow-y-auto pr-1">
          {activeTab === 'subjects' ? (
            <div className="space-y-4">
              <p className="text-indigo-200 text-xs font-black uppercase tracking-widest pl-1">Active Subjects</p>
              <div className="space-y-1">
                {subjectsWithEmoji.map((item) => {
                  const isActive = currentSubject === item.name;
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleSubjectSelect(item.name)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left font-sans cursor-pointer ${
                        isActive
                          ? 'text-white bg-indigo-600 border border-indigo-500 shadow-xs'
                          : 'text-indigo-100 hover:bg-indigo-600/45'
                      }`}
                      id={`subject-btn-${item.name.replace(/\s+/g, '-').toLowerCase()}`}
                    >
                      <span className="text-base leading-none">{item.emoji}</span>
                      <span className="font-semibold text-sm">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4 flex flex-col h-full min-h-0">
              <p className="text-indigo-200 text-xs font-black uppercase tracking-widest pl-1">Study Logs</p>
              {sessions.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-indigo-200/60 my-auto">
                  <History className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-xs font-bold">No saved study logs</p>
                  <p className="text-[10px] mt-1 leading-relaxed opacity-80">Start a lesson with StudyMate to save automatic snapshots!</p>
                </div>
              ) : (
                <div className="space-y-2 flex-1 overflow-y-auto max-h-[420px] pr-0.5">
                  {sessions.slice().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((session) => {
                    const isActive = activeSessionId === session.id;
                    const subjectEmoji = subjectsWithEmoji.find(s => s.name === session.subject)?.emoji || '📚';
                    return (
                      <div
                        key={session.id}
                        className={`group w-full flex items-center justify-between gap-2 p-3 rounded-xl transition-all text-left font-sans border text-xs cursor-pointer ${
                          isActive
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-xs'
                            : 'bg-indigo-800/30 border-transparent text-indigo-100 hover:bg-indigo-800/50'
                        }`}
                        onClick={() => {
                          onSelectSession(session.id);
                          if (onClose) onClose();
                        }}
                      >
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <span className="text-sm mt-0.5" role="img" aria-label="subject">
                            {subjectEmoji}
                          </span>
                          <div className="min-w-0">
                            <p className="font-bold truncate text-[12px] leading-tight text-white group-hover:text-amber-300 transition-colors">
                              {session.title}
                            </p>
                            <p className={`text-[9px] uppercase font-bold mt-0.5 tracking-wider ${isActive ? 'text-indigo-200' : 'text-indigo-300'}`}>
                              {session.subject} • {session.level}
                            </p>
                          </div>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession(session.id);
                          }}
                          className={`p-1 mt-0.5 rounded-lg shrink-0 transition-colors cursor-pointer ${
                            isActive
                              ? 'text-indigo-300 hover:text-white hover:bg-indigo-500'
                              : 'text-indigo-400 hover:text-red-400 hover:bg-indigo-900/30'
                          }`}
                          title="Delete study session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* PWA Install Promo */}
        {showInstallBtn && onInstallPWA && (
          <div className="mb-4 bg-indigo-800/60 border border-indigo-500/20 p-3.5 rounded-2xl shadow-md flex flex-col gap-2.5 animate-fadeIn shrink-0">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 bg-yellow-400 text-indigo-950 rounded-lg shrink-0 flex items-center justify-center animate-pulse">
                <Download className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase text-yellow-300 tracking-widest">Install StudyMate</p>
                <p className="text-[10px] text-indigo-200 mt-0.5 leading-relaxed">
                  Save StudyMate on your desktop or mobile home screen as a standalone classroom.
                </p>
              </div>
            </div>
            <button
              onClick={onInstallPWA}
              className="w-full py-2 bg-yellow-400 hover:bg-yellow-300 text-indigo-950 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer select-none text-center shadow-md active:scale-[0.98]"
            >
              Install App
            </button>
          </div>
        )}

        {/* User Account Info block for high visibility */}
        {currentUser && (
          <div className="mb-4 bg-indigo-800/40 border border-indigo-500/20 p-3 rounded-2xl flex items-center gap-3 shrink-0">
            <div className="w-8.5 h-8.5 rounded-full bg-white/10 flex items-center justify-center text-base select-none">
              {currentUser.avatar || '🧑‍🎓'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-black uppercase text-indigo-200 tracking-widest leading-none">My Snapshot Workspace</p>
              <p className="text-xs font-bold text-white truncate mt-1">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-indigo-300 truncate font-medium">
                {currentUser.email}
              </p>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 hover:bg-rose-600/30 text-indigo-200 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                title="Sign Out Workspace"
                id="sidebar-logout-btn"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Goal Widget */}
        <div className="mt-auto pt-6 border-t border-indigo-600/40">
          <div className="bg-indigo-800/50 p-4 rounded-2xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-indigo-200 text-xs font-bold font-sans">Daily Goal</span>
              <span className="text-white text-xs font-bold font-mono">{progressPercent}%</span>
            </div>
            <div className="w-full bg-indigo-900 rounded-full h-2">
              <div
                className="bg-yellow-400 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
