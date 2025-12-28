
export type AtmosphereType = 
  | 'tension'      // מתח
  | 'anticipation' // ציפייה
  | 'sadness'     // עצב
  | 'calm'        // רגיעה
  | 'joy'         // שמחה
  | 'festive'     // חגיגי
  | 'excitement'; // התרגשות

export interface AtmosphereElement {
  type: 'action' | 'dialogue' | 'color' | 'sound' | 'adjective' | 'punctuation';
  content: string;
  location?: string; // מיקום בטקסט (אופציונלי)
}

export type AtmosphereExerciseType = 
  | 'identify'    // זיהוי האווירה
  | 'mark'        // סימון אלמנטים
  | 'match'       // התאמה
  | 'explain';    // הסבר

export interface AtmosphereExercise {
  id: string;
  type: AtmosphereExerciseType;
  question: string;
  options?: string[]; // עבור identify ו-match
  correctAnswer: string | string[];
  elements?: AtmosphereElement[]; // עבור mark
  categories?: string[]; // עבור match
  feedback?: string;
}

export interface AtmosphereAnalysis {
  primaryAtmosphere: AtmosphereType;
  elements: AtmosphereElement[];
  exercises: AtmosphereExercise[];
  text: string;
}

export interface AtmosphereExerciseResult {
  exerciseId: string;
  userAnswer: string | string[];
  isCorrect: boolean;
  score: number;
  feedback?: string;
}

export interface AtmosphereExerciseState {
  currentExerciseIndex: number;
  results: AtmosphereExerciseResult[];
  isComplete: boolean;
  totalScore: number;
}

export const ATMOSPHERE_LABELS: Record<AtmosphereType, string> = {
  tension: 'מתח',
  anticipation: 'ציפייה',
  sadness: 'עצב',
  calm: 'רגיעה',
  joy: 'שמחה',
  festive: 'חגיגי',
  excitement: 'התרגשות'
};

