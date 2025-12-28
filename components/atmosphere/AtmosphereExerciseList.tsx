import React, { useState, useEffect } from 'react';
import { AtmosphereAnalysis, AtmosphereExerciseResult, AtmosphereExerciseState } from '../../types/atmosphere.types';
import { AtmosphereExerciseCard } from './AtmosphereExerciseCard';
import { checkAtmosphereAnswer } from '../../services/geminiService';
import { GradeLevel } from '../../types';
import { Trophy, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface AtmosphereExerciseListProps {
  analysis: AtmosphereAnalysis;
  onComplete?: (results: AtmosphereExerciseResult[]) => void;
  showHints?: boolean;
  gradeLevel: GradeLevel;
}

export const AtmosphereExerciseList: React.FC<AtmosphereExerciseListProps> = ({
  analysis,
  onComplete,
  showHints = false,
  gradeLevel
}) => {
  const [state, setState] = useState<AtmosphereExerciseState>({
    currentExerciseIndex: 0,
    results: [],
    isComplete: false,
    totalScore: 0
  });

  const handleAnswer = async (answer: string | string[]) => {
    const currentExercise = analysis.exercises[state.currentExerciseIndex];
    
    try {
      const result = await checkAtmosphereAnswer(
        currentExercise,
        answer,
        analysis.text,
        gradeLevel
      );

      const exerciseResult: AtmosphereExerciseResult = {
        exerciseId: currentExercise.id,
        userAnswer: answer,
        isCorrect: result.isCorrect,
        score: result.score,
        feedback: result.feedback
      };

      const newResults = [...state.results, exerciseResult];
      const newScore = newResults.reduce((sum, r) => sum + r.score, 0) / newResults.length;
      const isComplete = newResults.length === analysis.exercises.length;

      setState({
        currentExerciseIndex: isComplete ? state.currentExerciseIndex : state.currentExerciseIndex + 1,
        results: newResults,
        isComplete,
        totalScore: newScore
      });

      if (isComplete && onComplete) {
        onComplete(newResults);
      }
    } catch (error) {
      console.error('Error checking answer:', error);
      alert('שגיאה בבדיקת התשובה. נסו שוב.');
    }
  };

  const currentExercise = analysis.exercises[state.currentExerciseIndex];
  const currentResult = state.results.find(r => r.exerciseId === currentExercise?.id);

  const progress = (state.results.length / analysis.exercises.length) * 100;

  if (state.isComplete) {
    const correctCount = state.results.filter(r => r.isCorrect).length;
    return (
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-8 border-2 border-purple-200 shadow-xl">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className={`p-6 rounded-full ${state.totalScore >= 80 ? 'bg-green-100' : state.totalScore >= 60 ? 'bg-yellow-100' : 'bg-red-100'}`}>
              <Trophy className={`${state.totalScore >= 80 ? 'text-green-600' : state.totalScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`} size={64} />
            </div>
          </div>
          <h2 className="text-3xl font-black text-slate-800">סיימתם את התרגילים!</h2>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <p className="text-4xl font-black text-blue-600">{Math.round(state.totalScore)}%</p>
                <p className="text-sm text-slate-600 font-bold">ציון סופי</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-black text-green-600">{correctCount}/{analysis.exercises.length}</p>
                <p className="text-sm text-slate-600 font-bold">תשובות נכונות</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-bold text-slate-700 mb-2">סיכום תוצאות:</p>
              {state.results.map((result, idx) => {
                const exercise = analysis.exercises.find(e => e.id === result.exerciseId);
                return (
                  <div key={idx} className={`p-3 rounded-lg flex items-center justify-between ${
                    result.isCorrect ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    <span className="font-medium text-sm">{exercise?.question}</span>
                    {result.isCorrect ? (
                      <CheckCircle2 className="text-green-600" size={20} />
                    ) : (
                      <XCircle className="text-red-600" size={20} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <p className="text-lg font-bold text-slate-700">
            האווירה בטקסט: <span className="text-purple-600">{analysis.primaryAtmosphere}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-black text-slate-800">תרגילי זיהוי אווירה</h2>
          <span className="text-sm font-bold text-slate-600">
            {state.currentExerciseIndex + 1} / {analysis.exercises.length}
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3 mb-4">
          <div
            className="bg-purple-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-slate-600">
          האווירה בטקסט: <span className="font-bold text-purple-600">{analysis.primaryAtmosphere}</span>
        </p>
      </div>

      {currentExercise && (
        <AtmosphereExerciseCard
          exercise={currentExercise}
          onAnswer={handleAnswer}
          showHints={showHints}
          result={currentResult}
        />
      )}

      {state.results.length > 0 && !state.isComplete && (
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <p className="text-sm text-blue-800 font-bold">
            התקדמות: {state.results.filter(r => r.isCorrect).length} מתוך {state.results.length} תשובות נכונות
          </p>
        </div>
      )}
    </div>
  );
};

