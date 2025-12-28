
import React, { useState } from 'react';
import { Eye, Volume2, Wind, Utensils, Hand, Sparkles, CheckCircle, Info } from 'lucide-react';

const senses = [
  { 
    id: 'sight', 
    name: 'ראייה', 
    icon: <Eye />, 
    color: 'bg-red-500', 
    light: 'bg-red-50',
    description: 'מה הצבעים? מה הגודל? מה הצורה? דמיינו כל פרט קטן.',
    benefit: 'עוזר למקם את הדמויות במרחב ולראות את העלילה בצבעים חיים.',
    questions: ['אילו צבעים אני רואה?', 'האם העצם קרוב או רחוק?', 'מה התאורה?'],
    quiz: {
      question: 'מהו הצבע הכי בוהק שאתם יכולים לדמיין עכשיו בסרט שלכם?',
      placeholder: 'למשל: צהוב שמש, כחול ניאון...'
    }
  },
  { 
    id: 'hearing', 
    name: 'שמיעה', 
    icon: <Volume2 />, 
    color: 'bg-blue-500', 
    light: 'bg-blue-50',
    description: 'מה הרעשים מסביב? מוזיקה? צעדים? לחישות?',
    benefit: 'מוסיף עומק ואווירה ל"סרט", ומאפשר לנו "לשמוע" את רגשות הדמויות.',
    questions: ['אילו צלילים נשמעים?', 'האם חזק או חלש?', 'מאיזה כיוון מגיע הקול?'],
    quiz: {
      question: 'איזה קול הכי מרגיע אתכם כשאתם עוצמים עיניים?',
      placeholder: 'למשל: רשרוש עלים, גלים...'
    }
  },
  { 
    id: 'smell', 
    name: 'ריח', 
    icon: <Wind />, 
    color: 'bg-green-500', 
    light: 'bg-green-50',
    description: 'יש ריח של גשם? של עוגיות? של ים?',
    benefit: 'מעורר זיכרונות ורגשות עמוקים, ומעניק לדמיון תחושת מציאות חזקה.',
    questions: ['האם הריח נעים?', 'מה הוא מזכיר לי?', 'האם הריח חזק?'],
    quiz: {
      question: 'איזה ריח הכי מזכיר לכם בית חם ומזמין?',
      placeholder: 'למשל: מרק, עוגה, ריח של גשם...'
    }
  },
  { 
    id: 'taste', 
    name: 'טעם', 
    icon: <Utensils />, 
    color: 'bg-orange-500', 
    light: 'bg-orange-50',
    description: 'האם זה מתוק? מלוח? חמוץ? חריף?',
    benefit: 'מחבר אותנו לרגעים המוחשיים ביותר בסיפור, כמו ארוחה או פרי קטוף.',
    questions: ['מה הטעם בפה?', 'האם זה טרי?', 'האם זה חם או קר?'],
    quiz: {
      question: 'מה הטעם של המילה "מתוק" בתוך הראש שלכם?',
      placeholder: 'למשל: סוכרייה, דבש, פרי...'
    }
  },
  { 
    id: 'touch', 
    name: 'מגע', 
    icon: <Hand />, 
    color: 'bg-purple-500', 
    light: 'bg-purple-50',
    description: 'איך זה מרגיש על העור? מחוספס? רך? דוקרני?',
    benefit: 'עוזר להרגיש את הסביבה ולהפוך את הדמיון למשהו שאפשר כמעט לגעת בו.',
    questions: ['מה המרקם?', 'האם זה נעים למגע?', 'מה הטמפרטורה?'],
    quiz: {
      question: 'איך מרגיש ענן בתוך הדמיון שלכם?',
      placeholder: 'למשל: כמו צמר גפן, רך וקריר...'
    }
  },
];

