import React, { useState, useRef, useEffect } from 'react';
import { StudentLevel, AcademicSubject, LearningMode, ChatMessage, StudySession, UserAccount } from './types';
import { Header } from './components/Header';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ChatMessageBubble } from './components/ChatMessageBubble';
import { Sidebar } from './components/Sidebar';
import { AuthScreen } from './components/AuthScreen';
import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, Send, Loader2, Sparkles, X, GraduationCap, ArrowDown, HelpCircle, RotateCcw } from 'lucide-react';

export default function App() {
  // Auth states
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);

  // In-app custom confirmation modal state (eliminates window.confirm iframe restriction)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // App states
  const [level, setLevel] = useState<StudentLevel>('High School');
  const [subject, setSubject] = useState<AcademicSubject>('Mathematics');
  const [mode, setMode] = useState<LearningMode>('doubt-solver');
  const [inputText, setInputText] = useState('');
  const [imageAttachment, setImageAttachment] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Study session history states
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  
  // Loader and prompt feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhrase, setLoadingPhrase] = useState('Consulting lesson archives...');
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest doubt solution
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load saved current user on mount
  useEffect(() => {
    try {
      const activeUser = localStorage.getItem('studymate_current_user');
      if (activeUser) {
        setCurrentUser(JSON.parse(activeUser));
      }
    } catch (e) {
      console.error('Failed to load user info:', e);
    }
    setIsAuthLoaded(true);
  }, []);

  // Sync and filter study log sessions by currentUser
  useEffect(() => {
    if (!isAuthLoaded) return;
    try {
      const saved = localStorage.getItem('studymate_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const currentUserId = currentUser ? currentUser.id : 'guest';
          const filtered = parsed.filter((s) => s.userId === currentUserId);
          setSessions(filtered);
          
          if (filtered.length > 0) {
            // Restore latest active user session
            const sorted = [...filtered].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            const latest = sorted[0];
            setCurrentSessionId(latest.id);
            setChatHistory(latest.messages);
            setSubject(latest.subject);
            setLevel(latest.level);
            setMode(latest.mode);
          } else {
            // Clear chat so new user starts with clear slate
            setCurrentSessionId(null);
            setChatHistory([]);
          }
        } else {
          setSessions([]);
        }
      } else {
        setCurrentSessionId(null);
        setChatHistory([]);
        setSessions([]);
      }
    } catch (e) {
      console.error('Failed to parse logs:', e);
    }
  }, [currentUser, isAuthLoaded]);

  // Update study logs in localStorage asynchronously
  const saveSessionState = (
    sessionId: string,
    messages: ChatMessage[],
    activeSubject: AcademicSubject,
    activeLevel: StudentLevel,
    activeMode: LearningMode
  ) => {
    const currentUserId = currentUser ? currentUser.id : 'guest';
    
    // Read the absolute master list from localStorage
    let masterSessions: StudySession[] = [];
    try {
      const savedStr = localStorage.getItem('studymate_sessions');
      if (savedStr) {
        const parsed = JSON.parse(savedStr);
        if (Array.isArray(parsed)) {
          masterSessions = parsed;
        }
      }
    } catch {}

    const existingIdx = masterSessions.findIndex((s) => s.id === sessionId);
    let updatedMaster: StudySession[];

    if (existingIdx !== -1) {
      updatedMaster = masterSessions.map((s, idx) => {
        if (idx === existingIdx) {
          return {
            ...s,
            messages,
            subject: activeSubject,
            level: activeLevel,
            mode: activeMode,
            timestamp: new Date().toISOString(),
          };
        }
        return s;
      });
    } else {
      const firstUserMsg = messages.find((m) => m.role === 'user');
      const questionText = firstUserMsg ? firstUserMsg.content : '';
      const title = questionText
        ? (questionText.length > 25 ? questionText.substring(0, 25) + '...' : questionText)
        : `${activeSubject} Topic`;

      const newSession: StudySession = {
        id: sessionId,
        userId: currentUserId,
        title,
        subject: activeSubject,
        level: activeLevel,
        mode: activeMode,
        messages,
        timestamp: new Date().toISOString(),
      };
      updatedMaster = [newSession, ...masterSessions];
    }

    localStorage.setItem('studymate_sessions', JSON.stringify(updatedMaster));
    setSessions(updatedMaster.filter((s) => s.userId === currentUserId));
  };

  const handleSelectSession = (id: string) => {
    const selected = sessions.find((s) => s.id === id);
    if (selected) {
      setCurrentSessionId(id);
      setChatHistory(selected.messages);
      setSubject(selected.subject);
      setLevel(selected.level);
      setMode(selected.mode);
      setError(null);
    }
  };

  const handleDeleteSession = (id: string) => {
    let masterSessions: StudySession[] = [];
    try {
      const savedStr = localStorage.getItem('studymate_sessions');
      if (savedStr) {
        const parsed = JSON.parse(savedStr);
        if (Array.isArray(parsed)) {
          masterSessions = parsed;
        }
      }
    } catch {}

    const updatedMaster = masterSessions.filter((s) => s.id !== id);
    localStorage.setItem('studymate_sessions', JSON.stringify(updatedMaster));

    const currentUserId = currentUser ? currentUser.id : 'guest';
    setSessions(updatedMaster.filter((s) => s.userId === currentUserId));

    if (currentSessionId === id) {
      setCurrentSessionId(null);
      setChatHistory([]);
      setError(null);
    }
  };

  const handleNewSession = () => {
    if (chatHistory.length > 0) {
      setIsConfirmModalOpen(true);
    } else {
      executeNewSession();
    }
  };

  const executeNewSession = () => {
    setCurrentSessionId(null);
    setChatHistory([]);
    setImageAttachment(null);
    setError(null);
    setIsConfirmModalOpen(false);
  };

  const handleLoginSuccess = (user: UserAccount | null) => {
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('studymate_current_user', JSON.stringify(user));
    } else {
      setCurrentUser(null);
      localStorage.removeItem('studymate_current_user');
      setIsGuestMode(true);
    }
    setError(null);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('studymate_current_user');
    setIsGuestMode(false);
    setCurrentSessionId(null);
    setChatHistory([]);
    setError(null);
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isLoading]);

  // Rotate custom teaching phrases during loading for an engaging tutor experience
  useEffect(() => {
    if (!isLoading) return;

    const phrases = [
      `Formulating simplified analogies for ${level}...`,
      `Structuring numerical calculations...`,
      `Extracting conceptual pillars for ${subject}...`,
      'Reviewing related academic guidelines...',
      'Mapping out high-contrast bento solution cards...',
      'Verifying math logic and proofs...',
    ];

    let currentIdx = 0;
    const interval = setInterval(() => {
      currentIdx = (currentIdx + 1) % phrases.length;
      setLoadingPhrase(phrases[currentIdx]);
    }, 2800);

    return () => clearInterval(interval);
  }, [isLoading, level, subject]);

  // Client-side image converter (Base64)
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Only image files (PNG, JPG, WEBP, GIF) are supported for diagram extraction.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('The maximum permitted image attachment size is 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageAttachment(reader.result as string);
      setError(null);
    };
    reader.onerror = () => {
      setError('Failed to process. Please try uploading a different doubt screenshot.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processImageFile(e.target.files[0]);
    }
  };

  const removeImageAttachment = () => {
    setImageAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Automatically check the student's self practice work with AI tutor
  const handleCheckPracticeAnswer = (practiceAnswer: string) => {
    if (!practiceAnswer.trim()) return;
    handleSubmitDoubt(
      undefined,
      `I tried the self-practice question! Here is my answer/steps:
"${practiceAnswer}"

Could you please check my answer and let me know if is correct or point out any mistakes?`
    );
  };

  // Submit Doubt to server API
  const handleSubmitDoubt = async (e?: React.FormEvent, presetQuery?: string) => {
    if (e) e.preventDefault();
    
    const textQuery = presetQuery ? presetQuery : inputText.trim();

    if (!textQuery && !imageAttachment) {
      return; // Cannot send empty doubt
    }

    // Capture states at trigger time
    const activeQuery = textQuery;
    const activeImage = imageAttachment;
    const activeSubject = subject;
    const activeLevel = level;
    const activeMode = mode;

    // Determine the session ID for this interaction
    let targetSessionId = currentSessionId;
    if (!targetSessionId) {
      targetSessionId = `session-${Date.now()}`;
      setCurrentSessionId(targetSessionId);
    }

    // Build Student Message Object
    const studentMsg: ChatMessage = {
      id: `student-${Date.now()}`,
      role: 'user',
      content: activeQuery || 'Please solve this question inside the attached screenshot.',
      image: activeImage || undefined,
      subject: activeSubject,
      level: activeLevel,
      mode: activeMode,
      timestamp: new Date().toISOString(),
    };

    // Update screen
    const updatedHistoryWithStudent = [...chatHistory, studentMsg];
    setChatHistory(updatedHistoryWithStudent);
    saveSessionState(targetSessionId, updatedHistoryWithStudent, activeSubject, activeLevel, activeMode);

    setInputText('');
    setImageAttachment(null);
    setIsLoading(true);
    setError(null);
    setLoadingPhrase(`Calibrating ${activeSubject} lesson plans...`);

    try {
      // Map previous messages to light conversational history format for the AI context
      const historyPayload = chatHistory.slice(-6).map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        content: msg.content,
      }));

      const res = await fetch('/api/tutor/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: activeQuery,
          subject: activeSubject,
          level: activeLevel,
          mode: activeMode,
          image: activeImage,
          history: historyPayload,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Server error. Failed to connect with study modules.');
      }

      const tutorMsg: ChatMessage = {
        id: `tutor-${Date.now()}`,
        role: 'assistant',
        content: data.text,
        subject: activeSubject,
        level: activeLevel,
        mode: activeMode,
        timestamp: new Date().toISOString(),
      };

      const updatedHistoryWithTutor = [...updatedHistoryWithStudent, tutorMsg];
      setChatHistory(updatedHistoryWithTutor);
      saveSessionState(targetSessionId, updatedHistoryWithTutor, activeSubject, activeLevel, activeMode);
    } catch (err: any) {
      console.error('StudyMate Chat Error:', err);
      setError(err.message || 'Connecting to Gemini AI failed. Please verify your internet connection and verify that your GEMINI_API_KEY is configured in Settings > Secrets.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPresetDoubt = (question: string, presetSubject: AcademicSubject) => {
    setSubject(presetSubject);
    handleSubmitDoubt(undefined, question);
  };

  if (!isAuthLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 font-sans select-none">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
        <p className="text-xs font-mono tracking-wider text-slate-400">LOADING STUDYMATE WORKSPACE...</p>
      </div>
    );
  }

  if (!currentUser && !isGuestMode) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div 
      className={`h-screen w-screen bg-[#F8FAFC] font-sans flex overflow-hidden transition-all duration-300 ${
        isDragging ? 'bg-indigo-50/40 border-4 border-dashed border-indigo-300' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Sidebar navigation column */}
      <Sidebar
        currentSubject={subject}
        onSubjectChange={setSubject}
        onResetChat={handleNewSession}
        messageCount={chatHistory.filter(m => m.role === 'assistant').length}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
      />

      {/* Main Workspace container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 bg-[#F8FAFC]">
        {/* Dynamic Drag Overlay Alert */}
        {isDragging && (
          <div className="fixed inset-0 bg-indigo-600/10 backdrop-blur-xs z-50 flex flex-col items-center justify-center pointer-events-none animate-fadeIn">
            <div className="bg-white p-6 rounded-2xl border border-indigo-200 shadow-xl flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                <ImageIcon className="w-6 h-6 animate-pulse" />
              </div>
              <p className="font-bold text-slate-800 text-sm md:text-base">Drop anywhere to upload doubt attachment</p>
              <p className="text-xs text-slate-400">PDFs, JPEGs, and PNG diagrams are supported</p>
            </div>
          </div>
        )}

        {/* Classroom Setup Header */}
        <Header
          currentLevel={level}
          onLevelChange={setLevel}
          currentSubject={subject}
          onSubjectChange={setSubject}
          currentMode={mode}
          onModeChange={setMode}
          isOnline={true}
          onResetChat={chatHistory.length > 0 ? handleNewSession : undefined}
          onMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* Primary Study Area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#F8FAFC] min-h-0 relative">
          {chatHistory.length === 0 ? (
            /* Empty Chat Welcome Screen */
            <div className="flex-1 overflow-y-auto bg-transparent border-0 py-6">
              <WelcomeScreen
                onSelectPreset={handleSelectPresetDoubt}
                currentLevel={level}
                setLevel={setLevel}
                currentSubject={subject}
                setSubject={setSubject}
                setMode={setMode}
              />
            </div>
          ) : (
            /* Active Chat Thread Space */
            <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden min-h-0 m-4 md:m-6">
              {/* Subject Indicator Badge Row */}
              <div className="px-6 py-3 bg-slate-50/50 border-b border-slate-200/60 flex items-center justify-between text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <span>Classroom Channel:</span>
                  <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-indigo-100/40">
                    {subject}
                  </span>
                  <span>•</span>
                  <span className="text-slate-600 font-bold">{level}</span>
                </div>
                <button
                  onClick={handleNewSession}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 transition-all font-sans font-bold active:scale-95 text-slate-405"
                  title="Reset Workspace"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Session</span>
                </button>
              </div>

              {/* Scrollable Dialogue Bubble Canvas */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                <AnimatePresence>
                  {chatHistory.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                    >
                      <ChatMessageBubble message={message} onCheckAnswer={handleCheckPracticeAnswer} />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Advanced Loading Concept illustration placeholder */}
                {isLoading && (
                  <div className="flex gap-4 items-start py-4 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0 animate-spin">
                      <Loader2 className="w-5 h-5" />
                    </div>
                    <div className="space-y-2 max-w-[80%] flex-1">
                      <span className="text-xs text-indigo-600 font-mono font-bold tracking-wider animate-bounce flex items-center gap-1.5 leading-none">
                        <Sparkles className="w-3.5 h-3.5" /> StudyMate is crafting solution...
                      </span>
                      <div className="p-4 bg-slate-50 rounded-2xl rounded-tl-none border border-slate-100 text-sm text-slate-500 space-y-2 font-medium italic">
                        <p>{loadingPhrase}</p>
                        <div className="h-2 bg-indigo-100/60 rounded-full w-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full animate-[loading_1.5s_infinite]" style={{ width: '40%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Warning Block */}
                {error && (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-sm space-y-2 leading-relaxed animate-fadeIn">
                    <div className="flex items-center gap-2 font-bold text-rose-900">
                      <X className="w-5 h-5 text-rose-600" />
                      <span>Tutoring Channel Disruption</span>
                    </div>
                    <p>{error}</p>
                    <div className="pt-2">
                      <button
                        onClick={() => setError(null)}
                        className="text-xs font-bold bg-white text-rose-700 border border-rose-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-rose-50 transition-colors"
                      >
                        Dismiss Error
                      </button>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          {/* Input Control Board */}
          <footer className="p-4 md:p-6 bg-white border-t border-slate-200 mt-auto">
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Active Image Attachment Thumbnail Row */}
              {imageAttachment && (
                <div className="flex items-center gap-3 p-2 bg-indigo-50/50 border border-indigo-100/80 rounded-xl max-w-sm animate-fadeIn">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-indigo-200 bg-white">
                    <img src={imageAttachment} alt="Prompt doubt diagram" className="object-cover w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-indigo-900 leading-none truncate">doubt-screenshot.png</p>
                    <span className="text-[10px] text-indigo-400 font-mono font-medium">Ready to extract problem...</span>
                  </div>
                  <button
                    onClick={removeImageAttachment}
                    className="p-1.5 hover:bg-indigo-100 rounded-full text-indigo-600 transition-colors cursor-pointer"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Form Action Area */}
              <form onSubmit={(e) => handleSubmitDoubt(e)} className="flex items-center gap-2 md:gap-3">
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl transition-colors shrink-0 cursor-pointer"
                  title="Attach screenshot doubt"
                >
                  <ImageIcon className="w-6 h-6" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept="image/*"
                  className="hidden"
                />

                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={
                      imageAttachment
                        ? 'Write any specific doubts or steps for this diagram...'
                        : 'Ask a doubt, upload a question, or type a concept...'
                    }
                    disabled={isLoading}
                    className="w-full py-4 pl-6 pr-24 bg-slate-100 border-none rounded-2xl font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400 shadow-inner text-sm md:text-base font-sans"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || (!inputText.trim() && !imageAttachment)}
                    className="absolute right-2 top-2 bottom-2 px-6 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    Solve
                  </button>
                </div>
              </form>

              {/* Informative Level details line */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400 font-mono font-medium select-none">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    School Level: <strong className="text-slate-600 uppercase">{level}</strong>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    Subject Domain: <strong className="text-indigo-600 uppercase">{subject}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md font-bold text-[9px] uppercase tracking-wider border border-amber-100/50">
                  {mode === 'concept-teacher' ? '📚 Concept Mode' : '✏️ Step-by-Step Solver'}
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* Dynamic Custom Confirmation Modal (Failsafe for iframe alert restrictions) */}
      <AnimatePresence>
        {isConfirmModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark blur backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConfirmModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              id="confirm-modal-backdrop"
            />
            {/* Modal Body Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-2xl max-w-sm w-full relative z-10 text-slate-800 font-sans"
              id="new-session-confirmation-dialog"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-100 text-amber-500 flex items-center justify-center mb-4">
                  <RotateCcw className="w-6 h-6 animate-spin-slow text-amber-500" />
                </div>
                <h3 className="font-extrabold text-lg text-slate-900 leading-tight">Start New Study Session?</h3>
                <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
                  Your active discussion list is already backed up to your chronological Study snapshots. Would you like to clear this workspace and try a fresh query?
                </p>
                <div className="grid grid-cols-2 gap-3 w-full mt-6">
                  <button
                    onClick={() => setIsConfirmModalOpen(false)}
                    className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer border border-slate-200/40 select-none"
                    id="confirm-modal-cancel-btn"
                  >
                    Keep Current
                  </button>
                  <button
                    type="button"
                    onClick={executeNewSession}
                    className="py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all cursor-pointer select-none"
                    id="confirm-modal-confirm-btn"
                  >
                    Start Fresh
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
