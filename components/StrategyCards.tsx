
import React, { useState } from 'react';
import { Plus, Download, Trash2, Layout, Book } from 'lucide-react';

interface Card {
  id: string;
  title: string;
  what: string;
  when: string;
  why: string;
  how: string;
  example: string;
  color: string;
}

const colors = [
  'bg-blue-100 border-blue-300 text-blue-900',
  'bg-orange-100 border-orange-300 text-orange-900',
  'bg-green-100 border-green-300 text-green-900',
  'bg-purple-100 border-purple-300 text-purple-900',
  'bg-pink-100 border-pink-300 text-pink-900',
];

const StrategyCards: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newCard, setNewCard] = useState<Partial<Card>>({
    title: '', what: '', when: '', why: '', how: '', example: '', color: colors[0]
  });

  const saveCard = () => {
    if (!newCard.title) return;
    setCards([{ ...newCard, id: Date.now().toString() } as Card, ...cards]);
    setIsEditing(false);
    setNewCard({ title: '', what: '', when: '', why: '', how: '', example: '', color: colors[0] });
  };

  const downloadCardAsFile = (card: Card) => {
    const htmlContent = `
      <html dir="rtl" lang="he">
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; text-align: right; }
            .card { border: 2px solid #ccc; padding: 20px; border-radius: 15px; background-color: #f9f9f9; }
            h1 { color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px; }
            .section { margin-bottom: 15px; }
            .label { font-weight: bold; color: #475569; font-size: 0.8em; text-transform: uppercase; display: block; }
            .content { font-size: 1.1em; margin-top: 5px; }
            .example { background-color: #e2e8f0; padding: 15px; border-radius: 10px; font-style: italic; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>אסטרטגיה: ${card.title}</h1>
            <div class="section">
              <span class="label">מה זה?</span>
              <div class="content">${card.what}</div>
            </div>
            <div class="section">
              <span class="label">מתי משתמשים?</span>
              <div class="content">${card.when}</div>
            </div>
            <div class="section">
              <span class="label">איך מבצעים?</span>
              <div class="content">${card.how}</div>
            </div>
            <div class="example">
              <span class="label">דוגמה:</span>
              <div class="content">${card.example}</div>
            </div>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `אסטרטגיה_${card.title}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="py-10">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-4xl font-black text-blue-900 mb-2">יוצר כרטיסיות אסטרטגיה</h2>
          <p className="text-xl text-slate-600">צרו לעצמכם כרטיסיות עזר אישיות להבנת הנקרא.</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-black py-4 px-8 rounded-2xl shadow-lg flex items-center gap-2"
          >
            <Plus /> כרטיסייה חדשה
          </button>
        )}
      </div>

      {isEditing && (
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-10 border border-slate-200 animate-slideUp">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block font-black text-slate-700 mb-1">שם האסטרטגיה:</label>
                <input 
                  className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none" 
                  value={newCard.title} onChange={e => setNewCard({...newCard, title: e.target.value})}
                  placeholder="למשל: בועת הדמיון"
                />
              </div>
              <div>
                <label className="block font-black text-slate-700 mb-1">מה זה?</label>
                <textarea 
                  className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none" 
                  value={newCard.what} onChange={e => setNewCard({...newCard, what: e.target.value})}
                  rows={2}
                />
              </div>
              <div>
                <label className="block font-black text-slate-700 mb-1">מתי משתמשים?</label>
                <textarea 
                  className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none" 
                  value={newCard.when} onChange={e => setNewCard({...newCard, when: e.target.value})}
                  rows={2}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block font-black text-slate-700 mb-1">לשם מה? (המטרה)</label>
                <textarea 
                  className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none" 
                  value={newCard.why} onChange={e => setNewCard({...newCard, why: e.target.value})}
                  rows={2}
                />
              </div>
              <div>
                <label className="block font-black text-slate-700 mb-1">איך עושים את זה? (שלבים)</label>
                <textarea 
                  className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none" 
                  value={newCard.how} onChange={e => setNewCard({...newCard, how: e.target.value})}
                  rows={2}
                />
              </div>
              <div>
                <label className="block font-black text-slate-700 mb-1">דוגמה:</label>
                <textarea 
                  className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none" 
                  value={newCard.example} onChange={e => setNewCard({...newCard, example: e.target.value})}
                  rows={2}
                />
              </div>
            </div>
          </div>
          <div className="mt-8 flex gap-4 items-center border-t pt-6">
            <span className="font-bold text-slate-500">בחרו צבע:</span>
            <div className="flex gap-2">
              {colors.map(c => (
                <button 
                  key={c} 
                  onClick={() => setNewCard({...newCard, color: c})}
                  className={`w-8 h-8 rounded-full border-2 ${c} ${newCard.color === c ? 'ring-4 ring-slate-200' : ''}`}
                />
              ))}
            </div>
            <div className="mr-auto flex gap-3">
              <button onClick={() => setIsEditing(false)} className="px-6 py-3 font-bold text-slate-400">ביטול</button>
              <button onClick={saveCard} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black shadow-md hover:bg-blue-700">שמור כרטיסייה</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cards.length === 0 && !isEditing && (
          <div className="col-span-full py-20 text-center text-slate-300">
            <Layout size={64} className="mx-auto mb-4 opacity-20" />
            <p className="text-2xl font-bold">אין כרטיסיות עדיין. בואו ניצור אחת!</p>
          </div>
        )}
        {cards.map((card) => (
          <div key={card.id} className={`${card.color} border-2 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group`}>
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-white/50 rounded-2xl">
                <Book size={24} />
              </div>
              <button 
                onClick={() => setCards(cards.filter(c => c.id !== card.id))}
                className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 size={20} />
              </button>
            </div>
            
            <h3 className="text-2xl font-black mb-6 underline decoration-4 decoration-white/50">{card.title}</h3>
            
            <div className="space-y-4 text-sm font-bold opacity-90">
              <div>
                <span className="block text-xs uppercase opacity-60">מה זה?</span>
                <p>{card.what}</p>
              </div>
              <div>
                <span className="block text-xs uppercase opacity-60">מתי משתמשים?</span>
                <p>{card.when}</p>
              </div>
              <div className="bg-white/30 p-4 rounded-2xl italic">
                <span className="block text-xs uppercase opacity-60 mb-1">דוגמה:</span>
                <p>{card.example}</p>
              </div>
            </div>
            
            <button 
              onClick={() => downloadCardAsFile(card)}
              className="mt-8 w-full bg-white/40 hover:bg-white/60 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2"
            >
              <Download size={14} /> שמור כקובץ Word
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StrategyCards;
