
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { GradeLevel, WorksheetData, DiscoveryQuestion, AdjectiveTask, PracticeScenario, WordImageMatchExercise } from "../types";
import { AtmosphereType, AtmosphereAnalysis, AtmosphereElement, AtmosphereExercise } from "../types/atmosphere.types";

const getAI = () => {
  // Try multiple ways to get the API key
  const apiKey = 
    process.env.API_KEY || 
    process.env.GEMINI_API_KEY ||
    (typeof window !== 'undefined' && (window as any).__API_KEY__) ||
    (typeof window !== 'undefined' && (window as any).process?.env?.API_KEY) ||
    '';
  
  if (!apiKey || apiKey === 'undefined' || apiKey === 'null' || apiKey.trim() === '') {
    console.error('API_KEY is missing or empty:', {
      'process.env.API_KEY': process.env.API_KEY,
      'window.__API_KEY__': typeof window !== 'undefined' ? (window as any).__API_KEY__ : 'N/A'
    });
    throw new Error('API_KEY is not configured. Please set API_KEY in GitHub Secrets (Settings > Secrets and variables > Actions) and rebuild the app by running the workflow again.');
  }
  
  return new GoogleGenAI({ apiKey });
};

const getFallbackImageUrl = (prompt: string) => {
  const cleanPrompt = prompt.split(',')[0].replace(/[^a-zA-Z ]/g, "").trim();
  const keywords = cleanPrompt.split(' ').slice(0, 3).join(',');
  return `https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop&sig=${encodeURIComponent(keywords)}`;
};

const imageCache = new Map<string, string>();

class GlobalImageQueue {
  private queue: (() => Promise<any>)[] = [];
  private processing = false;

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
      this.process();
    });
  }

  private async process() {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;
    while (this.queue.length > 0) {
      const fn = this.queue.shift();
      if (fn) {
        await fn();
        await new Promise(r => setTimeout(r, 4000)); 
      }
    }
    this.processing = false;
  }
}

const imageQueue = new GlobalImageQueue();

async function callWithRetry<T>(fn: () => Promise<T>, maxRetries = 2, initialDelay = 3000): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      if (error?.status === 429 && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, initialDelay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

const NO_TEXT_INSTRUCTION = "STRICTLY NO TEXT. NO LETTERS, NO WORDS, NO NUMBERS, NO CHARACTERS, NO SIGNAGE, NO LABELS. ONLY VISUAL ARTWORK. DO NOT INCLUDE ANY CAPTIONS OR WRITTEN SYMBOLS.";

export const generateImageForWord = async (word: string, topic: string): Promise<string | null> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `A clear, simple, high-quality flat illustration of "${word}" related to "${topic}". 
            Minimalist style, white background, educational clip art style. 
            ${NO_TEXT_INSTRUCTION}`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64EncodeString: string = part.inlineData.data;
        return `data:image/png;base64,${base64EncodeString}`;
      }
    }
  } catch (error) {
    console.error("Image generation failed", error);
    throw error;
  }
  return null;
};

const LOGIC_RULES = `
חוקי לוגיקה קריטיים - חובה לציית ללא יוצא מן הכלל:
1. סוג 'boolean' (נכון/לא נכון): חובה לכתוב עובדה/היגד (Statement) ולא שאלה.
   - אסור להשתמש במילות שאלה: "מה", "מי", "אילו", "איך", "כיצד", "מדוע", "למה", "האם".
   - אסור לשים סימן שאלה (?) בסוף.
   - המבנה חייב להיות: [נושא] + [פועל/תואר] + [תיאור].
2. סוג 'choice': שאלה אמריקאית קלאסית עם סימן שאלה ו-4 אפשרויות.
3. סוג 'open': שאלה פתוחה הדורשת תשובה מילולית.
`;

