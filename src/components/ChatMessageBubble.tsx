import React from 'react';
import { ChatMessage } from '../types';
import { BentoAnswer } from './BentoAnswer';
import { GraduationCap, User } from 'lucide-react';
import Latex from 'react-latex-next';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  onCheckAnswer?: (studentAnswer: string) => void;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message, onCheckAnswer }) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex w-full gap-3 md:gap-4 ${
        isUser ? 'justify-end' : 'justify-start'
      } py-4`}
    >
      {/* Bot Icon on the left for assistant */}
      {!isUser && (
        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white flex-shrink-0 shadow-[0_2px_8px_rgba(79,70,229,0.3)] border border-indigo-500">
          <GraduationCap className="w-5 h-5 md:w-6 md:h-6" />
        </div>
      )}

      {/* Message Box */}
      <div
        className={`max-w-[88%] md:max-w-[82%] space-y-2 ${
          isUser ? 'items-end' : 'items-start'
        }`}
      >
        {/* User / Bot label info */}
        <div
          className={`flex items-center gap-2 text-xs text-slate-400 font-mono ${
            isUser ? 'justify-end' : 'justify-start'
          }`}
        >
          <span>{isUser ? 'Student Question' : 'StudyMate AI Tutor'}</span>
          <span>•</span>
          {message.subject && (
            <>
              <span className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                {message.subject}
              </span>
              <span>•</span>
            </>
          )}
          {message.level && (
            <>
              <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                {message.level}
              </span>
              <span>•</span>
            </>
          )}
          <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        {/* Content Box */}
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm ${
            isUser
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-none border border-indigo-500 shadow-indigo-100'
              : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
          }`}
        >
          {isUser ? (
            <div className="space-y-3">
              {/* Optional Prompt Image Attachment */}
              {message.image && (
                <div className="relative rounded-lg overflow-hidden border border-indigo-500/30 max-w-xs bg-indigo-950/20">
                  <img
                    src={message.image}
                    alt="Uploaded question attachment"
                    className="max-h-52 object-contain rounded-lg"
                  />
                  <div className="absolute top-2 left-2 bg-indigo-900/80 px-2 py-0.5 rounded text-[10px] font-semibold text-indigo-200 backdrop-blur-xs">
                    Image Query Attachment
                  </div>
                </div>
              )}
              <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap select-text selection:bg-indigo-300 max-w-full overflow-x-auto py-0.5">
                <Latex>{message.content}</Latex>
              </div>
            </div>
          ) : (
            /* StudyMate AI Response Bento Grid Container */
            <BentoAnswer content={message.content} onCheckAnswer={onCheckAnswer} />
          )}
        </div>
      </div>

      {/* User Icon on the right for user */}
      {isUser && (
        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600 flex-shrink-0">
          <User className="w-5 h-5 md:w-6 md:h-6" />
        </div>
      )}
    </div>
  );
};
