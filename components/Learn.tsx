
import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Lightbulb, Zap, Smile, Eye, Volume2, Wind, Utensils, Hand, Sparkles, Film, Plus, Loader2, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { generateExampleWithSenses, generateMentalImage } from '../services/geminiService';
import { GradeLevel } from '../types';

interface LearnProps {
  gradeLevel: GradeLevel;
  useNikud: boolean;
}

const initialExamples = [
  {
    id: 1,
    title: "הביקור במאפייה",
    text: "נכנסתי למאפייה הקטנה. המדפים היו מלאים בלחמים חומים וזהובים. ריח חזק של שמרים וקינמון מילא את האוויר. שמעתי את צלצול הפעמון בדלת ואת הרשרוש של שקיות הנייר.",
    visualText: "כשקוראים את זה, אפשר ממש לראות את הצבע הזהוב של הלחם ולחוש את החום שיוצא מהתנור.",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop",
    senses: [
      { iconType: 'sight', label: "לחמים זהובים", color: "text-red-500" },
      { iconType: 'smell', label: "ריח קינמון", color: "text-green-500" },
      { iconType: 'hearing', label: "צלצול פעמון", color: "text-blue-500" }
    ]
  },
  {
    id: 2,
    title: "סערה בים",
    text: "הגלים התנפצו בעוצמה על הסלעים השחורים. רסיסי מים קרים פגעו בפנים שלי והיו להם טעם מלוח. השמים הפכו אפורים וכהים, ורוח חזקה שרקה באוזניים.",
    visualText: "הסרט בראש הופך למותח: מרגישים את הקור של המים ואת המליחות על הלשון.",
    image: "https://images.unsplash.com/photo-1439405326854-01517489c73e?q=80&w=800&auto=format&fit=crop",
    senses: [
      { iconType: 'touch', label: "מים קרים", color: "text-purple-500" },
      { iconType: 'taste', label: "טעם מלוח", color: "text-orange-500" },
      { iconType: 'hearing', label: "רוח שורקת", color: "text-blue-500" }
    ]
  }
];

const slides = [
  {
    title: "?מה זה בכלל",
    content: "הדמיה היא היכולת לראות את הרעיונות שעליהם אתם חושבים בתוך הראש שלכם. זהו תהליך שבו המוח מתרגם מילים לתמונות חיות.",
    icon: <Lightbulb className="text-orange-500" size={48} />,
    color: "bg-orange-50",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "למה זה עוזר?",
    content: "כאשר אנחנו מדמיינים את הטקסט ויוצרים לו תמונה בראש, אנחנו מצליחים להעמיק את הבנת הנקרא שלנו. זה עוזר להבין מושגים חדשים, מורכבים ושאינכם מכירים.",
    icon: <Zap className="text-blue-500" size={48} />,
    color: "bg-blue-50",
    image: "https://images.unsplash.com/photo-1497011034435-0eeea360698d?q=80&w=800&auto=format&fit=crop"
  }
];

const getSenseIcon = (type: string) => {
  switch (type) {
    case 'sight': return <Eye size={16} />;
    case 'smell': return <Wind size={16} />;
    case 'hearing': return <Volume2 size={16} />;
    case 'touch': return <Hand size={16} />;
    case 'taste': return <Utensils size={16} />;
    default: return <Sparkles size={16} />;
  }
};

const ExampleCard: React.FC<{ ex: any, isActive: boolean, onClick: () => void }> = ({ ex, isActive, onClick }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(ex.image || null);
  const [imageLoading, setImageLoading] = useState(!ex.image && ex.imageDescription);

  useEffect(() => {
    if (!imageUrl && ex.imageDescription) {
      const fetchImage = async () => {
        try {
          const url = await generateMentalImage(ex.imageDescription);
          setImageUrl(url);
        } catch (e) {
          console.error("Image gen failed", e);
        } finally {
          setImageLoading(false);
        }
      };
      fetchImage();
    }
  }, [ex.imageDescription]);

  return (
    <div 
      onClick={onClick}
      className={`group cursor-pointer bg-white rounded-[2.5rem] border-2 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-2xl flex flex-col ${
        isActive ? 'border-blue-500 ring-4 ring-blue-50 scale-[1.02]' : 'border-slate-100'
      }`}
    >
      <div className="aspect-[4/3] overflow-hidden relative bg-slate-100">
        {imageLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-blue-500 gap-3">
            <Loader2 className="animate-spin" size={32} />
            <span className="text-[10px] font-black animate-pulse">מצייר את הסרט בראש...</span>
          </div>
        ) : imageUrl ? (
          <img 
            src={imageUrl} 
            alt={ex.title} 
            className={`w-full h-full object-cover transition-transform duration-700 ${isActive ? 'scale-110' : 'scale-100 grayscale-[40%] group-hover:grayscale-0'}`} 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
            <ImageIcon size={32} className="mb-2 opacity-20" />
            <span className="text-[10px] font-bold">הדמיון עובד שעות נוספות... נסו שוב מאוחר יותר.</span>
          </div>
        )}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-xl text-xs font-black text-slate-800 shadow-sm border border-slate-200">
          {ex.title}
        </div>
      </div>
      
      <div className="p-6 space-y-4 flex-grow flex flex-col">
        <p className={`text-slate-700 font-medium leading-relaxed transition-all ${isActive ? 'text-sm' : 'line-clamp-3 text-sm opacity-80'}`}>
          {ex.text}
        </p>

        {isActive && (
          <div className="space-y-4 animate-slideUp mt-auto">
            <div className="h-px bg-slate-100 w-full" />
            <div className="flex flex-wrap gap-2">
              {ex.senses.map((s: any, idx: number) => (
                <div key={idx} className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
                  <span className={s.color}>{getSenseIcon(s.iconType)}</span>
                  <span className="text-[10px] font-black text-slate-600">{s.label}</span>
                </div>
              ))}
            </div>
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 shadow-inner">
              <p className="text-xs font-bold text-blue-900 leading-tight">
                <Sparkles size={14} className="inline mr-1 text-orange-400" />
                {ex.visualText}
              </p>
            </div>
          </div>
        )}

        {!isActive && (
          <div className="mt-auto flex justify-center text-blue-500 font-black text-xs group-hover:translate-x-[-4px] transition-transform">
            לחצו לראות את הסרט...
          </div>
        )}
      </div>
    </div>
  );
};