const ATMOSPHERE_ELEMENTS: Record<AtmosphereType, {
  actions: string[];
  dialogue: string[];
  colors: string[];
  sounds: string[];
  adjectives: string[];
  punctuation: string[];
}> = {
  tension: {
    actions: ['רץ', 'ברח', 'נמלט', 'הסתתר', 'נעצר', 'התחבא', 'דפק', 'נשם בכבדות'],
    dialogue: ['"מה קורה?"', '"זה לא בטוח!"', '"מהר!"', '"אני מפחד"'],
    colors: ['אפור', 'כהה', 'שחור', 'אדום עמוק', 'חום כהה'],
    sounds: ['דפיקות', 'צעקות', 'שקט מדאיג', 'נשימות כבדות', 'רעש מפחיד'],
    adjectives: ['מפחיד', 'מאיים', 'מסוכן', 'מדאיג', 'מתחיל', 'חשוך'],
    punctuation: ['!', '...', '?!']
  },
  anticipation: {
    actions: ['המתין', 'הביט', 'הקשיב', 'ציפה', 'התכונן', 'התקרב', 'הציץ'],
    dialogue: ['"מה יקרה?"', '"אני מחכה..."', '"עוד רגע..."', '"כמעט..."'],
    colors: ['צהוב בהיר', 'כתום', 'זהב', 'לבן', 'כחול בהיר'],
    sounds: ['דממה', 'לחישה', 'צעדים רחוקים', 'דפיקות לב', 'נשימה עצורה'],
    adjectives: ['ממתין', 'צפוי', 'מתקרב', 'מתחיל', 'מוכן'],
    punctuation: ['...', '?', '!?']
  },
  sadness: {
    actions: ['בכה', 'התאבל', 'התיישב', 'הסתכל למטה', 'התכופף', 'נסגר', 'התרחק'],
    dialogue: ['"למה?"', '"זה עצוב..."', '"אני לא מבין"', '"זה קשה"'],
    colors: ['כחול כהה', 'אפור', 'שחור', 'סגול עמוק', 'חום'],
    sounds: ['דממה', 'יבבות', 'רוח נושבת', 'גשם', 'מוזיקה עצובה'],
    adjectives: ['עצוב', 'קודר', 'מדוכא', 'מלנכולי', 'כבד'],
    punctuation: ['...', '.', ',', ';']
  },
  calm: {
    actions: ['נח', 'התבונן', 'נשם עמוק', 'הלך לאט', 'התרווח', 'חייך', 'הקשיב'],
    dialogue: ['"כל כך רגוע..."', '"נעים כאן"', '"אני מרגיש טוב"', '"שלווה"'],
    colors: ['כחול בהיר', 'ירוק רך', 'לבן', 'ורוד בהיר', 'צהוב רך'],
    sounds: ['דממה', 'ציוץ ציפורים', 'מים זורמים', 'רוח קלה', 'נשימה רגועה'],
    adjectives: ['רגוע', 'שלווה', 'נינוח', 'מרגיע', 'שקט'],
    punctuation: ['.', ',', '...']
  },
  joy: {
    actions: ['קפץ', 'צחק', 'רקד', 'התחבק', 'צעק בשמחה', 'הרים ידיים', 'התגלגל'],
    dialogue: ['"וואו!"', '"זה מדהים!"', '"אני כל כך שמח!"', '"כן!"'],
    colors: ['צהוב בהיר', 'אדום', 'כתום', 'ורוד', 'ירוק בהיר'],
    sounds: ['צחוק', 'צעקות שמחה', 'מוזיקה עליזה', 'מחיאות כפיים', 'שירה'],
    adjectives: ['שמח', 'עליז', 'מאושר', 'מצחיק', 'נפלא'],
    punctuation: ['!', '!!!', '?!']
  },
  festive: {
    actions: ['חגג', 'רקד', 'שר', 'הרים כוסית', 'התחפש', 'הצטלם', 'התאסף'],
    dialogue: ['"מזל טוב!"', '"בואו נחגוג!"', '"זה חגיגה!"', '"הללויה!"'],
    colors: ['זהב', 'כסף', 'אדום', 'ירוק', 'כחול בהיר', 'ורוד'],
    sounds: ['מוזיקה', 'שירה', 'מחיאות כפיים', 'צחוק', 'ברכות'],
    adjectives: ['חגיגי', 'שמח', 'מפואר', 'צבעוני', 'עליז'],
    punctuation: ['!', '!!!', '?!']
  },
  excitement: {
    actions: ['רץ', 'קפץ', 'צעק', 'הניף ידיים', 'התכונן', 'הזיז', 'התחיל'],
    dialogue: ['"וואו!"', '"זה מדהים!"', '"אני כל כך מתרגש!"', '"בואו נתחיל!"'],
    colors: ['אדום', 'כתום', 'צהוב', 'ורוד', 'סגול'],
    sounds: ['צעקות', 'מוזיקה רועשת', 'מחיאות כפיים', 'צחוק', 'רעש'],
    adjectives: ['מתרגש', 'נרגש', 'אנרגטי', 'דינמי', 'מהיר'],
    punctuation: ['!', '!!!', '?!']
  }
};

const worksheetSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    sensoryQuestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          sense: { type: Type.STRING, enum: ["sight", "hearing", "smell", "touch", "taste", "feeling"] },
          type: { type: Type.STRING, enum: ["choice", "boolean", "blank"] },
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctAnswer: { type: Type.STRING }
        },
        required: ["sense", "type", "question", "correctAnswer"]
      }
    },
    comprehensionQuestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          dimension: { type: Type.STRING, enum: ["literal", "inferential", "global", "evaluative"] },
          question: { type: Type.STRING },
          type: { type: Type.STRING, enum: ["choice", "open"] },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctAnswer: { type: Type.STRING }
        },
        required: ["dimension", "question", "type", "correctAnswer"]
      }
    },
    adjectiveTask: {
      type: Type.OBJECT,
      properties: {
        analysisQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
        cloze: {
          type: Type.OBJECT,
          properties: {
            textWithBlanks: { type: Type.STRING },
            wordBank: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["textWithBlanks", "wordBank"]
        },
        creativePrompt: { type: Type.STRING }
      },
      required: ["analysisQuestions", "cloze", "creativePrompt"]
    },
    drawPrompt: { type: Type.STRING },
    suggestedVisualKeywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 15-20 vivid, concrete phrases or noun-adjective pairs from the text that can be illustrated (e.g., 'blue sky', 'happy boy', 'tall mountain')."
    },
    wordImageMatches: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          phrase: { type: Type.STRING },
          description: { type: Type.STRING }
        },
        required: ["phrase", "description"]
      }
    }
  },
  required: ["title", "sensoryQuestions", "comprehensionQuestions", "adjectiveTask", "drawPrompt", "wordImageMatches", "suggestedVisualKeywords"]
};

