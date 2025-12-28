
export enum AppTab {
  HOME = 'home',
  PRACTICE = 'practice',
  TEACHER = 'teacher',
  CHAT = 'chat'
}

export enum GradeLevel {
  ELEM_1_2 = 'elem_1_2', // כיתות א-ב
  ELEM_3_4 = 'elem_3_4', // כיתות ג-ד
  ELEM_5_6 = 'elem_5_6', // כיתות ה-ו
  MIDDLE = 'middle'      // חט"ב
}

export interface ComprehensionQuestion {
  dimension: 'literal' | 'inferential' | 'global' | 'evaluative';
  question: string;
  type: 'choice' | 'open';
  options?: string[];
  correctAnswer: string;
}

export interface Exercise {
  type: string;
  question: string;
  options: string[];
}

export interface DiscoveryQuestion {
  sense: string;
  type: 'choice' | 'boolean' | 'blank';
  question: string;
  options?: string[];
  correctAnswer: string;
}

export interface AdjectiveTask {
  analysisQuestions: string[];
  cloze: {
    textWithBlanks: string;
    wordBank: string[];
  };
  creativePrompt: string;
}

export interface WordImageMatchExercise {
  phrase: string;
  description: string; // Used for image generation
  url?: string; // The generated image data URL
}

export interface WorksheetData {
  originalText: string;
  title: string;
  exercises: Exercise[];
  sensoryQuestions: DiscoveryQuestion[];
  comprehensionQuestions: ComprehensionQuestion[];
  adjectiveTask?: AdjectiveTask;
  drawPrompt: string;
  wordImageMatches: WordImageMatchExercise[];
  suggestedVisualKeywords: string[]; 
  sentenceMatches: any[]; 
}

export interface PracticeScenario {
  title?: string;
  text: string;
  questions: DiscoveryQuestion[];
  adjectiveTask?: Omit<AdjectiveTask, 'analysisQuestions'>;
  wordImageMatches: WordImageMatchExercise[];
}

export interface AppState {
  lastGeneratedText?: string;
  activeWorksheet?: WorksheetData;
  gradeLevel: GradeLevel;
  useNikud: boolean;
}
