import React, { useState } from 'react';
import { parseTutorResponse } from '../utils';
import { BookOpen, CheckCircle, ClipboardList, HelpCircle, Key, ListChecks, Target, Copy, Check } from 'lucide-react';
import Latex from 'react-latex-next';

interface BentoAnswerProps {
  content: string;
  onCheckAnswer?: (studentAnswer: string) => void;
}

export const BentoAnswer: React.FC<BentoAnswerProps> = ({ content, onCheckAnswer }) => {
  const parsed = parseTutorResponse(content);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [practiceAnswer, setPracticeAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  // Fallback to standard render if the AI response is not structured
  if (!parsed.isStructured) {
    return (
      <div className="prose max-w-none text-slate-700 leading-relaxed pr-2 space-y-4 font-sans">
        {content.split('\n\n').map((paragraph, index) => {
          if (!paragraph.trim()) return null;
          return (
            <p key={index} className="text-sm md:text-base">
              {renderFormattedText(paragraph)}
            </p>
          );
        })}
      </div>
    );
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(label);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  /**
   * Helper to ensure LaTeX math is wrapped inside suitable delimiters for compilation
   */
  function renderLatex(text: string) {
    if (!text) return '';
    // If the text contains typical mathematical expressions/symbols but is not enclosed in $ delimiters,
    // let's wrap it inside inline $ separators to ensure react-latex-next compiles it correctly.
    const hasMathCommand = /\\(theta|pi|alpha|beta|gamma|delta|lambda|mu|sigma|omega|phi|psi|eta|degree|sqrt|frac|pm|cdot|times|approx|geq|leq|neq|infty|sum|prod|int|partial|nabla|to|rightarrow|leftarrow)/i.test(text);
    const hasAnyDelimiters = text.includes('$') || text.includes('\\(') || text.includes('\\[') || text.includes('$$');
    
    const preparedText = (hasMathCommand && !hasAnyDelimiters) ? `$${text}$` : text;
    return <Latex>{preparedText}</Latex>;
  }

  /**
   * Safe Inline Formatter for Bold (`**text**`), Code (``code``), and custom layout symbols
   */
  function renderFormattedText(text: string) {
    if (!text) return null;

    // Splitting by newlines to render proper lists and code blocks
    const lines = text.split('\n');

    return (
      <span className="block space-y-2">
        {lines.map((line, lineIndex) => {
          const trimmed = line.trim();
          if (!trimmed) return <span key={lineIndex} className="block h-2" />;

          // Code block boundaries
          if (trimmed.startsWith('```')) {
            return null; // Handle entire code block rendering inside a structured container
          }

          // Bullet points handler
          const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ');
          const isNumbered = /^\d+\.\s/.test(trimmed);

          let displayLine = line;
          let containerClass = "block text-sm md:text-base leading-relaxed text-slate-700 font-sans";

          if (isBullet) {
            displayLine = trimmed.replace(/^[-*•]\s+/, '');
            containerClass = "flex items-start text-sm md:text-base leading-relaxed text-slate-700 pl-4 py-0.5 font-sans";
          } else if (isNumbered) {
            const numMatch = trimmed.match(/^(\d+\.)\s+(.*)/);
            if (numMatch) {
              return (
                <div key={lineIndex} className="flex items-start gap-2 pl-2 py-1 font-sans">
                  <span className="flex items-center justify-center min-w-6 h-6 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full">
                    {numMatch[1].replace('.', '')}
                  </span>
                  <span className="flex-1 text-sm md:text-base text-slate-700 leading-relaxed">
                    {renderTokens(numMatch[2])}
                  </span>
                </div>
              );
            }
          }

          return (
            <span key={lineIndex} className={containerClass}>
              {isBullet && (
                <span className="inline-block mt-2.5 mr-2.5 w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0" />
              )}
              <span className="flex-1">{renderTokens(displayLine)}</span>
            </span>
          );
        })}
      </span>
    );
  }

  /**
   * Helper to parse bold, italics & code tokens inside a line
   */
  function renderTokens(line: string) {
    // Regex matches: **bold** OR `code` OR remaining plain text
    const tokenRegex = /(\*\*.*?\*\*|`.*?`)/g;
    const tokens = line.split(tokenRegex);

    return tokens.map((token, index) => {
      if (token.startsWith('**') && token.endsWith('**')) {
        return (
          <strong key={index} className="font-semibold text-slate-900 bg-amber-50/30 px-0.5 rounded">
            {renderLatex(token.substring(2, token.length - 2))}
          </strong>
        );
      } else if (token.startsWith('`') && token.endsWith('`')) {
        return (
          <code key={index} className="px-1.5 py-0.5 font-mono text-xs font-medium text-pink-600 bg-pink-50 border border-pink-100 rounded-md">
            {renderLatex(token.substring(1, token.length - 1))}
          </code>
        );
      }
      return <React.Fragment key={index}>{renderLatex(token)}</React.Fragment>;
    });
  }

  // Pre-process any code blocks that occur inside Solution
  const renderSolutionWithCode = (rawSolution: string) => {
    // Look for ```[lang] ... ``` segments
    const parts = rawSolution.split(/(```[\s\S]*?```)/g);

    return parts.map((part, segmentIdx) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const match = part.match(/```(\w*)\n([\s\S]*?)```/);
        const language = match ? match[1] : '';
        const codeValue = match ? match[2].trim() : part.slice(3, -3).trim();

        return (
          <div key={segmentIdx} className="my-3 overflow-hidden rounded-lg border border-slate-200 bg-slate-950 font-mono shadow-sm">
            <div className="flex items-center justify-between bg-slate-900 px-4 py-2 text-xs text-slate-400">
              <span>{language || 'code'}</span>
              <button
                onClick={() => handleCopy(codeValue, `code-${segmentIdx}`)}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                {copiedSection === `code-${segmentIdx}` ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="overflow-x-auto p-4 text-xs md:text-sm text-slate-100 line-clamp-none whitespace-pre select-all">
              <code>{codeValue}</code>
            </pre>
          </div>
        );
      }

      return <div key={segmentIdx}>{renderFormattedText(part)}</div>;
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Intro text if present before sections */}
      {parsed.introText && (
        <div className="text-slate-700 text-sm md:text-base leading-relaxed border-l-4 border-indigo-200 pl-4 py-1 italic bg-indigo-50/20 rounded-r-md">
          {renderFormattedText(parsed.introText)}
        </div>
      )}

      {/* Bento Grid Concept Learning Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: 📚 Concept (Required) */}
        {parsed.concept && (
          <div className="col-span-1 md:col-span-2 overflow-hidden rounded-xl bg-white border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all">
            <div className="flex items-center justify-between bg-gradient-to-r from-sky-50 to-sky-100/50 px-4 py-3 border-b border-sky-100/60">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-sky-600" />
                <h3 className="font-semibold text-slate-900 text-sm md:text-base tracking-tight flex items-center gap-2">
                  Academic Concept
                </h3>
              </div>
              <button
                onClick={() => handleCopy(parsed.concept, 'concept')}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                title="Copy Concept"
              >
                {copiedSection === 'concept' ? <Check className="w-4.5 h-4.5 text-emerald-500" /> : <Copy className="w-4.5 h-4.5" />}
              </button>
            </div>
            <div className="p-4 md:p-5 prose-sm max-w-full overflow-x-auto">
              {renderFormattedText(parsed.concept)}
            </div>
          </div>
        )}

        {/* Card 2: 📝 Given Parameters */}
        {parsed.given && (
          <div className="col-span-1 overflow-hidden rounded-xl bg-white border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all">
            <div className="flex items-center justify-between bg-gradient-to-r from-amber-50 to-amber-100/50 px-4 py-3 border-b border-amber-100/60">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-slate-900 text-sm md:text-base tracking-tight">
                  Given Information
                </h3>
              </div>
              <button
                onClick={() => handleCopy(parsed.given, 'given')}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                {copiedSection === 'given' ? <Check className="w-4.5 h-4.5 text-emerald-500" /> : <Copy className="w-4.5 h-4.5" />}
              </button>
            </div>
            <div className="p-4 md:p-5 max-w-full overflow-x-auto">
              {renderFormattedText(parsed.given)}
            </div>
          </div>
        )}

        {/* Card 3: ✅ Final Answer (Compact layout) */}
        {parsed.finalAnswer && (
          <div className={`col-span-1 overflow-hidden rounded-xl bg-indigo-50/40 border border-indigo-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all ${!parsed.given ? 'md:col-span-2' : ''}`}>
            <div className="flex items-center justify-between bg-indigo-100/50 px-4 py-3 border-b border-indigo-100">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-indigo-700" />
                <h3 className="font-bold text-indigo-900 text-sm md:text-base tracking-tight">
                  Final Solution Key
                </h3>
              </div>
              <button
                onClick={() => handleCopy(parsed.finalAnswer, 'answer')}
                className="text-indigo-400 hover:text-indigo-600 transition-colors"
              >
                {copiedSection === 'answer' ? <Check className="w-4.5 h-4.5 text-emerald-500" /> : <Copy className="w-4.5 h-4.5" />}
              </button>
            </div>
            <div className="p-4 md:p-5 bg-gradient-to-b from-indigo-50/20 to-indigo-50/60 max-w-full overflow-x-auto">
              {renderFormattedText(parsed.finalAnswer)}
            </div>
          </div>
        )}

        {/* Card 4: 🔍 Step-by-Step Solution Breakdown */}
        {parsed.solution && (
          <div className="col-span-1 md:col-span-2 overflow-hidden rounded-xl bg-white border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all">
            <div className="flex items-center justify-between bg-gradient-to-r from-emerald-50 to-emerald-100/50 px-4 py-3 border-b border-emerald-100/60">
              <div className="flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-emerald-600" />
                <h3 className="font-semibold text-slate-900 text-sm md:text-base tracking-tight">
                  Step-by-Step Solution
                </h3>
              </div>
              <button
                onClick={() => handleCopy(parsed.solution, 'solution')}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                {copiedSection === 'solution' ? <Check className="w-4.5 h-4.5 text-emerald-500" /> : <Copy className="w-4.5 h-4.5" />}
              </button>
            </div>
            <div className="p-4 md:p-5 max-w-full overflow-x-auto">
              {renderSolutionWithCode(parsed.solution)}
            </div>
          </div>
        )}

        {/* Card 5: 🎯 Key Takeaway Rule */}
        {parsed.keyTakeaway && (
          <div className="col-span-1 md:col-span-2 overflow-hidden rounded-xl bg-gradient-to-r from-violet-50/50 to-purple-50/30 border border-violet-100 shadow-sm">
            <div className="p-4 md:p-5 flex items-start gap-3">
              <div className="flex items-center justify-center p-2 bg-violet-100 rounded-lg text-violet-700 flex-shrink-0 mt-0.5">
                <Target className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-bold text-violet-900 text-sm tracking-wide uppercase">
                  Key Takeaway
                </h4>
                <p className="text-slate-700 text-sm md:text-base font-medium leading-relaxed max-w-full overflow-x-auto">
                  {renderFormattedText(parsed.keyTakeaway)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Card 6: 💡 Self Practice Question */}
        {parsed.practiceQuestion && (
          <div className="col-span-1 md:col-span-2 overflow-hidden rounded-xl bg-slate-50 border border-slate-200/80 shadow-sm">
            <div className="bg-slate-100/60 px-4 py-3 border-b border-slate-200/80 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-slate-900 text-sm md:text-base tracking-tight">
                Try it Yourself! (Self-Practice)
              </h3>
            </div>
            <div className="p-4 md:p-5 space-y-4">
              <div className="text-slate-700 font-medium max-w-full overflow-x-auto">
                {renderFormattedText(parsed.practiceQuestion)}
              </div>

              {/* Simple Student Answer Board for self-evaluation */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Your Answer Scratchpad
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={practiceAnswer}
                    onChange={(e) => setPracticeAnswer(e.target.value)}
                    placeholder="Type your steps or answer here to check..."
                    className="flex-1 px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-sans"
                  />
                  <button
                    onClick={() => {
                      setShowFeedback(true);
                      if (onCheckAnswer) {
                        onCheckAnswer(practiceAnswer);
                      }
                    }}
                    disabled={!practiceAnswer.trim()}
                    className="w-full sm:w-auto shrink-0 bg-indigo-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 active:scale-95 transition-all shadow-sm cursor-pointer whitespace-nowrap text-center flex items-center justify-center min-h-[40px]"
                  >
                    Check Work
                  </button>
                </div>

                {showFeedback && (
                  <div className="p-3.5 bg-indigo-50/80 border border-indigo-100 rounded-lg text-slate-700 text-xs md:text-sm leading-relaxed flex items-start gap-2.5 animate-fadeIn">
                    <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-indigo-900">Evaluating your solution...</p>
                      <p className="text-slate-600 mt-0.5">
                        StudyMate AI has received your answer: <code className="bg-indigo-100/60 px-1 rounded text-indigo-900 font-mono">"{practiceAnswer}"</code>. We have automatically posted it to the tutor. Watch the lesson dialogue below for feedback!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