export const generateMentalImage = async (prompt: string) => {
  if (imageCache.has(prompt)) return imageCache.get(prompt);
  try {
    const result = await imageQueue.add(() => callWithRetry(async () => {
      const ai = getAI();
      const translationResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Translate to English image prompt: "${prompt}"`,
      });
      const englishPrompt = translationResponse.text?.trim() || prompt;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { 
          parts: [{ 
            text: `A vivid, educational color illustration of ${englishPrompt}. 
            White background, clear subject, high detail. 
            ${NO_TEXT_INSTRUCTION}` 
          }] 
        },
      });
      const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      const data = part ? `data:image/png;base64,${part.inlineData.data}` : null;
      if (data) imageCache.set(prompt, data);
      return data;
    }));
    return result || getFallbackImageUrl(prompt);
  } catch (e) {
    return getFallbackImageUrl(prompt);
  }
};

export const generateWorksheetFromText = async (text: string, grade: GradeLevel, useNikud: boolean = false): Promise<WorksheetData> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `צור דף עבודה שלם המבוסס על הטקסט הבא: "${text}". 
    חלץ רשימה של 15-20 ביטויים/מילים מוחשיים מתוך הטקסט.
    הוסף 4-6 שאלות הבנה ב-4 ממדי הבנה: איתור מידע (literal), פרשנות והסקה (inferential), הבנה גלובלית (global), והערכה/ביקורת (evaluative).
    שלב שאלות אמריקאיות ושאלות פתוחות.
    ${LOGIC_RULES}
    רמה: ${grade}. ${useNikud ? 'נקד הכל.' : ''}`,
    config: { responseMimeType: "application/json", responseSchema: worksheetSchema }
  });
  const data = JSON.parse(response.text || '{}');
  return { ...data, originalText: text, exercises: [], sentenceMatches: [] };
};

export const refineWorksheet = async (current: WorksheetData, instruction: string, grade: GradeLevel, useNikud: boolean = false): Promise<WorksheetData> => {
  const ai = getAI();
  
  // CRITICAL FIX: Strip Base64 image data before sending back to AI to avoid payload size errors
  const imageMap = new Map<string, string>();
  const sanitizedWorksheet = {
    ...current,
    wordImageMatches: current.wordImageMatches.map(match => {
      if (match.url) imageMap.set(match.phrase, match.url);
      return { phrase: match.phrase, description: match.description }; // Omitting url
    })
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `עדכן את דף העבודה לפי ההנחיה הבאה: "${instruction}". 
    נתונים קיימים (ללא נתוני תמונה כבדים): ${JSON.stringify(sanitizedWorksheet)}. 
    ${LOGIC_RULES}
    ${useNikud ? 'חשוב מאוד: הוסף ניקוד מלא לכל הטקסטים בדף העבודה.' : ''}`,
    config: { responseMimeType: "application/json", responseSchema: worksheetSchema }
  });

  const refinedData = JSON.parse(response.text || '{}');
  
  // RESTORE image URLs back to the refined structure
  const restoredMatches = refinedData.wordImageMatches.map((match: WordImageMatchExercise) => ({
    ...match,
    url: imageMap.get(match.phrase) || null
  }));

  return { 
    ...refinedData, 
    wordImageMatches: restoredMatches,
    originalText: current.originalText, 
    exercises: [], 
    sentenceMatches: [] 
  };
};

export type VoiceName = 'Zephyr' | 'Puck' | 'Charon' | 'Kore' | 'Fenrir';

export const generateSpeech = async (text: string, voiceName: VoiceName = 'Zephyr'): Promise<string | undefined> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { 
          voiceConfig: { 
            prebuiltVoiceConfig: { voiceName } 
          } 
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("TTS Generation Error:", error);
    return undefined;
  }
};

const scenarioSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    text: { type: Type.STRING },
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          sense: { type: Type.STRING },
          type: { type: Type.STRING, enum: ["choice", "boolean", "blank"] },
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctAnswer: { type: Type.STRING }
        },
        required: ["sense", "type", "question", "correctAnswer"]
      }
    },
    wordImageMatches: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          phrase: { type: Type.STRING },
          description: { type: Type.STRING }
        },
        required: ["phrase", "description"]
      }
    }
  },
  required: ["title", "text", "questions", "wordImageMatches"]
};

export const generatePracticeScenario = async (topic: string, grade: GradeLevel, useNikud: boolean = false, atmosphereType?: AtmosphereType): Promise<PracticeScenario> => {
  try {
    const ai = getAI();
    
    let atmosphereInstruction = '';
    if (atmosphereType) {
      const elements = ATMOSPHERE_ELEMENTS[atmosphereType];
      atmosphereInstruction = `
    חשוב מאוד: צור טקסט עם אווירה של ${atmosphereType === 'tension' ? 'מתח' : 
      atmosphereType === 'anticipation' ? 'ציפייה' :
      atmosphereType === 'sadness' ? 'עצב' :
      atmosphereType === 'calm' ? 'רגיעה' :
      atmosphereType === 'joy' ? 'שמחה' :
      atmosphereType === 'festive' ? 'חגיגי' : 'התרגשות'}.
    השתמש באלמנטים הבאים ליצירת האווירה:
    - פעולות: ${elements.actions.join(', ')}
    - אמירות: ${elements.dialogue.join(', ')}
    - צבעים וקולות: ${elements.colors.join(', ')}, ${elements.sounds.join(', ')}
    - תארים: ${elements.adjectives.join(', ')}
    - סימני פיסוק: ${elements.punctuation.join(', ')}
    `;
    }
    
    const prompt = `צור תרגיל הדמיה מקיף על הנושא: "${topic}". 
    ${atmosphereInstruction}
    ${LOGIC_RULES}
    רמה: ${grade}. ${useNikud ? 'נקד הכל.' : ''}`;
    
    console.log('Generating scenario with prompt:', prompt.substring(0, 100) + '...');
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: scenarioSchema }
    });
    
    if (!response.text) {
      throw new Error('No response text from AI. Response: ' + JSON.stringify(response));
    }
    
    console.log('AI Response received, length:', response.text.length);
    
    let result: PracticeScenario;
    try {
      result = JSON.parse(response.text);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Response text:', response.text);
      throw new Error('Failed to parse AI response as JSON. Response: ' + response.text.substring(0, 200));
    }
    
    // Validate required fields
    if (!result.text) {
      throw new Error('AI response missing required field "text". Response: ' + JSON.stringify(result));
    }
    
    if (!result.questions || !Array.isArray(result.questions)) {
      result.questions = [];
    }
    
    if (!result.wordImageMatches || !Array.isArray(result.wordImageMatches)) {
      result.wordImageMatches = [];
    }
    
    // הוסף את אלמנטי האווירה אם נבחר סוג אווירה
    if (atmosphereType) {
      const elements: AtmosphereElement[] = [
        ...ATMOSPHERE_ELEMENTS[atmosphereType].actions.map(a => ({ type: 'action' as const, content: a })),
        ...ATMOSPHERE_ELEMENTS[atmosphereType].dialogue.map(d => ({ type: 'dialogue' as const, content: d })),
        ...ATMOSPHERE_ELEMENTS[atmosphereType].colors.map(c => ({ type: 'color' as const, content: c })),
        ...ATMOSPHERE_ELEMENTS[atmosphereType].sounds.map(s => ({ type: 'sound' as const, content: s })),
        ...ATMOSPHERE_ELEMENTS[atmosphereType].adjectives.map(a => ({ type: 'adjective' as const, content: a })),
      ];
      (result as any).atmosphereElements = elements;
      (result as any).atmosphereType = atmosphereType;
    }
    
    return result;
  } catch (error: any) {
    console.error('Error in generatePracticeScenario:', error);
    if (error.message?.includes('API_KEY')) {
      throw error;
    }
    throw new Error(`Failed to generate practice scenario: ${error.message || 'Unknown error'}`);
  }
};

export const analyzeExistingTextForPractice = async (text: string, grade: GradeLevel, useNikud: boolean = false): Promise<PracticeScenario> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `נתח את הטקסט הבא לתרגול אסטרטגיית הדמיה: "${text}". 
    ${LOGIC_RULES}
    רמה: ${grade}. ${useNikud ? 'נקד הכל.' : ''}`,
    config: { responseMimeType: "application/json", responseSchema: scenarioSchema }
  });
  return JSON.parse(response.text || '{}');
};

export const evaluateImagery = async (text: string, userDesc: string, useNikud: boolean = false) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `טקסט מקור: "${text}". תיאור הדמיון של התלמיד: "${userDesc}". 
    תן משוב פדגוגי מעודד בעברית, התמקד במידת הפירוט החושי ובדיוק לעומת המקור. ${useNikud ? 'נקד את המשוב.' : ''}`,
  });
  return response.text || "";
};

export const generateExampleWithSenses = async (grade: GradeLevel, useNikud: boolean): Promise<any> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `צור דוגמת הדמיה (טקסט קצר + ניתוח חושים). רמה: ${grade}. ${useNikud ? 'נקד.' : ''}`,
    config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, text: {type: Type.STRING}, visualText: {type: Type.STRING}, imageDescription: {type: Type.STRING}, senses: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {iconType: {type: Type.STRING}, label: {type: Type.STRING}}}}}} }
  });
  return JSON.parse(response.text || '{}');
};

// סכמות עבור תרגילי אווירה
const atmosphereExerciseSchema = {
  type: Type.OBJECT,
  properties: {
    primaryAtmosphere: { 
      type: Type.STRING, 
      enum: ['tension', 'anticipation', 'sadness', 'calm', 'joy', 'festive', 'excitement'] 
    },
    elements: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ['action', 'dialogue', 'color', 'sound', 'adjective', 'punctuation'] },
          content: { type: Type.STRING },
          location: { type: Type.STRING }
        },
        required: ['type', 'content']
      }
    },
    exercises: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['identify', 'mark', 'match', 'explain'] },
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctAnswer: { type: Type.STRING },
          elements: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                content: { type: Type.STRING }
              }
            }
          },
          categories: { type: Type.ARRAY, items: { type: Type.STRING } },
          feedback: { type: Type.STRING }
        },
        required: ['id', 'type', 'question', 'correctAnswer']
      }
    }
  },
  required: ['primaryAtmosphere', 'elements', 'exercises']
};

export const generateAtmosphereExercises = async (
  text: string,
  grade: GradeLevel,
  useNikud: boolean = false,
  exerciseTypes?: string[],
  numberOfExercises: number = 5
): Promise<AtmosphereAnalysis> => {
  const ai = getAI();
  
  const atmosphereGuide = Object.entries(ATMOSPHERE_ELEMENTS).map(([type, elements]) => {
    const label = type === 'tension' ? 'מתח' : 
      type === 'anticipation' ? 'ציפייה' :
      type === 'sadness' ? 'עצב' :
      type === 'calm' ? 'רגיעה' :
      type === 'joy' ? 'שמחה' :
      type === 'festive' ? 'חגיגי' : 'התרגשות';
    return `${label} (${type}): פעולות: ${elements.actions.join(', ')}, אמירות: ${elements.dialogue.join(', ')}, צבעים: ${elements.colors.join(', ')}, קולות: ${elements.sounds.join(', ')}, תארים: ${elements.adjectives.join(', ')}, פיסוק: ${elements.punctuation.join(', ')}`;
  }).join('\n');
  
  const typesInstruction = exerciseTypes ? `סוגי תרגילים רצויים: ${exerciseTypes.join(', ')}.` : '';
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `נתח את הטקסט הבא וזהה את האווירה שלו:
"${text}"

מדריך סוגי אווירה:
${atmosphereGuide}

צור ${numberOfExercises} תרגילים מסוגים שונים (identify, mark, match, explain) לזיהוי וניתוח האווירה בטקסט.
${typesInstruction}
${LOGIC_RULES}
רמה: ${grade}. ${useNikud ? 'נקד הכל.' : ''}`,
    config: { responseMimeType: "application/json", responseSchema: atmosphereExerciseSchema }
  });
  
  const data = JSON.parse(response.text || '{}');
  return {
    ...data,
    text
  };
};

export const generateTextWithAtmosphere = async (
  topic: string,
  atmosphereType: AtmosphereType,
  grade: GradeLevel,
  useNikud: boolean = false
): Promise<{ text: string; elements: AtmosphereElement[] }> => {
  const ai = getAI();
  
  const elements = ATMOSPHERE_ELEMENTS[atmosphereType];
  const atmosphereLabel = atmosphereType === 'tension' ? 'מתח' : 
    atmosphereType === 'anticipation' ? 'ציפייה' :
    atmosphereType === 'sadness' ? 'עצב' :
    atmosphereType === 'calm' ? 'רגיעה' :
    atmosphereType === 'joy' ? 'שמחה' :
    atmosphereType === 'festive' ? 'חגיגי' : 'התרגשות';
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `צור טקסט קצר (3-5 משפטים) על הנושא "${topic}" עם אווירה של ${atmosphereLabel}.
    
    השתמש באלמנטים הבאים ליצירת האווירה:
    - פעולות: ${elements.actions.join(', ')}
    - אמירות: ${elements.dialogue.join(', ')}
    - צבעים: ${elements.colors.join(', ')}
    - קולות: ${elements.sounds.join(', ')}
    - תארים: ${elements.adjectives.join(', ')}
    - סימני פיסוק: ${elements.punctuation.join(', ')}
    
    רמה: ${grade}. ${useNikud ? 'נקד הכל.' : ''}`,
  });
  
  const text = response.text || '';
  
  const atmosphereElements: AtmosphereElement[] = [
    ...elements.actions.map(a => ({ type: 'action' as const, content: a })),
    ...elements.dialogue.map(d => ({ type: 'dialogue' as const, content: d })),
    ...elements.colors.map(c => ({ type: 'color' as const, content: c })),
    ...elements.sounds.map(s => ({ type: 'sound' as const, content: s })),
    ...elements.adjectives.map(a => ({ type: 'adjective' as const, content: a })),
    ...elements.punctuation.map(p => ({ type: 'punctuation' as const, content: p })),
  ];
  
  return { text, elements: atmosphereElements };
};

export const checkAtmosphereAnswer = async (
  exercise: AtmosphereExercise,
  userAnswer: string | string[],
  originalText: string,
  grade: GradeLevel
): Promise<{ isCorrect: boolean; score: number; feedback: string }> => {
  const ai = getAI();
  
  const userAnswerStr = Array.isArray(userAnswer) ? userAnswer.join(', ') : userAnswer;
  const correctAnswerStr = Array.isArray(exercise.correctAnswer) 
    ? exercise.correctAnswer.join(', ') 
    : String(exercise.correctAnswer);
  
  // בדיקה ראשונית - אם התשובה זהה, נחזיר נכון
  let isCorrect = false;
  if (Array.isArray(exercise.correctAnswer) && Array.isArray(userAnswer)) {
    // עבור mark/match - בדוק שכל התשובות הנכונות נבחרו
    const correctSet = new Set(exercise.correctAnswer.map(a => String(a).toLowerCase().trim()));
    const userSet = new Set(userAnswer.map(a => String(a).toLowerCase().trim()));
    isCorrect = correctSet.size === userSet.size && 
                Array.from(correctSet).every(ans => userSet.has(ans));
  } else {
    // עבור identify/explain - בדיקה פשוטה
    isCorrect = String(userAnswer).toLowerCase().trim() === correctAnswerStr.toLowerCase().trim();
  }
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `בדוק את התשובה הבאה לתרגיל זיהוי אווירה:
    
    שאלה: ${exercise.question}
    תשובה נכונה: ${correctAnswerStr}
    תשובת התלמיד: ${userAnswerStr}
    טקסט מקור: "${originalText}"
    
    תן משוב מפורט בעברית (2-3 משפטים) שמסביר למה התשובה נכונה או לא נכונה, והדגש את האלמנטים בטקסט שיוצרים את האווירה.
    רמה: ${grade}.`,
  });
  
  const feedback = response.text || '';
  
  return {
    isCorrect,
    score: isCorrect ? 100 : 0,
    feedback
  };
};
