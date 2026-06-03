import React, { useState } from 'react';
import { UserAccount } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, GraduationCap, Eye, EyeOff, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (user: UserAccount | null) => void;
}

const AVATARS = [
  { id: 'owl', emoji: '🦉', label: 'Sage Owl' },
  { id: 'fox', emoji: '🦊', label: 'Clever Fox' },
  { id: 'koala', emoji: '🐨', label: 'Patient Koala' },
  { id: 'panda', emoji: '🐼', label: 'Studious Panda' },
  { id: 'lion', emoji: '🦁', label: 'Mighty Lion' },
  { id: 'unicorn', emoji: '🦄', label: 'Creative Unicorn' },
];

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🦉');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Get users database from localStorage
  const getUsers = (): UserAccount[] => {
    try {
      const u = localStorage.getItem('studymate_users');
      return u ? JSON.parse(u) : [];
    } catch {
      return [];
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg('Please specify both email and password.');
      return;
    }

    const users = getUsers();
    const userFound = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!userFound || userFound.passwordHash !== password) {
      setErrorMsg('Invalid email or password combination.');
      return;
    }

    setSuccessMsg(`Welcome back, ${userFound.name}!`);
    setTimeout(() => {
      onLoginSuccess(userFound);
    }, 800);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name || !email || !password) {
      setErrorMsg('All registration fields are required.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    const users = getUsers();
    const match = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (match) {
      setErrorMsg('An account with this email address already exists.');
      return;
    }

    // Create user account
    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      avatar: selectedAvatar,
      passwordHash: password, // client-side simulation
      createdAt: new Date().toISOString(),
    };

    const updatedUsers = [...users, newUser];
    localStorage.setItem('studymate_users', JSON.stringify(updatedUsers));

    setSuccessMsg('Account created successfully!');
    setTimeout(() => {
      onLoginSuccess(newUser);
    }, 800);
  };

  const handleContinueAsGuest = () => {
    onLoginSuccess(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white overflow-y-auto relative">
      {/* Decorative ambient background elements */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-700/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative z-10"
      >
        {/* Branding header inside Auth */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-indigo-600 p-3.5 rounded-2xl shadow-xl flex items-center justify-center mb-3.5">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase flex items-center gap-1.5">
            StudyMate <span className="text-indigo-400 font-medium">AI</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Your personal smart classroom & bento doubt solver</p>
        </div>

        {/* Action tabs header */}
        <div className="flex bg-slate-950 p-1 rounded-2xl gap-1 mb-6 border border-slate-800">
          <button
            onClick={() => {
              setIsLoginTab(true);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              isLoginTab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setIsLoginTab(false);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              !isLoginTab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Display feedback alerts */}
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="bg-red-950/40 border border-red-500/30 text-red-300 p-3 rounded-xl text-xs font-semibold mb-4 leading-relaxed"
            >
              ⚠️ {errorMsg}
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 p-3 rounded-xl text-xs font-semibold mb-4 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Forms area */}
        <form onSubmit={isLoginTab ? handleLoginSubmit : handleRegisterSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {!isLoginTab ? (
              <motion.div
                key="name-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-1.5"
              >
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-white text-sm rounded-xl outline-none placeholder-slate-600 transition-colors"
                  />
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                placeholder="you@school.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-white text-sm rounded-xl outline-none placeholder-slate-600 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Secret Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-white text-sm rounded-xl outline-none placeholder-slate-600 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {/* Registration Study Persona Avatar choice */}
          <AnimatePresence>
            {!isLoginTab && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 pt-2"
              >
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider block">
                  Select Study Room Companion
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATARS.map((companion) => {
                    const isSelected = selectedAvatar === companion.emoji;
                    return (
                      <button
                        key={companion.id}
                        type="button"
                        onClick={() => setSelectedAvatar(companion.emoji)}
                        title={companion.label}
                        className={`p-2.5 rounded-xl border text-xl flex items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-400 text-white scale-110 shadow-md shadow-indigo-600/20'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        {companion.emoji}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer mt-4 group"
          >
            {isLoginTab ? 'Sign In Workspace' : 'Create Student Profile'}
            <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-4 text-[10px] uppercase tracking-widest font-black text-slate-500">OR</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        <button
          onClick={handleContinueAsGuest}
          className="w-full py-3 bg-slate-950/80 hover:bg-slate-950 text-slate-300 hover:text-white font-bold border border-slate-800 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          Continue as Guest Student
        </button>
      </motion.div>
    </div>
  );
};
