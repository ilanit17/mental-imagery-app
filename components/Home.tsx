
import React from 'react';
import { ArrowLeft, School, GraduationCap, UserCog, PlayCircle } from 'lucide-react';
import { GradeLevel } from '../types';

interface HomeProps {
  onStart: () => void;
  gradeLevel: GradeLevel;
  onGradeChange: (level: GradeLevel) => void;
}

const Home: React.FC<HomeProps> = ({ onStart, gradeLevel, onGradeChange }) => {
  const elementaryGrades = [
    { id: GradeLevel.ELEM_1_2, label: 'א-ב', desc: 'שפה פשוטה מאוד' },
    { id: GradeLevel.ELEM_3_4, label: 'ג-ד', desc: 'תיאורים מוחשיים' },
    { id: GradeLevel.ELEM_5_6, label: 'ה-ו', desc: 'שפה עשירה ומפורטת' },
  ];

  return (
    <div className="flex flex-col items-center text-center py-6 animate-fadeIn">
      <div className="max-w-4xl">
        <span className="bg-orange-100 text-orange-600 px-4 py-1 rounded-full text-sm font-bold mb-6 inline-block">
          הקראה חכמה והדמיה
        </span>
        <h2 className="text-4xl md:text-6xl font-black text-blue-900 mb-6 leading-tight">
          הסרט שבתוך הראש:<br />
          <span className="text-orange-500">מקשיבים, מדמיינים, מבינים.</span>
        </h2>
        
        <p className="text-xl text-slate-600 mb-8 leading-relaxed">
          בואו נהפוך מילים לתמונות חיות. בחרו את הרמה שלכם והתחילו להקשיב:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10 w-full">
          {elementaryGrades.map((grade) => (
            <button 
              key={grade.id}
              onClick={() => onGradeChange(grade.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-3xl border-4 transition-all ${
                gradeLevel === grade.id 
                  ? 'bg-blue-50 border-blue-500 shadow-md scale-105' 
                  : 'bg-white border-slate-100 hover:border-blue-200'
              }`}
            >
              <div className={`p-3 rounded-2xl ${gradeLevel === grade.id ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                <School size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-blue-900">יסודי {grade.label}</h3>
                <p className="text-[10px] text-slate-500 leading-tight">{grade.desc}</p>
              </div>
            </button>
          ))}

          <button 
            onClick={() => onGradeChange(GradeLevel.MIDDLE)}
            className={`flex flex-col items-center gap-2 p-4 rounded-3xl border-4 transition-all ${
              gradeLevel === GradeLevel.MIDDLE 
                ? 'bg-blue-50 border-blue-500 shadow-md scale-105' 
                : 'bg-white border-slate-100 hover:border-blue-200'
            }`}
          >
            {/* Fix: use GradeLevel.MIDDLE instead of out-of-scope 'grade' variable */}
            <div className={`p-3 rounded-2xl ${gradeLevel === GradeLevel.MIDDLE ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
              <GraduationCap size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-blue-900">חטיבת ביניים</h3>
              <p className="text-[10px] text-slate-500 leading-tight">תיאורים מורכבים</p>
            </div>
          </button>
        </div>

        <div className="flex flex-col md:flex-row justify-center gap-4 mb-16">
          <button
            onClick={onStart}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold py-4 px-12 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
          >
            הפעילו את המעבדה
            <PlayCircle />
          </button>
          
          <div className="bg-purple-50 text-purple-700 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border border-purple-100">
            <UserCog size={20} />
            <span className="text-right">מורים? תוכלו לייצר דפי עבודה במרחב המורה</span>
          </div>
        </div>
      </div>

      <div className="mt-8 w-full rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
        <img 
          src="https://picsum.photos/id/1012/1200/500" 
          alt="Imagination" 
          className="w-full object-cover h-[300px] md:h-[400px]"
        />
      </div>
    </div>
  );
};

export default Home;