const Senses: React.FC = () => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});

  const handleAnswerChange = (id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (id: string) => {
    if (answers[id]) {
      setSubmitted(prev => ({ ...prev, [id]: true }));
    }
  };

  return (
    <div className="py-10">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-blue-900 mb-4">גייסו את חמשת החושים</h2>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          השימוש בחושים בונה תמונה עשירה ומציאותית יותר בראש. נסו לשאול את עצמכם שאלות על כל חוש.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {senses.map((sense) => (
          <div key={sense.id} className="group cursor-default flex flex-col h-full">
            <div className={`flex-grow p-6 rounded-3xl ${sense.light} border-2 border-transparent group-hover:border-${sense.color} transition-all shadow-sm flex flex-col items-center text-center`}>
              <div className={`w-16 h-16 rounded-2xl ${sense.color} text-white flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 transition-transform relative`}>
                {React.cloneElement(sense.icon as React.ReactElement<any>, { size: 32 })}
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">{sense.name}</h3>
              
              {/* Added Benefit/Insight Explanation */}
              <div className="mb-4 bg-white/40 p-2 rounded-xl text-[10px] font-bold text-slate-500 border border-white/60 flex items-start gap-1">
                <Info size={12} className="flex-shrink-0 mt-0.5 text-blue-500" />
                <p className="leading-tight text-right">{sense.benefit}</p>
              </div>

              <p className="text-slate-600 mb-6 font-medium leading-tight text-sm">
                {sense.description}
              </p>
              
              <div className="space-y-2 w-full mb-8">
                {sense.questions.map((q, idx) => (
                  <div key={idx} className="bg-white/80 py-2 px-3 rounded-lg text-sm text-slate-500 font-bold border border-white">
                    {q}
                  </div>
                ))}
              </div>

              {/* Quiz Section */}
              <div className="mt-auto w-full pt-4 border-t border-slate-200">
                <div className="bg-white/50 p-4 rounded-2xl border border-white/60">
                  <h4 className="text-xs font-black text-slate-400 mb-2 uppercase tracking-tighter flex items-center justify-center gap-1">
                    <Sparkles size={12} className="text-orange-400" />
                    אתגר דמיון קצר
                  </h4>
                  <p className="text-sm font-bold text-slate-700 mb-3">{sense.quiz.question}</p>
                  
                  {submitted[sense.id] ? (
                    <div className="flex flex-col items-center animate-fadeIn">
                      <div className="flex items-center gap-2 text-green-600 font-black text-sm mb-1">
                        <CheckCircle size={16} />
                        הדמיון פועל!
                      </div>
                      <p className="text-xs text-slate-500 italic">" {answers[sense.id]} "</p>
                      <button 
                        onClick={() => setSubmitted(prev => ({ ...prev, [sense.id]: false }))}
                        className="mt-2 text-[10px] text-blue-500 underline"
                      >
                        שנה תשובה
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <input 
                        type="text" 
                        value={answers[sense.id] || ''}
                        onChange={(e) => handleAnswerChange(sense.id, e.target.value)}
                        placeholder={sense.quiz.placeholder}
                        className="flex-grow text-[10px] p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-400"
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit(sense.id)}
                      />
                      <button 
                        onClick={() => handleSubmit(sense.id)}
                        disabled={!answers[sense.id]}
                        className={`p-2 rounded-lg transition-colors ${answers[sense.id] ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}
                      >
                        <Sparkles size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-blue-900 rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <h3 className="text-3xl font-black mb-6">הסרט שבתוך הראש</h3>
            <p className="text-xl opacity-90 leading-relaxed mb-6">
              חשבו על הטקסט שאתם קוראים כעל סרט בקולנוע. שאלו את עצמכם: "מה אני רואה?", "מה אני שומע?", "אני מדמיין ש..."
            </p>
            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm italic border border-white/20">
              "הרוח נשבה בשערנו כשדהרנו לאורך החול... הגלים התנפצו ברכות על רגלינו..."
            </div>
          </div>
          <div className="flex-1">
            <img 
              src="https://static.vecteezy.com/system/resources/thumbnails/071/717/257/large/golden-retriever-dog-runs-on-sandy-beach-during-sunny-day-ocean-in-background-fun-at-beach-summertime-video.jpg" 
              alt="Scenario" 
              className="rounded-2xl shadow-2xl border-4 border-blue-800"
            />
          </div>
        </div>
        {/* Decorative Circles */}
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute bottom-[-20%] right-[-5%] w-96 h-96 bg-white/5 rounded-full" />
      </div>
    </div>
  );
};

export default Senses;
