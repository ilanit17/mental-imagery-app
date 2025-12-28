
import React, { useState, useEffect } from 'react';
import { GradeLevel } from '../types';
import { Loader2, RefreshCw, BookOpen, CheckCircle2, XCircle } from 'lucide-react';

// Verified Unsplash IDs that match the Hebrew descriptions perfectly
const CHALLENGE_LIBRARY = [
  { 
    text: "הילד לבש מעיל אדום גדול וכובע צמר כחול בזמן שירד שלג לבן מסביב.", 
    correct: "https://images.unsplash.com/photo-1511216113906-8f57bb83e776?q=80&w=800&auto=format&fit=crop", // Child in winter clothes
    distractor: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop" // Tropical beach
  },
  { 
    text: "על השולחן עמדה קערה לבנה עם פירות טריים: תפוח ירוק אחד ובננה צהובה.", 
    correct: "https://images.unsplash.com/photo-1519996529931-28324d5a630e?q=80&w=800&auto=format&fit=crop", // Fruit bowl with banana and apple
    distractor: "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?q=80&w=800&auto=format&fit=crop" // Cupcakes
  },
  { 
    text: "כלב קטן וחום רץ על הדשא הירוק בגינה ביום שמש בהיר.", 
    correct: "https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?q=80&w=800&auto=format&fit=crop", // Brown dog on grass
    distractor: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=800&auto=format&fit=crop" // Black cat
  },
  { 
    text: "ספינה גדולה עם מפרש לבן שטה בים כחול תחת שמיים כתומים של שקיעה.", 
    correct: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop", // Sailboat at sunset
    distractor: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop" // Snowy mountains
  },
  {
    text: "חתול שחור קטן יושב על שטיח סגול ליד חלון גדול ומואר.",
    correct: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=800&auto=format&fit=crop", // Black cat
    distractor: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=800&auto=format&fit=crop" // Dog with glasses
  }
];

const MatchImage: React.FC<{ gradeLevel: GradeLevel; useNikud: boolean }> = ({ gradeLevel, useNikud }) => {
  const [challenge, setChallenge] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const startNewGame = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const randomChallenge = CHALLENGE_LIBRARY[Math.floor(Math.random() * CHALLENGE_LIBRARY.length)];
      setChallenge(randomChallenge);
      const opts = [
        { url: randomChallenge.correct, isCorrect: true },
        { url: randomChallenge.distractor, isCorrect: false }
      ].sort(() => Math.random() - 0.5);
      setOptions(opts);
      setSelectedIdx(null);
      setShowResult(false);
      setIsRefreshing(false);
    }, 400);
  };

  useEffect(() => { startNewGame(); }, []);

  if (!challenge) return null;

  return (
    <div className="max-w-4xl mx-auto py-6 animate-fadeIn">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-6 py-2 rounded-full font-black text-sm mb-4 shadow-sm">
          <BookOpen size={18} />
          <span>משחק הדיוק החזותי</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-slate-800">התאימו תמונה למשפט</h2>
        <p className="text-slate-500 mt-2 font-medium">קראו היטב ונסו לראות את הפרטים בתוך הראש.</p>
      </div>

      <div className={`bg-white p-6 md:p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 mb-10 transition-all duration-500 ${isRefreshing ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
        <div className="bg-slate-50 p-8 md:p-12 rounded-[2.5rem] text-2xl md:text-4xl text-blue-900 font-black leading-relaxed mb-12 text-center shadow-inner border border-slate-100 italic">
          "{challenge.text}"
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {options.map((opt, idx) => (
            <button
              key={idx + challenge.text}
              onClick={() => { setSelectedIdx(idx); setShowResult(true); }}
              disabled={showResult || isRefreshing}
              className={`relative rounded-[3rem] overflow-hidden border-8 transition-all w-full aspect-square bg-white shadow-lg ${
                showResult 
                  ? opt.isCorrect 
                    ? 'border-green-500 ring-8 ring-green-100 scale-105 z-10' 
                    : selectedIdx === idx ? 'border-red-500 opacity-80' : 'border-transparent opacity-50'
                  : selectedIdx === idx 
                    ? 'border-blue-500' 
                    : 'border-white hover:border-blue-200 hover:scale-[1.02]'
              }`}
            >
              <img 
                src={opt.url} 
                alt="Option" 
                className="w-full h-full object-cover"
              />
              {showResult && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[1px]">
                  {opt.isCorrect ? (
                    <div className="bg-green-500 text-white p-4 rounded-full shadow-2xl animate-bounce">
                      <CheckCircle2 size={48} />
                    </div>
                  ) : selectedIdx === idx ? (
                    <div className="bg-red-500 text-white p-4 rounded-full shadow-2xl animate-shake">
                      <XCircle size={48} />
                    </div>
                  ) : null}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {showResult && (
        <div className="text-center animate-bounceUp">
          <div className={`inline-block px-10 py-6 rounded-[2rem] shadow-xl mb-8 ${options[selectedIdx!].isCorrect ? 'bg-green-50 text-green-700 border-2 border-green-200' : 'bg-red-50 text-red-700 border-2 border-red-200'}`}>
            <h3 className="text-3xl font-black mb-2">
              {options[selectedIdx!].isCorrect ? 'כל הכבוד! דמיון מדויק!' : 'לא בדיוק... קראו שוב!'}
            </h3>
            <p className="text-lg font-bold opacity-80">
              {options[selectedIdx!].isCorrect 
                ? 'שמתם לב לכל הפרטים הקטנים בסיפור.' 
                : 'שימו לב לצבעים ולפרטים הקטנים שמופיעים בטקסט.'}
            </p>
          </div>
          <br />
          <button 
            onClick={startNewGame} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-black py-5 px-14 rounded-full shadow-2xl flex items-center gap-3 mx-auto transition-all hover:scale-110 active:scale-95 text-xl"
          >
            <RefreshCw size={28} className={isRefreshing ? 'animate-spin' : ''} /> משחק חדש
          </button>
        </div>
      )}
    </div>
  );
};

export default MatchImage;
