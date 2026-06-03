/**
 * StudyMate AI Utility Helpers
 */

export interface ParsedResponse {
  introText: string;
  concept: string;
  given: string;
  solution: string;
  finalAnswer: string;
  keyTakeaway: string;
  practiceQuestion: string;
  rawText: string;
  isStructured: boolean;
}

/**
 * Parses the AI tutor's structured output into distinct section chunks for UI card layouts.
 */
export function parseTutorResponse(text: string): ParsedResponse {
  const result: ParsedResponse = {
    introText: '',
    concept: '',
    given: '',
    solution: '',
    finalAnswer: '',
    keyTakeaway: '',
    practiceQuestion: '',
    rawText: text,
    isStructured: false,
  };

  const lines = text.split('\n');
  let currentField: keyof ParsedResponse | 'intro' = 'intro';
  const introLines: string[] = [];
  const conceptLines: string[] = [];
  const givenLines: string[] = [];
  const solutionLines: string[] = [];
  const finalAnswerLines: string[] = [];
  const keyTakeawayLines: string[] = [];
  const practiceLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check for section transitions
    if (/^[📚📖]*\s*(Concept|📚|CONCEPT)/i.test(trimmed)) {
      currentField = 'concept';
      result.isStructured = true;
      continue;
    } else if (/^[📝📋]*\s*(Given|📝|GIVEN)/i.test(trimmed)) {
      currentField = 'given';
      result.isStructured = true;
      continue;
    } else if (/^[🔍⚙️🔧]*\s*(Solution|🔍|SOLUTION)/i.test(trimmed)) {
      currentField = 'solution';
      result.isStructured = true;
      continue;
    } else if (/^[✅🏆🌟]*\s*(Final Answer|✅|FINAL ANSWER)/i.test(trimmed)) {
      currentField = 'finalAnswer';
      result.isStructured = true;
      continue;
    } else if (/^[🎯💡📢]*\s*(Key Takeaway|🎯|KEY TAKEAWAY)/i.test(trimmed)) {
      currentField = 'keyTakeaway';
      result.isStructured = true;
      continue;
    } else if (/^[💡📝❓]*\s*(Practice Question|💡|PRACTICE QUESTION)/i.test(trimmed)) {
      currentField = 'practiceQuestion';
      result.isStructured = true;
      continue;
    }

    // Append to current target section
    if (currentField === 'intro') {
      introLines.push(line);
    } else if (currentField === 'concept') {
      conceptLines.push(line);
    } else if (currentField === 'given') {
      givenLines.push(line);
    } else if (currentField === 'solution') {
      solutionLines.push(line);
    } else if (currentField === 'finalAnswer') {
      finalAnswerLines.push(line);
    } else if (currentField === 'keyTakeaway') {
      keyTakeawayLines.push(line);
    } else if (currentField === 'practiceQuestion') {
      practiceLines.push(line);
    }
  }

  // Join lines back
  result.introText = introLines.join('\n').trim();
  result.concept = conceptLines.join('\n').trim();
  result.given = givenLines.join('\n').trim();
  result.solution = solutionLines.join('\n').trim();
  result.finalAnswer = finalAnswerLines.join('\n').trim();
  result.keyTakeaway = keyTakeawayLines.join('\n').trim();
  result.practiceQuestion = practiceLines.join('\n').trim();

  // If we marked structured but some main components are missing, let's keep it structured
  // so we can render beautiful cards. Otherwise, check if any section was successfully found.
  return result;
}

/**
 * Formats inline bold text, bullet points and returns an array of structured paragraph elements.
 */
export function formatMarkdownInline(text: string): { type: 'text' | 'bold' | 'code' | 'bullet' | 'code-block'; value: string; language?: string }[] {
  if (!text) return [];

  const parts: { type: 'text' | 'bold' | 'code' | 'bullet' | 'code-block'; value: string; language?: string }[] = [];
  
  // First, parse code blocks
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    const textBefore = text.substring(lastIndex, match.index);
    if (textBefore) {
      parts.push(...parseInlineStyles(textBefore));
    }

    parts.push({
      type: 'code-block',
      language: match[1] || 'plaintext',
      value: match[2].trim(),
    });

    lastIndex = codeBlockRegex.lastIndex;
  }

  const remainingText = text.substring(lastIndex);
  if (remainingText) {
    parts.push(...parseInlineStyles(remainingText));
  }

  return parts;
}

function parseInlineStyles(text: string): { type: 'text' | 'bold' | 'code' | 'bullet'; value: string }[] {
  const lines = text.split('\n');
  const items: { type: 'text' | 'bold' | 'code' | 'bullet'; value: string }[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      items.push({ type: 'text', value: '' });
      continue;
    }

    // Check if bullet point
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
      const content = trimmed.substring(2);
      items.push({ type: 'bullet', value: content });
      continue;
    }

    // Parse inline bold or mono code markers **bold** and `code`
    let inlineText = line;
    // For simplicity, we create text entries that can render bold and code
    items.push({ type: 'text', value: inlineText });
  }

  return items;
}
