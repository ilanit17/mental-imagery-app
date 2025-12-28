
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GradeLevel, WorksheetData, DiscoveryQuestion, WordImageMatchExercise, AppTab, ComprehensionQuestion } from '../types';
import { generateWorksheetFromText, refineWorksheet, generateMentalImage, generateSpeech, VoiceName, generateAtmosphereExercises } from '../services/geminiService';
import { AtmosphereAnalysis } from '../types/atmosphere.types';
import { AtmosphereExerciseList } from './atmosphere/AtmosphereExerciseList';
import { printWorksheet, downloadWorksheetAsDoc, exportCombinedHTML, createWavBlob } from '../services/printService';
import { 
  FileText, Loader2, Printer, Wand2, Eraser, UserCog, Bot, AlertCircle, RefreshCw, 
  Sparkles, ImageIcon, Type as TypeIcon, Heart, Send, X, Trash2, History, 
  BookmarkCheck, BookOpen, Download, Eye, Volume2, Wind, Utensils, Hand, Highlighter,
  FileDown, Plus, Calendar, ChevronLeft, Save, Upload, FileCode, ArrowRightLeft,
  ChevronDown, HelpCircle, Mic2, User, UserCircle, Settings2, CheckCircle2, ArrowRight
} from 'lucide-react';

const STORAGE_KEY = 'mental_imagery_saved_worksheets';

interface SavedWorksheet {
  id: string;
  timestamp: number;
  data: WorksheetData;
}

const VOICE_OPTIONS: { id: VoiceName; label: string; gender: 'אישה' | 'גבר' }[] = [
  { id: 'Kore', label: 'קורה', gender: 'אישה' },
  { id: 'Zephyr', label: 'זפיר', gender: 'גבר' },
  { id: 'Puck', label: 'פאק', gender: 'גבר' },
  { id: 'Charon', label: 'כארון', gender: 'גבר' },
  { id: 'Fenrir', label: 'פנריר', gender: 'גבר' },
];

const getSenseIcon = (sense: string) => {
  switch (sense) {
    case 'sight': return <Eye size={18} />;
    case 'hearing': return < Volume2 size={18} />;
    case 'smell': return <Wind size={18} />;
    case 'touch': return <Hand size={18} />;
    case 'taste': return <Utensils size={18} />;
    case 'feeling': return <Heart size={18} />;
    default: return <Sparkles size={18} />;
  }
};

const getSenseLabel = (sense: string) => {
  switch (sense) {
    case 'sight': return 'ראייה';
    case 'hearing': return 'שמיעה';
    case 'smell': return 'ריח';
    case 'touch': return 'מגע';
    case 'taste': return 'טעם';
    case 'feeling': return 'רגש';
    default: return 'חושים';
  }
};

const getDimensionLabel = (dimension: string) => {
  switch (dimension) {
    case 'literal': return 'איתור מידע (גלוי)';
    case 'inferential': return 'פרשנות והסקה (סמוי)';
    case 'global': return 'הבנה גלובלית';
    case 'evaluative': return 'הערכה וביקורת';
    default: return 'ממד הבנה';
  }
};

interface TeacherHubProps {
  gradeLevel: GradeLevel;
  useNikud: boolean;
  onNikudToggle?: (v: boolean) => void;
  lastText?: string;
  onBackToApp?: () => void;
}

