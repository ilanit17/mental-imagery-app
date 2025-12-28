
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { GradeLevel } from '../types';
import { Send, User, Bot, Sparkles, Loader2, MessageSquareText, Lightbulb, GraduationCap } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface ChatAssistantProps {
  gradeLevel: GradeLevel;
  useNikud: boolean;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ gradeLevel, useNikud }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'שלום! אני המומחה לאסטרטגיות קריאה של "הסרט שבראש". איך אוכל לעזור לכם היום לפתח את הדמיון של התלמידים?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getNikudInstruction = (useNikud: boolean) => 
    useNikud ? "חשוב מאוד: הוסף ניקוד מלא לכל תשובה שלך בעברית." : "אין צורך בניקוד.";

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const apiKey = process.env.API_KEY || (window as any).__API_KEY__;
      if (!apiKey) {
        throw new Error('API_KEY is not configured');
      }
      const ai = new GoogleGenAI({ apiKey });
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: `אתה מומחה פדגוגי לאסטרטגיות קריאה והבנת הנקרא, המתמחה באסטרטגיית 'הדמיה מנטלית' (Mental Imagery). 
          תפקידך לסייע למורים ולתלמידים להשתמש באפליקציה 'הסרט שבראש'. 
          אתה מעודד, יצירתי ונותן עצות פרקטיות איך להפוך טקסט ל"סרט" בראש בעזרת חמשת החושים.
          התאם את השפה שלך לרמה של יסודי וחטיבת ביניים.
          ${getNikudInstruction(useNikud)}`,
        },
        history: messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
      });

      const result = await chat.sendMessage({ message: userMsg });
      const responseText = result.text || 'מצטער, חלה שגיאה בעיבוד התשובה.';
      
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: 'אופס, משהו השתבש בחיבור שלי. נסו שוב בעוד רגע.' }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "איך להסביר לתלמיד מה זה חוש הריח בדמיון?",
    "תן לי דוגמה לטקסט תיאורי קצר לכיתה ג'",
    "איך אסטרטגיית הדמיה עוזרת להבנת הנקרא?",
    "הצע לי פעילות כיתתית עם חוש המישוש"
  ];

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-200px)] flex flex-col bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-fadeIn">
      {/* Header */}
      <div className="bg-indigo-900 p-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-700 p-3 rounded-2xl">
            <GraduationCap size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black">התייעצות עם המומחה</h2>
            <p className="text-xs opacity-70">עזרה פדגוגית ורעיונות להדמיה</p>
          </div>
        </div>
        <div className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          מחובר למרכז הידע
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-grow overflow-y-auto p-6 space-y-6 bg-slate-50/50"
      >
        {messages.map((m, i) => (
          <div 
            key={i} 
            className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''} animate-slideUp`}
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
              m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-indigo-600 border border-indigo-100'
            }`}>
              {m.role === 'user' ? <User size={20} /> : <Bot size={20} />}
            </div>
            <div className={`max-w-[80%] p-4 rounded-3xl text-sm leading-relaxed shadow-sm font-medium ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-2xl bg-white border border-indigo-100 flex items-center justify-center text-indigo-300">
              <Bot size={20} />
            </div>
            <div className="bg-white border border-slate-100 p-4 rounded-3xl rounded-tl-none flex items-center gap-2">
              <Loader2 className="animate-spin text-indigo-400" size={16} />
              <span className="text-xs text-slate-400 font-bold">המומחה חושב...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input & Suggestions */}
      <div className="p-6 bg-white border-t border-slate-100">
        {messages.length < 3 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {suggestions.map((s, i) => (
              <button 
                key={i}
                onClick={() => setInput(s)}
                className="bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-100 hover:border-indigo-100 transition-all flex items-center gap-1.5"
              >
                <Lightbulb size={14} className="text-orange-400" />
                {s}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-3 relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="שאלו את המומחה הכל על הדמיה מנטלית..."
            className="flex-grow p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white focus:outline-none transition-all text-sm font-bold"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white p-4 rounded-2xl shadow-lg transition-all flex items-center justify-center"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;
