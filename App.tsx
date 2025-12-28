
import React, { useState, useCallback } from 'react';
import { AppTab, GradeLevel } from './types';
import Home from './components/Home';
import Practice from './components/Practice';
import TeacherHub from './components/TeacherHub';
import ChatAssistant from './components/ChatAssistant';
import { PlayCircle, Home as HomeIcon, Languages, MessageSquareText, UserCog } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.HOME);
  const [previousTab, setPreviousTab] = useState<AppTab>(AppTab.HOME);
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>(GradeLevel.ELEM_1_2);
  const [useNikud, setUseNikud] = useState(false);
  
  const [sharedText, setSharedText] = useState<string | undefined>();

  const changeTab = useCallback((newTab: AppTab) => {
    setPreviousTab(activeTab);
    setActiveTab(newTab);
  }, [activeTab]);

  const handleScenarioCreated = (text: string) => {
    setSharedText(text);
  };

  const navigateToTeacherWithText = (text: string) => {
    setSharedText(text);
    changeTab(AppTab.TEACHER);
  };

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.HOME: 
        return <Home 
          onStart={() => changeTab(AppTab.PRACTICE)} 
          gradeLevel={gradeLevel}
          onGradeChange={setGradeLevel}
        />;
      case AppTab.PRACTICE: 
        return <Practice 
          gradeLevel={gradeLevel} 
          useNikud={useNikud} 
          onScenarioCreated={handleScenarioCreated} 
          onEditInTeacherHub={navigateToTeacherWithText}
        />;
      case AppTab.TEACHER: 
        return <TeacherHub 
          gradeLevel={gradeLevel} 
          useNikud={useNikud} 
          onNikudToggle={setUseNikud} 
          lastText={sharedText}
          onBackToApp={() => setActiveTab(previousTab)}
        />;
      case AppTab.CHAT: 
        return <ChatAssistant gradeLevel={gradeLevel} useNikud={useNikud} />;
      default: 
        return <Home onStart={() => changeTab(AppTab.PRACTICE)} gradeLevel={gradeLevel} onGradeChange={setGradeLevel} />;
    }
  };

  const navItems = [
    { id: AppTab.HOME, label: 'בית', icon: <HomeIcon size={20} /> },
    { id: AppTab.PRACTICE, label: 'מעבדת הקראה', icon: <PlayCircle size={20} /> },
    { id: AppTab.TEACHER, label: 'מרחב המורה', icon: <UserCog size={20} /> },
    { id: AppTab.CHAT, label: 'התייעצות', icon: <MessageSquareText size={20} /> },
  ];

  const getGradeLabel = (level: GradeLevel) => {
    switch(level) {
      case GradeLevel.ELEM_1_2: return 'א-ב';
      case GradeLevel.ELEM_3_4: return 'ג-ד';
      case GradeLevel.ELEM_5_6: return 'ה-ו';
      case GradeLevel.MIDDLE: return 'חט"ב';
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 overflow-x-hidden" dir="rtl">
      <header className="bg-blue-900 text-white shadow-lg sticky top-0 z-50 no-print">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-full">
              <PlayCircle className="text-white" size={20} />
            </div>
            <h1 className="text-sm md:text-xl font-black tracking-tight whitespace-nowrap">הסרט שבראש</h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden lg:flex bg-blue-800 p-1 rounded-xl">
              {[GradeLevel.ELEM_1_2, GradeLevel.ELEM_3_4, GradeLevel.ELEM_5_6, GradeLevel.MIDDLE].map(level => (
                <button 
                  key={level}
                  onClick={() => setGradeLevel(level)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${gradeLevel === level ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-200'}`}
                >
                  {getGradeLabel(level)}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setUseNikud(!useNikud)}
              className={`flex items-center gap-2 px-3 py-1 rounded-xl border-2 transition-all font-bold text-xs ${useNikud ? 'bg-orange-500 border-orange-400 text-white' : 'border-blue-700 text-blue-200 hover:border-blue-600'}`}
            >
              <Languages size={14} />
              <span className="hidden sm:inline">ניקוד</span>
              <span className="sm:hidden">אֳ</span>
            </button>

            <nav className="hidden xl:flex gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => changeTab(item.id)}
                  className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1 font-medium text-xs ${
                    activeTab === item.id ? 'bg-white text-blue-900 shadow-sm' : 'hover:bg-blue-800'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
        {renderContent()}
      </main>

      <nav className="xl:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-2 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] overflow-x-auto no-print">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => changeTab(item.id)}
            className={`flex flex-col items-center gap-1 p-2 transition-colors min-w-[60px] ${
              activeTab === item.id ? 'text-blue-600' : 'text-slate-400'
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-bold">{item.label}</span>
          </button>
        ))}
      </nav>

      <footer className="bg-slate-200 py-6 mt-12 text-center text-slate-500 text-sm mb-16 xl:mb-0 no-print">
        <p>© 2024 הסרט שבראש - כלי עזר להדמיה והקראה</p>
      </footer>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          main { width: 100% !important; padding: 0 !important; margin: 0 !important; max-width: none !important; }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        @keyframes slideDown { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default App;
