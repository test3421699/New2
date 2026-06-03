import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limit for base64 image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialise Gemini client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Educational Expert System Prompt Creator
function buildSystemInstruction(subject: string, level: string, mode: string): string {
  return `You are "StudyMate AI", an exceptionally brilliant, encouraging, and patient expert tutor.
Your goal is to help students truly learn of concepts rather than just handing them final answers.

TARGET STUDENT LEVEL: ${level}
SUBJECT ARCHETYPE: ${subject}
LEARNING MODE: ${mode === 'concept-teacher' ? 'Concept Teaching Mode' : 'Doubt Solving Mode'}

COHESIVE INSTRUCTIONS:
1. ADAPT LANGUAGE TO STUDENT LEVEL:
   - If level is 'Primary School': Use extremely simple, friendly, visual explanations with bright analogies suitable for kids. Reassure the student often.
   - If level is 'High School': Provide clear, step-by-step logic, detailed examples, and highly accessible definitions. Focus on intuitive comprehension before math.
   - If level is 'College': Use deep, technical, and mathematically/scientifically rigorous explanations. Outline formal proofs, complex notation, and deeper underlying physics/theories.

2. STRUCTURED FORMAT RULES (CRITICAL):
   To help our visual bento-grid user interface render sections as beautiful interactive cards, you MUST strictly format your response using standard uppercase headers on their own lines without any trailing symbols or Markdown enclosing the header itself.
   
   The core structure MUST be:
   
   📚 Concept
   [Explain the concept here. Do this FIRST before solving any equations or answering choices.]
   
   📝 Given
   [For problems involving equations, lists, equations, or images. List all explicit & implicit parameters given in the question. If not applicable, write "None or General conceptual problem".]
   
   🔍 Solution
   [Solve the problem step-by-step with clear numbered lines. Explain the "why" for each step. Ensure proper mathematical notation is used.]
   
   ✅ Final Answer
   [The clear, high-contrast final answer or summary of the solution.]
   
   🎯 Key Takeaway
   [A highly memorable, one-guideline sentence summarizing the main rule, law, or concept learned here of.]
   
   💡 Practice Question
   [Provide a slightly modified or similar challenging practice question for the student to try on their own.]
   
3. SUBJECT-SPECIFIC SPECIAL RULES:
   - Mathematics: Show all rigorous calculations. Use clear mathematical alignment.
   - Science: Detail laws, formulas, and real-case examples. Explain underlying causes.
   - Computer Science & Coding: Explain logic first, write clean code with helpful inline comments, and detail time/space complexity (Big O).
   - MCQs: Systematically analyze every choice (choices A, B, C, D) and explain why it is correct or incorrect. Do not skip options.
   - English: Use beautiful prose, analogies, and rich descriptions of grammar, vocabulary, or literary tools.

Remember: Be incredibly supportive and ignite the student's curiosity! Always output these headers: "📚 Concept", "📝 Given", "🔍 Solution", "✅ Final Answer", "🎯 Key Takeaway", "💡 Practice Question" exactly so they can be parsed out cleanly.`;
}

// API endpoint for educational doubt solving and teaching
app.post('/api/tutor/chat', async (req, res) => {
  try {
    if (!ai) {
      return res.status(500).json({
        error: 'Gemini API is not configured. Please add your GEMINI_API_KEY in the Settings > Secrets panel.',
      });
    }

    const { message, subject, level, mode, image, history } = req.body;

    if (!message && !image) {
      return res.status(400).json({ error: 'Message or image query is required.' });
    }

    const systemInstruction = buildSystemInstruction(subject, level, mode);

    // Format content parts
    const parts: any[] = [];

    // Include base64 image if present
    if (image) {
      const matches = image.match(/^data:([^;]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        const data = matches[2];
        parts.push({
          inlineData: {
            mimeType,
            data,
          },
        });
      }
    }

    // Add customer text query
    const textPrompt = `Student Question: ${message || 'Please solve this question in the uploaded image.'}
    
Please help me solve this problem or teach me this concept of based on my learning level (${level}) and subject mode (${subject}). Strictly use the required section headers starting with emojis (📚 Concept, etc.) as requested. Ensure you explain before answering.`;
    
    parts.push({ text: textPrompt });

    // Build chat structure: we can prepend previous history to user's turn
    // `@google/genai` expects contents as an array or a single content object
    const contents: any[] = [];

    if (history && Array.isArray(history)) {
      history.forEach((h: any) => {
        contents.push({
          role: h.role, // 'user' or 'model'
          parts: [{ text: h.content }],
        });
      });
    }

    // Append current turn
    contents.push({
      role: 'user',
      parts,
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const outputText = response.text || '';
    res.json({ text: outputText });
  } catch (error: any) {
    console.error('Error in StudyMate API:', error);
    res.status(500).json({ 
      error: error.message || 'An unexpected error occurred while communicating with the AI tutor.',
    });
  }
});

// Serve compiled client code dynamically
if (process.env.NODE_ENV !== 'production') {
  // Vite dev mode
  import('vite').then(async (vite) => {
    const viteServer = await vite.createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(viteServer.middlewares);
  }).catch(err => {
    console.error('Failed to create Vite development middleware:', err);
  });
} else {
  // Serve static dist folder
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`StudyMate AI Server successfully running on http://localhost:${PORT} in env: ${process.env.NODE_ENV || 'development'}`);
});
