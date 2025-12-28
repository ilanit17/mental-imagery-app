import React, { useState } from 'react';
import { AtmosphereExercise } from '../../types/atmosphere.types';
import { CheckCircle2, XCircle, Lightbulb, HelpCircle } from 'lucide-react';

interface AtmosphereExerciseCardProps {
  exercise: AtmosphereExercise;
  onAnswer: (answer: string | string[]) => void;
  showHints?: boolean;
  result?: {
    isCorrect: boolean;
    feedback?: string;
  };
}

export const AtmosphereExerciseCard: React.FC<AtmosphereExerciseCardProps> = ({
  exercise,
  onAnswer,
  showHints = false,
  result
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [openAnswer, setOpenAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);

  const handleSubmit = () => {
    if (exercise.type === 'mark' || exercise.type === 'match') {
      onAnswer(selectedOptions);
    } else {
      onAnswer(openAnswer || selectedOptions[0] || '');
    }
    setShowResult(true);
  };

  const handleOptionToggle = (option: string) => {
    if (exercise.type === 'mark' || exercise.type === 'match') {
      setSelectedOptions(prev => 
        prev.includes(option) 
          ? prev.filter(o => o !== option)
          : [...prev, option]
      );
    } else {
      setSelectedOptions([option]);
    }
  };

  const isAnswered = showResult && result !== undefined;
  const isCorrect = result?.isCorrect ?? false;

  return (
    <div className={`bg-white rounded-3xl p-6 border-2 shadow-lg transition-all ${
      isAnswered 
        ? isCorrect 
          ? 'border-green-300 bg-green-50' 
          : 'border-red-300 bg-red-50'
        : 'border-slate-200'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
          {exercise.type === 'identify' && <HelpCircle className="text-blue-500" size={24} />}
          {exercise.type === 'mark' && <CheckCircle2 className="text-purple-500" size={24} />}
          {exercise.type === 'match' && <HelpCircle className="text-orange-500" size={24} />}
          {exercise.type === 'explain' && <Lightbulb className="text-yellow-500" size={24} />}
          {exercise.question}
        </h3>
        {isAnswered && (
          <div className={`p-2 rounded-full ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
            {isCorrect ? (
              <CheckCircle2 className="text-green-600" size={24} />
            ) : (
              <XCircle className="text-red-600" size={24} />
            )}
          </div>
        )}
      </div>

      {exercise.type === 'identify' && exercise.options && (
        <div className="space-y-3 mb-6">
          {exercise.options.map((option, idx) => {
            const isSelected = selectedOptions.includes(option);
            const isCorrectOption = option === exercise.correctAnswer;
            return (
              <button
                key={idx}
                onClick={() => !isAnswered && handleOptionToggle(option)}
                disabled={isAnswered}
                className={`w-full p-4 rounded-xl border-2 text-right transition-all ${
                  isAnswered && isCorrectOption
                    ? 'bg-green-100 border-green-400'
                    : isAnswered && isSelected && !isCorrect
                    ? 'bg-red-100 border-red-400'
                    : isSelected
                    ? 'bg-blue-100 border-blue-400'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                } ${isAnswered ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <span className="font-bold">{option}</span>
              </button>
            );
          })}
        </div>
      )}

      {exercise.type === 'mark' && exercise.elements && (
        <div className="space-y-3 mb-6">
          <p className="text-sm text-slate-600 mb-3">סמנו את כל האלמנטים שיוצרים את האווירה:</p>
          {exercise.elements.map((element, idx) => {
            const isSelected = selectedOptions.includes(element.content);
            const correctAnswers = Array.isArray(exercise.correctAnswer) 
              ? exercise.correctAnswer 
              : [exercise.correctAnswer];
            const isCorrectElement = correctAnswers.includes(element.content);
            return (
              <button
                key={idx}
                onClick={() => !isAnswered && handleOptionToggle(element.content)}
                disabled={isAnswered}
                className={`w-full p-3 rounded-xl border-2 text-right transition-all flex items-center justify-between ${
                  isAnswered && isCorrectElement
                    ? 'bg-green-100 border-green-400'
                    : isAnswered && isSelected && !isCorrectElement
                    ? 'bg-red-100 border-red-400'
                    : isSelected
                    ? 'bg-blue-100 border-blue-400'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                } ${isAnswered ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <span className="font-medium">{element.content}</span>
                <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded">
                  {element.type === 'action' ? 'פעולה' :
                   element.type === 'dialogue' ? 'אמירה' :
                   element.type === 'color' ? 'צבע' :
                   element.type === 'sound' ? 'קול' :
                   element.type === 'adjective' ? 'תואר' : 'פיסוק'}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {exercise.type === 'match' && exercise.categories && exercise.options && (
        <div className="space-y-4 mb-6">
          <p className="text-sm text-slate-600 mb-3">התאימו כל אלמנט לקטגוריה המתאימה:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-bold text-slate-700 mb-2">אלמנטים:</h4>
              {exercise.options.map((option, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border-2 ${
                    selectedOptions.includes(option)
                      ? 'bg-blue-100 border-blue-400'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <span className="font-medium">{option}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-slate-700 mb-2">קטגוריות:</h4>
              {exercise.categories.map((category, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border-2 bg-slate-50 border-slate-200"
                >
                  <span className="font-medium">{category}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-500 italic">* התאמה ידנית - בחרו את האלמנטים המתאימים</p>
        </div>
      )}

      {exercise.type === 'explain' && (
        <div className="mb-6">
          <textarea
            value={openAnswer}
            onChange={(e) => setOpenAnswer(e.target.value)}
            disabled={isAnswered}
            placeholder="כתבו את תשובתכם כאן..."
            className="w-full h-32 p-4 rounded-xl border-2 border-slate-200 bg-slate-50 outline-none focus:border-blue-400 disabled:bg-slate-100"
          />
        </div>
      )}

      {!isAnswered && (
        <button
          onClick={handleSubmit}
          disabled={
            (exercise.type === 'identify' && selectedOptions.length === 0) ||
            (exercise.type === 'mark' && selectedOptions.length === 0) ||
            (exercise.type === 'explain' && !openAnswer.trim())
          }
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          שלח תשובה
        </button>
      )}

      {isAnswered && result?.feedback && (
        <div className={`mt-4 p-4 rounded-xl ${
          isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <p className="text-sm font-medium">{result.feedback}</p>
        </div>
      )}

      {showHints && !isAnswered && (
        <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-xs text-blue-800">
            <strong>טיפ:</strong> חפשו בטקסט מילים, פעולות, צבעים וקולות שיוצרים את האווירה.
          </p>
        </div>
      )}
    </div>
  );
};