const TeacherHub: React.FC<TeacherHubProps> = ({ gradeLevel, useNikud, onNikudToggle, lastText, onBackToApp }) => {
  const [inputText, setInputText] = useState(lastText || '');
  const [worksheet, setWorksheet] = useState<WorksheetData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRefiner, setShowRefiner] = useState(false);
  const [refineInput, setRefineInput] = useState('');
  const [refining, setRefining] = useState(false);
  const [savedWorksheets, setSavedWorksheets] = useState<SavedWorksheet[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [atmosphereAnalysis, setAtmosphereAnalysis] = useState<AtmosphereAnalysis | null>(null);
  const [generatingAtmosphere, setGeneratingAtmosphere] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'content' | 'images' | 'audio' | 'atmosphere'>('content');
  const [imageLoadingWord, setImageLoadingWord] = useState<string | null>(null);
  
  // Audio states for export
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>('Kore');
  const [generatingAudio, setGeneratingAudio] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) { try { setSavedWorksheets(JSON.parse(stored)); } catch (e) {} }
  }, []);

  // Update input if lastText changes from outside
  useEffect(() => {
    if (lastText && !inputText) {
      setInputText(lastText);
    }
  }, [lastText]);

  const handleGenerateAudio = async () => {
    if (!worksheet) return;
    setGeneratingAudio(true);
    try {
      const pcmBase64 = await generateSpeech(worksheet.originalText, selectedVoice);
      if (pcmBase64) {
        const wavDataUri = createWavBlob(pcmBase64);
        setAudioBase64(wavDataUri);
      }
    } catch (e) {
      alert("שגיאה בהפקת אודיו.");
    } finally {
      setGeneratingAudio(false);
    }
  };

  const handleGenerateImage = async (phrase: string) => {
    if (!worksheet) return;
    setImageLoadingWord(phrase);
    try {
      const url = await generateMentalImage(phrase);
      if (url) {
        setWorksheet(prev => {
          if (!prev) return null;
          return { ...prev, wordImageMatches: [...prev.wordImageMatches, { phrase, description: phrase, url }] };
        });
      }
    } catch (err) {} finally { setImageLoadingWord(null); }
  };

  const saveToLocal = () => {
    if (!worksheet) return;
    const newSavedItem: SavedWorksheet = { id: Date.now().toString(), timestamp: Date.now(), data: worksheet };
    const updatedList = [newSavedItem, ...savedWorksheets];
    setSavedWorksheets(updatedList);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const saveProjectAsFile = () => {
    if (!worksheet) return;
    const projectData = JSON.stringify(worksheet, null, 2);
    const blob = new Blob([projectData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `project_${worksheet.title.replace(/\s+/g, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerate = async (text?: string) => {
    const textToUse = text || inputText;
    if (!textToUse.trim()) return;
    setLoading(true);
    try {
      if (text && text !== inputText) {
        setInputText(text);
      }
      const data = await generateWorksheetFromText(textToUse, gradeLevel, useNikud);
      setWorksheet(data);
      setAudioBase64(null);
      setActiveTab('content');
    } catch (e) { alert("שגיאה ביצירת דף העבודה."); } finally { setLoading(false); }
  };

  const handleRefine = async () => {
    if (!refineInput.trim() || !worksheet) return;
    setRefining(true);
    try {
      const updated = await refineWorksheet(worksheet, refineInput, gradeLevel, useNikud);
      setWorksheet(updated);
      setShowRefiner(false);
      setRefineInput('');
      setAudioBase64(null); // Reset audio since text changed
    } catch (e) { alert("שגיאה בעדכון."); } finally { setRefining(false); }
  };

  const handleGenerateAtmosphereExercises = async () => {
    if (!worksheet) return;
    setGeneratingAtmosphere(true);
    try {
      const analysis = await generateAtmosphereExercises(
        worksheet.originalText,
        gradeLevel,
        useNikud
      );
      setAtmosphereAnalysis(analysis);
      setActiveTab('atmosphere');
    } catch (e) {
      alert("שגיאה ביצירת תרגילי האווירה.");
    } finally {
      setGeneratingAtmosphere(false);
    }
  };

  return (
    <div className="py-6 relative">
      <div className="no-print space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-2xl text-purple-600 shadow-sm"><UserCog size={32} /></div>
            <div>
              <h2 className="text-3xl font-black text-slate-800">מרחב המורה</h2>
              <p className="text-slate-500 font-medium italic text-sm">ניהול, יצירה וייצוא של יחידות לימוד.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {onBackToApp && <button onClick={onBackToApp} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-2"><ChevronLeft size={16} /> חזרה</button>}
            <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-xs flex items-center gap-2"><Upload size={16} /> טען פרויקט</button>
            <input type="file" ref={fileInputRef} onChange={e => {
               const file = e.target.files?.[0]; if (!file) return;
               const reader = new FileReader();
               reader.onload = (event) => { try { const data = JSON.parse(event.target?.result as string); setWorksheet(data); setInputText(data.originalText); setActiveTab('content'); } catch (err) { alert("קובץ לא תקין"); } };
               reader.readAsText(file);
            }} className="hidden" accept=".json" />
            <button onClick={() => setShowLibrary(!showLibrary)} className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${showLibrary ? 'bg-purple-600 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-200'}`}><History size={16} /> ספריית דפים</button>
          </div>
        </div>

        {!worksheet ? (
          <div className="space-y-6">
            {lastText && lastText.trim() ? (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-[2.5rem] shadow-xl p-8 border-2 border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-500 p-3 rounded-2xl text-white shadow-lg">
                    <Sparkles size={24} />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-2xl font-black text-blue-900 mb-1">צור דף עבודה מהטקסט של המעבדה</h3>
                    <p className="text-blue-700 font-medium text-sm">הטקסט שנוצר במעבדת הקראה מוכן ליצירת משימות</p>
                  </div>
                </div>
                <div className="bg-white/80 p-6 rounded-2xl border border-blue-100 mb-6">
                  <p className="text-slate-700 text-lg leading-relaxed line-clamp-4 italic">{lastText}</p>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleGenerate(lastText)}
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-3xl shadow-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <><Wand2 size={24} /> צור דף עבודה מהטקסט הזה</>}
                  </button>
                  <button 
                    onClick={() => setInputText('')}
                    className="px-6 py-5 bg-white border-2 border-slate-200 text-slate-600 rounded-3xl font-bold hover:bg-slate-50 transition-colors"
                  >
                    טקסט חדש
                  </button>
                  <button 
                    onClick={() => onNikudToggle?.(!useNikud)} 
                    className={`px-4 py-5 rounded-3xl border-2 font-bold text-xs ${useNikud ? 'bg-orange-500 border-orange-400 text-white' : 'bg-white border-slate-200 text-slate-400'}`}
                  >
                    ניקוד: {useNikud ? 'כן' : 'לא'}
                  </button>
                </div>
              </div>
            ) : null}
            
            <div className="bg-white rounded-[2.5rem] shadow-xl p-8 border border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <label className="text-xl font-bold text-slate-700 flex items-center gap-2">
                  <FileText className="text-purple-500" />
                  {lastText && lastText.trim() ? 'או הדביקו טקסט חדש:' : 'הדביקו טקסט חדש:'}
                </label>
                <div className="flex items-center gap-2">
                  <button onClick={() => onNikudToggle?.(!useNikud)} className={`px-4 py-1.5 rounded-lg border-2 font-bold text-[10px] ${useNikud ? 'bg-orange-500 border-orange-400 text-white' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>ניקוד: {useNikud ? 'כן' : 'לא'}</button>
                </div>
              </div>
              <textarea 
                className="w-full h-64 p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl outline-none text-lg" 
                value={inputText} 
                onChange={e => setInputText(e.target.value)} 
                placeholder="הזינו טקסט..." 
              />
              <button 
                onClick={handleGenerate} 
                disabled={loading || !inputText.trim()} 
                className="w-full mt-6 bg-purple-600 text-white font-black py-5 rounded-3xl shadow-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <><Wand2 size={24} /> צור דף עבודה</>}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <button onClick={() => printWorksheet(worksheet, { useNikud, gradeLevel, audioBase64: audioBase64 || undefined })} className="bg-blue-600 text-white font-black py-2.5 px-6 rounded-xl flex items-center gap-2 text-xs"><Printer size={18}/> הדפסה</button>
              <button onClick={() => exportCombinedHTML(worksheet, { useNikud, gradeLevel, audioBase64: audioBase64 || undefined })} className="bg-green-600 text-white font-black py-2.5 px-6 rounded-xl flex items-center gap-2 text-xs"><FileCode size={18}/> ייצוא HTML {audioBase64 ? '(כולל אודיו)' : ''}</button>
              <button onClick={() => downloadWorksheetAsDoc(worksheet, { useNikud, gradeLevel })} className="bg-slate-700 text-white font-black py-2.5 px-6 rounded-xl flex items-center gap-2 text-xs"><FileDown size={18}/> הורדה ל-Word</button>
              <button onClick={saveProjectAsFile} className="bg-slate-800 text-white font-black py-2.5 px-6 rounded-xl flex items-center gap-2 text-xs"><Save size={18}/> שמור קובץ פרויקט (JSON)</button>
              <button onClick={() => setShowRefiner(true)} className="bg-orange-500 text-white font-black py-2.5 px-6 rounded-xl flex items-center gap-2 text-xs"><Bot size={18}/> דייק עם AI</button>
              <button onClick={handleGenerateAtmosphereExercises} disabled={generatingAtmosphere} className="bg-indigo-600 text-white font-black py-2.5 px-6 rounded-xl flex items-center gap-2 text-xs disabled:opacity-50"><Sparkles size={18}/> {generatingAtmosphere ? 'יוצר...' : 'צור תרגילי אווירה'}</button>
              <button onClick={saveToLocal} className={`font-black py-2.5 px-6 rounded-xl flex items-center gap-2 text-xs ${isSaved ? 'bg-green-500 text-white' : 'bg-pink-600 text-white'}`}>{isSaved ? <BookmarkCheck size={18} /> : <Heart size={18} />} {isSaved ? 'נשמר!' : 'שמור בספרייה'}</button>
              <button onClick={() => setWorksheet(null)} className="bg-slate-100 text-slate-500 font-black py-2.5 px-6 rounded-xl flex items-center gap-2 mr-auto text-xs"><Eraser size={18}/> חזרה</button>
            </div>

            <div className="bg-white p-2 rounded-2xl border border-slate-100 flex gap-2 w-fit">
              <button onClick={() => setActiveTab('content')} className={`px-6 py-2 rounded-xl font-black text-xs transition-all ${activeTab === 'content' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>ניהול תוכן</button>
              <button onClick={() => setActiveTab('images')} className={`px-6 py-2 rounded-xl font-black text-xs transition-all ${activeTab === 'images' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>איורים</button>
              <button onClick={() => setActiveTab('audio')} className={`px-6 py-2 rounded-xl font-black text-xs transition-all ${activeTab === 'audio' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>מעבדת קול לייצוא</button>
              {atmosphereAnalysis && (
                <button onClick={() => setActiveTab('atmosphere')} className={`px-6 py-2 rounded-xl font-black text-xs transition-all ${activeTab === 'atmosphere' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>תרגילי אווירה</button>
              )}
            </div>
            
            {/* Tabs content remains the same... */}
            {activeTab === 'audio' && (
              <div className="animate-fadeIn space-y-6">
                <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-grow">
                    <h3 className="text-xl font-black text-blue-900 mb-2 flex items-center gap-2"><Mic2 /> מעבדת קריינות</h3>
                    <p className="text-blue-800 text-sm font-medium">הפיקו קריינות לטקסט כדי להטמיע אותה בקובץ ה-HTML שתשלחו לתלמידים.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {VOICE_OPTIONS.map(v => (
                      <button 
                        key={v.id} 
                        onClick={() => setSelectedVoice(v.id)} 
                        className={`px-4 py-2 rounded-xl border-2 transition-all font-bold text-xs flex items-center gap-2 ${selectedVoice === v.id ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'}`}
                      >
                        {v.gender === 'אישה' ? <User size={14}/> : <UserCircle size={14}/>}
                        {v.label}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={handleGenerateAudio} 
                    disabled={generatingAudio} 
                    className="bg-orange-500 hover:bg-orange-600 text-white font-black py-3 px-8 rounded-2xl shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {generatingAudio ? <Loader2 className="animate-spin" /> : <><Sparkles /> הפק קריינות</>}
                  </button>
                </div>

                {audioBase64 && (
                  <div className="bg-white p-6 rounded-[2rem] border-2 border-green-100 shadow-sm animate-fadeIn">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-black text-green-700 flex items-center gap-2"><CheckCircle2 size={20}/> הקריינות מוכנה!</h4>
                      <button onClick={() => setAudioBase64(null)} className="text-slate-400 hover:text-red-500"><Trash2 size={18}/></button>
                    </div>
                    <audio controls src={audioBase64} className="w-full" />
                    <p className="mt-4 text-[10px] text-slate-500 font-bold">* כעת, בלחיצה על "ייצוא HTML" האודיו יוטמע אוטומטית בתוך הקובץ.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'images' && (
              <div className="animate-fadeIn space-y-6">
                <div className="flex flex-wrap gap-2">
                  {worksheet.suggestedVisualKeywords.map(phrase => {
                    const hasImage = worksheet.wordImageMatches.some(i => i.phrase === phrase);
                    const isGenerating = imageLoadingWord === phrase;
                    return (
                      <button key={phrase} disabled={hasImage || isGenerating} onClick={() => handleGenerateImage(phrase)} className={`px-3 py-1.5 rounded-xl border text-[10px] transition-all flex items-center gap-2 font-bold ${hasImage ? 'bg-purple-100 text-purple-700 border-purple-200' : isGenerating ? 'bg-slate-100 border-slate-200 animate-pulse text-slate-400' : 'bg-white border-slate-200 text-slate-600 shadow-sm'}`}>
                        {phrase} {isGenerating ? <Loader2 size={12} className="animate-spin" /> : hasImage ? <Sparkles size={12} /> : <Plus size={12} />}
                      </button>
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {worksheet.wordImageMatches.map((img, i) => (
                    <div key={i} className="bg-white p-2 rounded-xl border text-center group relative shadow-sm">
                      <img src={img.url} className="w-full aspect-square object-cover rounded-lg mb-2" />
                      <span className="text-[10px] font-bold text-slate-500">{img.phrase}</span>
                      <button onClick={() => setWorksheet({...worksheet, wordImageMatches: worksheet.wordImageMatches.filter((_,idx)=>idx!==i)})} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100"><Trash2 size={10} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div id="screen-worksheet" className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 animate-fadeIn" dir="rtl">
                <div className="text-center border-b-4 border-slate-900 pb-8 mb-12">
                  <h1 className="text-4xl font-black mb-4 text-blue-900">{worksheet.title}</h1>
                  <div className="flex justify-center gap-8 text-slate-400 font-bold text-sm"><span>שם: _________</span><span>כיתה: _____</span><span>תאריך: _____</span></div>
                </div>
                <section className="mb-16">
                  <div className="flex items-center gap-3 mb-6 bg-slate-800 text-white inline-flex px-4 py-2 rounded-xl"><BookOpen size={20} /><h3 className="text-xl font-black">קראו ודמיינו:</h3></div>
                  <div className="p-10 bg-slate-50 rounded-[2.5rem] text-2xl italic border border-slate-100 shadow-inner">{worksheet.originalText}</div>
                </section>
                {/* Simplified content view for screen... */}
              </div>
            )}

            {activeTab === 'atmosphere' && atmosphereAnalysis && (
              <div className="animate-fadeIn">
                <AtmosphereExerciseList
                  analysis={atmosphereAnalysis}
                  onComplete={(results) => {
                    console.log('תרגילי אווירה הושלמו:', results);
                    // ניתן להוסיף כאן שמירה או פעולות נוספות
                  }}
                  showHints={true}
                  gradeLevel={gradeLevel}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {showRefiner && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-10">
             <div className="flex justify-between mb-6"><h3 className="text-2xl font-black">דייק את הדף</h3><button onClick={() => setShowRefiner(false)}><X /></button></div>
             <textarea className="w-full h-32 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl mb-8 outline-none" value={refineInput} onChange={e => setRefineInput(e.target.value)} placeholder="מה לשנות?" />
             <button onClick={handleRefine} disabled={refining} className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2">{refining ? <Loader2 className="animate-spin" /> : <><Send size={18} /> עדכן עכשיו</>}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherHub;