const SlideImage: React.FC<{ src: string, alt: string }> = ({ src, alt }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  return (
    <div className="w-full h-full bg-slate-200 flex items-center justify-center overflow-hidden">
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      )}
      {error ? (
        <div className="flex flex-col items-center justify-center text-slate-400 p-8 text-center gap-4">
          <ImageIcon size={64} className="opacity-20" />
          <p className="text-sm font-bold leading-tight">לא הצלחנו לטעון את התמונה,<br/>אבל אתם יכולים לדמיין אותה!</p>
        </div>
      ) : (
        <img 
          src={src} 
          alt={alt} 
          className={`w-full h-full object-cover transition-opacity duration-500 ${loading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setLoading(false)}
          onError={() => { setError(true); setLoading(false); }}
        />
      )}
    </div>
  );
};

const Learn: React.FC<LearnProps> = ({ gradeLevel, useNikud }) => {
  const [current, setCurrent] = useState(0);
  const [activeExample, setActiveExample] = useState<number | null>(null);
  const [examples, setExamples] = useState<any[]>(initialExamples);
  const [isGenerating, setIsGenerating] = useState(false);

  const next = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  const handleAddNewExample = async () => {
    setIsGenerating(true);
    try {
      const newExampleData = await generateExampleWithSenses(gradeLevel, useNikud);
      const newExample = {
        ...newExampleData,
        id: Date.now(),
        image: null 
      };
      setExamples(prev => [newExample, ...prev]);
      setActiveExample(newExample.id);
    } catch (e) {
      console.error(e);
      alert("חלה שגיאה ביצירת דוגמה חדשה. המערכת עמוסה, נסו שוב בעוד רגע.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-24">
      {/* Intro Slider */}
      <section>
        <div className={`${slides[current].color} rounded-[3rem] p-8 md:p-12 shadow-xl border-4 border-white flex flex-col md:flex-row gap-8 items-center transition-all duration-500 min-h-[500px]`}>
          <div className="flex-1 space-y-6">
            <div className="inline-block p-4 bg-white rounded-2xl shadow-sm mb-4">
              {slides[current].icon}
            </div>
            <h2 className="text-4xl font-black text-blue-900">{slides[current].title}</h2>
            <p className="text-xl text-slate-700 leading-relaxed font-medium">
              {slides[current].content}
            </p>
          </div>
          <div className="flex-1 w-full h-[300px] md:h-[400px] rounded-[2.5rem] overflow-hidden shadow-lg border-4 border-white relative">
            <SlideImage 
              src={slides[current].image} 
              alt={slides[current].title} 
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-10">
          <button 
            onClick={prev}
            className="p-4 bg-white border border-slate-200 rounded-full hover:bg-slate-100 transition-colors shadow-sm"
          >
            <ChevronRight size={32} />
          </button>
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <div 
                key={i} 
                className={`h-3 rounded-full transition-all duration-300 ${i === current ? 'w-12 bg-blue-600' : 'w-3 bg-slate-300'}`}
              />
            ))}
          </div>
          <button 
            onClick={next}
            className="p-4 bg-white border border-slate-200 rounded-full hover:bg-slate-100 transition-colors shadow-sm"
          >
            <ChevronLeft size={32} />
          </button>
        </div>
      </section>

      {/* Examples Gallery */}
      <section className="animate-fadeIn">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-12">
          <div className="text-right">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-black text-sm mb-4">
              <Film size={18} />
              <span>איך טקסט הופך לסרט?</span>
            </div>
            <h2 className="text-4xl font-black text-slate-800">גלריית הדוגמאות</h2>
            <p className="text-xl text-slate-500 max-w-2xl mt-4 leading-relaxed">
              לחצו על סיפור כדי לראות איך הדמיון שלנו משתמש בחושים כדי ליצור תמונה מנצחת. תוכלו גם ליצור דוגמאות חדשות בעצמכם!
            </p>
          </div>
          <button 
            onClick={handleAddNewExample}
            disabled={isGenerating}
            className="bg-orange-500 hover:bg-orange-600 text-white font-black py-4 px-8 rounded-2xl shadow-lg flex items-center gap-3 transition-all transform hover:-translate-y-1 disabled:opacity-50 active:scale-95 whitespace-nowrap"
          >
            {isGenerating ? <Loader2 size={24} className="animate-spin" /> : <Plus size={24} />}
            <span>צור דוגמה חדשה עם AI</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {examples.map((ex) => (
            <ExampleCard 
              key={ex.id}
              ex={ex}
              isActive={activeExample === ex.id}
              onClick={() => setActiveExample(activeExample === ex.id ? null : ex.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Learn;
