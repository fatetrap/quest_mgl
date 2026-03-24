
export enum Sender {
  USER = 'USER',
  OPPONENT = 'OPPONENT',
  SYSTEM = 'SYSTEM'
}

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  timestamp: number;
  isMongolian?: boolean; // Flag to style Cyrillic text differently
  phonetic?: string; // New: Pronunciation guide
}

export interface Challenge {
  phrase: string; // Cyrillic
  phonetic: string; // New: Pronunciation guide like "Sain baina uu"
  translation: string; // Correct answer
  options: string[]; // New: Multiple choice options
}

export interface GameState {
  integrity: number; // 0-100 (Health/Spirit)
  streak: number; // Current consecutive wins
  status: 'ONBOARDING' | 'ACTIVE' | 'VICTORY' | 'DEFEAT';
  messages: Message[];
  isShaking: boolean;
  isFlashing: boolean;
  opponentImage?: string; 
  currentScene: string; // New: Background image URL
  currentChallenge?: Challenge;
  availableQuestionIndices: number[]; // New: Tracks unused questions to prevent repeats
}

export const OPPONENT_NAME = "BATZORIG";
export const OPPONENT_CLASS = "KHAN'S GUARD";