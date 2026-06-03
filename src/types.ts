/**
 * StudyMate AI Type Definitions
 */

export type StudentLevel = 'Primary School' | 'High School' | 'College';

export type AcademicSubject =
  | 'Mathematics'
  | 'Physics'
  | 'Chemistry'
  | 'Biology'
  | 'Computer Science'
  | 'English'
  | 'General Knowledge';

export type LearningMode = 'doubt-solver' | 'concept-teacher';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string; // base64 string
  subject?: AcademicSubject;
  level?: StudentLevel;
  mode?: LearningMode;
  timestamp: string;
}

export interface PresetDoubt {
  id: string;
  subject: AcademicSubject;
  question: string;
  title: string;
  emoji: string;
}

export interface StudySession {
  id: string;
  userId?: string; // Optional link to a specific user for multi-user storage segregation
  title: string;
  subject: AcademicSubject;
  level: StudentLevel;
  mode: LearningMode;
  messages: ChatMessage[];
  timestamp: string;
}

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  avatar: string; // stores selected animal/subject emoji or initials symbol
  passwordHash: string; // client-side simulation
  createdAt: string;
}

