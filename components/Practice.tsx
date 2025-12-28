
import React, { useState, useRef, useEffect } from 'react';
import { 
  generatePracticeScenario, 
  analyzeExistingTextForPractice, 
  generateSpeech,
  VoiceName 
} from '../services/geminiService';
import { GradeLevel, PracticeScenario } from '../types';
import { AtmosphereType } from '../types/atmosphere.types';
import { AtmosphereSelector } from './atmosphere/AtmosphereSelector';
import { 
  Sparkles, Loader2, BookOpen, RotateCcw, 
  Square, Settings2, FileText, Tv, Mic2, ArrowLeft,
  User, UserCircle, UserCog
} from 'lucide-react';

interface PracticeProps {
  gradeLevel: GradeLevel;
  useNikud: boolean;
  onScenarioCreated?: (text: string) => void;
  onEditInTeacherHub?: (text: string) => void;
}

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

const VOICE_OPTIONS: { id: VoiceName; label: string; desc: string; gender: 'אישה' | 'גבר' }[] = [
  { id: 'Kore', label: 'קורה', desc: 'קול רך ומרגיע', gender: 'אישה' },
  { id: 'Zephyr', label: 'זפיר', desc: 'קול נקי ומאוזן', gender: 'גבר' },
  { id: 'Puck', label: 'פאק', desc: 'קול שובב ומלא חיוניות', gender: 'גבר' },
  { id: 'Charon', label: 'כארון', desc: 'קול יציב וסמכותי', gender: 'גבר' },
  { id: 'Fenrir', label: 'פנריר', desc: 'קול עמוק ומרשים', gender: 'גבר' },
];

