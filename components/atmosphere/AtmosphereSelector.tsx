import React from 'react';
import { AtmosphereType, ATMOSPHERE_LABELS } from '../../types/atmosphere.types';
import { Sparkles, Clock, Heart, Wind, Sun, PartyPopper, Zap, Shuffle } from 'lucide-react';

interface AtmosphereSelectorProps {
  selectedAtmosphere?: AtmosphereType;
  onSelect: (atmosphere: AtmosphereType | 'random') => void;
  allowRandom?: boolean;
}

const ATMOSPHERE_ICONS: Record<AtmosphereType, React.ReactNode> = {
  tension: <Clock className="text-red-600" size={24} />,
  anticipation: <Sparkles className="text-orange-500" size={24} />,
  sadness: <Heart className="text-blue-500" size={24} />,
  calm: <Wind className="text-blue-300" size={24} />,
  joy: <Sun className="text-yellow-500" size={24} />,
  festive: <PartyPopper className="text-purple-500" size={24} />,
  excitement: <Zap className="text-pink-500" size={24} />
};

const ATMOSPHERE_COLORS: Record<AtmosphereType, string> = {
  tension: 'bg-red-50 border-red-200 hover:bg-red-100',
  anticipation: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
  sadness: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
  calm: 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100',
  joy: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
  festive: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
  excitement: 'bg-pink-50 border-pink-200 hover:bg-pink-100'
};

const ATMOSPHERE_SELECTED_COLORS: Record<AtmosphereType, string> = {
  tension: 'bg-red-200 border-red-500 shadow-lg',
  anticipation: 'bg-orange-200 border-orange-500 shadow-lg',
  sadness: 'bg-blue-200 border-blue-500 shadow-lg',
  calm: 'bg-cyan-200 border-cyan-500 shadow-lg',
  joy: 'bg-yellow-200 border-yellow-500 shadow-lg',
  festive: 'bg-purple-200 border-purple-500 shadow-lg',
  excitement: 'bg-pink-200 border-pink-500 shadow-lg'
};

const atmosphereTypes: AtmosphereType[] = ['tension', 'anticipation', 'sadness', 'calm', 'joy', 'festive', 'excitement'];

export const AtmosphereSelector: React.FC<AtmosphereSelectorProps> = ({ 
  selectedAtmosphere, 
  onSelect, 
  allowRandom = false 
}) => {
  const handleRandom = () => {
    const random = atmosphereTypes[Math.floor(Math.random() * atmosphereTypes.length)];
    onSelect(random);
  };

  return (
    <div className="space-y-4">
      <label className="text-lg font-bold text-slate-700 flex items-center gap-2">
        <Sparkles className="text-purple-500" size={20} />
        בחרו אווירה לטקסט:
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {atmosphereTypes.map((type) => {
          const isSelected = selectedAtmosphere === type;
          return (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                isSelected 
                  ? ATMOSPHERE_SELECTED_COLORS[type] 
                  : ATMOSPHERE_COLORS[type]
              }`}
            >
              {ATMOSPHERE_ICONS[type]}
              <span className="font-bold text-sm">{ATMOSPHERE_LABELS[type]}</span>
            </button>
          );
        })}
        {allowRandom && (
          <button
            onClick={handleRandom}
            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
              selectedAtmosphere && !atmosphereTypes.includes(selectedAtmosphere as AtmosphereType)
                ? 'bg-slate-200 border-slate-500 shadow-lg'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Shuffle className="text-slate-600" size={24} />
            <span className="font-bold text-sm">אקראי</span>
          </button>
        )}
      </div>
    </div>
  );
};

