import React, { useState } from 'react';
import { Icon } from './Icons';
import { PersonaConfig } from '../types';

interface SettingsProps {
  onClose: () => void;
  config: PersonaConfig;
  onSave: (config: PersonaConfig) => void;
}

const WRITING_STYLES = [
  { id: 'formal', label: 'رسمي واحترافي', icon: 'gavel' },
  { id: 'casual', label: 'ودي وبسيط', icon: 'sentiment_satisfied' },
  { id: 'concise', label: 'مختصر ومباشر', icon: 'short_text' },
  { id: 'creative', label: 'إبداعي ومفصل', icon: 'auto_awesome' },
  { id: 'academic', label: 'أكاديمي وبحثي', icon: 'school' }
];

export const Settings: React.FC<SettingsProps> = ({ onClose, config, onSave }) => {
  const [localConfig, setLocalConfig] = useState<PersonaConfig>(config);
  const [showSaved, setShowSaved] = useState(false);

  const handleSave = () => {
    onSave(localConfig);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0f0f0f] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between pt-safe">
        <h2 className="text-xl font-black">إعدادات الهوية</h2>
        <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-white/5 rounded-full">
          <Icon name="close" size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-10 pb-32">
        {/* Section: Persona Basic Info */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-emerald-500">
             <Icon name="psychology" size={20} />
             <h3 className="font-black text-sm uppercase tracking-widest">الشخصية</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">اسم المساعد</label>
              <input 
                value={localConfig.aiName}
                onChange={(e) => setLocalConfig({...localConfig, aiName: e.target.value})}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl p-3 font-bold text-sm outline-none focus:ring-1 focus:ring-emerald-500/30"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">وصف Persona</label>
              <textarea 
                value={localConfig.personality}
                onChange={(e) => setLocalConfig({...localConfig, personality: e.target.value})}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl p-3 text-sm min-h-[100px] outline-none resize-none focus:ring-1 focus:ring-emerald-500/30"
              />
            </div>
          </div>
        </section>

        {/* Section: Writing Style Preference */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-blue-500">
             <Icon name="history_edu" size={20} />
             <h3 className="font-black text-sm uppercase tracking-widest">أسلوب الكتابة</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {WRITING_STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => setLocalConfig({ ...localConfig, preferredStyle: style.label })}
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-right active-scale ${
                  localConfig.preferredStyle === style.label
                    ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10'
                    : 'border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 hover:border-emerald-500/20'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  localConfig.preferredStyle === style.label ? 'bg-emerald-500 text-white' : 'bg-gray-200 dark:bg-white/10 text-gray-500'
                }`}>
                  <Icon name={style.icon} size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-black ${localConfig.preferredStyle === style.label ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400'}`}>
                    {style.label}
                  </p>
                </div>
                {localConfig.preferredStyle === style.label && (
                  <Icon name="check_circle" size={18} className="text-emerald-500 animate-in zoom-in duration-300" />
                )}
              </button>
            ))}
          </div>
          
          <div className="space-y-1 mt-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">تخصيص يدوي</label>
            <input 
              value={localConfig.preferredStyle}
              onChange={(e) => setLocalConfig({...localConfig, preferredStyle: e.target.value})}
              placeholder="مثال: علمي، كوميدي، شاعر..."
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl p-3 font-bold text-sm outline-none focus:ring-1 focus:ring-emerald-500/30"
            />
          </div>
        </section>

        {/* Section: Memory & Context */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-purple-500">
             <Icon name="memory" size={20} />
             <h3 className="font-black text-sm uppercase tracking-widest">الذاكرة الممتدة</h3>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
              <div className="flex justify-between items-center mb-4">
                <label className="text-[10px] font-black text-gray-400 block">سياق الدردشة القصير</label>
                <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">{localConfig.shortMemoryLimit} رسالة</span>
              </div>
              <input 
                type="range" min="5" max="100" step="5"
                value={localConfig.shortMemoryLimit}
                onChange={(e) => setLocalConfig({...localConfig, shortMemoryLimit: parseInt(e.target.value)})}
                className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <p className="text-[9px] text-gray-400 mt-3 text-center">كلما زاد الرقم، زاد استهلاك الرموز (Tokens) ولكن زاد تذكر التفاصيل القريبة.</p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">ذاكرة المدى البعيد (حقائق دائمة)</label>
              <textarea 
                value={localConfig.longTermMemory}
                onChange={(e) => setLocalConfig({...localConfig, longTermMemory: e.target.value})}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl p-3 text-sm min-h-[150px] outline-none resize-none focus:ring-1 focus:ring-emerald-500/30"
                placeholder="حقائق تريد أن يتذكرها YAI دائماً (مثلاً: اهتماماتي هي الذكاء الاصطناعي، اسمي أحمد، أعمل مبرمجاً...)"
              />
            </div>
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-gray-100 dark:border-white/5 pb-safe-bottom z-50">
        {showSaved && (
          <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-2 rounded-full text-xs font-black shadow-2xl animate-in slide-in-from-bottom-2 duration-300">
            تم حفظ التغييرات بنجاح ✨
          </div>
        )}
        <button 
          onClick={handleSave}
          className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl font-black text-sm active-scale shadow-xl hover:opacity-90 transition-all"
        >
          حفظ كافة الإعدادات
        </button>
      </div>
    </div>
  );
};