const Practice: React.FC<PracticeProps> = ({ gradeLevel, useNikud, onScenarioCreated, onEditInTeacherHub }) => {
  const [mode, setMode] = useState<'topic' | 'manual'>('topic');
  const [topic, setTopic] = useState('');
  const [manualText, setManualText] = useState('');
  const [scenario, setScenario] = useState<PracticeScenario | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceName, setVoiceName] = useState<VoiceName>('Kore');
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  const [selectedAtmosphere, setSelectedAtmosphere] = useState<AtmosphereType | undefined>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => { return () => stopAudio(); }, []);

  const handleStartPractice = async (input: string, isManualText = false) => {
    setIsLoading(true);
    try {
      const data = isManualText 
        ? await analyzeExistingTextForPractice(input, gradeLevel, useNikud)
        : await generatePracticeScenario(input, gradeLevel, useNikud, selectedAtmosphere);
      setScenario(data);
      onScenarioCreated?.(data.text);
    } catch (e) {
      alert("חלה שגיאה ביצירת הטקסט. נסו שוב.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = async () => {
    if (isPlaying) { stopAudio(); return; }
    setIsAudioLoading(true);
    try {
      const base64Audio = await generateSpeech(scenario!.text, voiceName);
      if (!base64Audio) { alert("לא ניתן להפיק אודיו כרגע."); return; }
      if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), audioContextRef.current, 24000, 1);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsPlaying(false);
      source.start();
      sourceNodeRef.current = source;
      setIsPlaying(true);
      setShowAudioSettings(false);
    } catch (e) { console.error("Audio Playback Error:", e); } finally { setIsAudioLoading(false); }
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) { try { sourceNodeRef.current.stop(); } catch (e) {} sourceNodeRef.current = null; }
    setIsPlaying(false);
  };

  const reset = () => {
    setTopic(''); setManualText(''); setScenario(null); setSelectedAtmosphere(undefined);
    stopAudio();
  };

  const handleAtmosphereSelect = (atmosphere: AtmosphereType | 'random') => {
    if (atmosphere === 'random') {
      const types: AtmosphereType[] = ['tension', 'anticipation', 'sadness', 'calm', 'joy', 'festive', 'excitement'];
      const random = types[Math.floor(Math.random() * types.length)];
      setSelectedAtmosphere(random);
    } else {
      setSelectedAtmosphere(atmosphere);
    }
  };

  return (
    <div className="py-6 max-w-4xl mx-auto animate-fadeIn">
      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 min-h-[500px] flex flex-col">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-8 text-white flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black flex items-center gap-3"><Tv className="text-orange-400" /> מעבדת הקראה והדמיה</h2>
            <p className="opacity-80 font-medium italic">הקשיבו לטקסט וצרו סרט בראשכם</p>
          </div>
          {scenario && <button onClick={reset} className="p-3 hover:bg-white/10 rounded-full transition-colors"><RotateCcw size={24} /></button>}
        </div>

        <div className="p-8 md:p-12 flex-grow">
          {!scenario ? (
            <div className="space-y-10 animate-fadeIn">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-black text-slate-800">מה נרצה להקריא היום?</h3>
                <p className="text-slate-500 font-medium">הזינו נושא ל-AI או הדביקו טקסט משלכם.</p>
              </div>

              <div className="flex flex-wrap justify-center bg-slate-100 p-2 rounded-2xl w-fit mx-auto border border-slate-200 gap-1">
                <button onClick={() => setMode('topic')} className={`px-10 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${mode === 'topic' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
                  <Sparkles size={18} /> נושא ל-AI
                </button>
                <button onClick={() => setMode('manual')} className={`px-10 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${mode === 'manual' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
                  <FileText size={18} /> טקסט משלי
                </button>
              </div>

              {mode === 'topic' ? (
                <div className="space-y-6 max-w-2xl mx-auto py-4 animate-fadeIn">
                  <input 
                    type="text" 
                    value={topic} 
                    onChange={(e) => setTopic(e.target.value)} 
                    placeholder="למשל: יער קסום עם פטריות זוהרות..." 
                    className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl text-center text-xl font-bold focus:border-blue-500 outline-none" 
                  />
                  <AtmosphereSelector
                    selectedAtmosphere={selectedAtmosphere}
                    onSelect={handleAtmosphereSelect}
                    allowRandom={true}
                  />
                  <button onClick={() => handleStartPractice(topic)} disabled={isLoading || !topic.trim()} className="w-full bg-blue-600 text-white font-black py-5 rounded-3xl shadow-xl flex items-center justify-center gap-3 text-xl transition-all hover:bg-blue-700">
                    {isLoading ? <Loader2 className="animate-spin" /> : <><Sparkles size={24} /> צור טקסט</>}
                  </button>
                </div>
              ) : (
                <div className="space-y-6 max-w-2xl mx-auto py-4 animate-fadeIn">
                  <textarea 
                    value={manualText} 
                    onChange={(e) => setManualText(e.target.value)} 
                    placeholder="הדביקו כאן את הטקסט שתרצו להקריא..." 
                    rows={8} 
                    className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl text-lg font-medium focus:border-blue-500 outline-none leading-relaxed" 
                  />
                  <button onClick={() => handleStartPractice(manualText, true)} disabled={isLoading || !manualText.trim()} className="w-full bg-blue-600 text-white font-black py-5 rounded-3xl shadow-xl flex items-center justify-center gap-3 text-xl transition-all hover:bg-blue-700">
                    {isLoading ? <Loader2 className="animate-spin" /> : <><FileText size={24} /> טען טקסט זה</>}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-10 animate-fadeIn">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-r-4 border-blue-500 pr-4">
                <h3 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-3">
                  <BookOpen className="text-blue-500" />
                  קראו והקשיבו לטקסט
                </h3>
                <div className="flex items-center gap-2 relative">
                  <button 
                    onClick={() => setShowAudioSettings(!showAudioSettings)} 
                    className={`p-2 rounded-xl transition-all ${showAudioSettings ? 'bg-blue-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                  >
                    <Settings2 size={24}/>
                  </button>
                  <button 
                    onClick={handlePlayAudio} 
                    disabled={isAudioLoading} 
                    className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-bold shadow-lg transition-all ${isPlaying ? 'bg-orange-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                  >
                    {isAudioLoading ? <Loader2 className="animate-spin" size={20} /> : isPlaying ? <Square size={20} /> : <Mic2 size={20} />} 
                    <span>{isPlaying ? 'עצור' : 'הקרא לי'}</span>
                  </button>
                  
                  {showAudioSettings && (
                    <div className="absolute top-full mt-3 left-0 z-[100] bg-white border border-slate-200 shadow-2xl p-6 rounded-[2rem] w-80 animate-slideDown overflow-hidden">
                      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                         <h4 className="font-black text-slate-800">בחירת קול דובר</h4>
                         <Settings2 size={16} className="text-slate-400" />
                      </div>
                      <div className="space-y-2 max-h-72 overflow-y-auto">
                        {VOICE_OPTIONS.map(v => (
                          <button 
                            key={v.id} 
                            onClick={() => { setVoiceName(v.id); setShowAudioSettings(false); stopAudio(); }} 
                            className={`w-full p-4 text-right rounded-2xl border-2 transition-all flex items-start gap-3 ${voiceName === v.id ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-sm' : 'border-slate-50 bg-slate-50 hover:bg-white hover:border-slate-200'}`}
                          >
                            <div className={`p-2 rounded-full ${voiceName === v.id ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                               {v.gender === 'אישה' ? <User size={18}/> : <UserCircle size={18}/>}
                            </div>
                            <div className="flex-grow">
                              <div className="flex items-center justify-between">
                                <span className="font-black text-sm">{v.label}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${v.gender === 'אישה' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>{v.gender}</span>
                              </div>
                              <span className="text-[10px] opacity-70 font-medium block mt-1">{v.desc}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-orange-50 p-10 rounded-[2.5rem] border-2 border-orange-100 text-2xl md:text-3xl text-slate-800 leading-relaxed font-medium italic relative shadow-inner">
                {scenario.text}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
                <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex-grow">
                  <h4 className="font-black text-blue-900 mb-2 flex items-center gap-2"><Sparkles size={18} className="text-orange-400" /> טיפ להדמיה:</h4>
                  <p className="text-blue-800 font-medium text-sm">עצמו עיניים בזמן ההקראה ונסו "לראות" את הצבעים, הצורות והתנועות שמתוארים במילים.</p>
                </div>
                
                {onEditInTeacherHub && (
                  <button 
                    onClick={() => onEditInTeacherHub(scenario.text)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-black py-4 px-8 rounded-3xl shadow-xl flex items-center gap-3 transition-all transform hover:-translate-y-1 whitespace-nowrap"
                  >
                    <UserCog size={24} />
                    <span>צור דף עבודה מטקסט זה</span>
                  </button>
                )}
              </div>
              
              <button onClick={reset} className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 transition-colors mx-auto">
                <ArrowLeft size={18} /> חזרה להזנת טקסט
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Practice;
