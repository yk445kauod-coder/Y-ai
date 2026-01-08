import React from 'react';
import { Icon } from './Icons';

interface AdProps {
  type: 'banner' | 'native' | 'sidebar' | 'install_promo';
  onInstall?: () => void;
}

export const AdPlaceholder: React.FC<AdProps> = ({ type, onInstall }) => {
  if (type === 'install_promo') {
    return (
      <div className="bg-gradient-to-br from-[#10a37f] to-[#0d8a6a] rounded-[2.5rem] p-8 relative overflow-hidden group shadow-2xl shadow-emerald-500/20 animate-in zoom-in slide-in-from-bottom-10 duration-700 ease-out">
         {/* Decorative blobs for smooth feel */}
         <div className="absolute top-[-40px] right-[-40px] w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none transition-transform duration-1000 group-hover:scale-110" />
         <div className="absolute bottom-[-40px] left-[-40px] w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
         
         <div className="relative z-10 flex flex-col items-center text-center text-white">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-white/30 animate-bounce duration-[3000ms]">
               <Icon name="install_mobile" size={32} />
            </div>
            
            <h4 className="text-xl font-black mb-3 tracking-tight">استخدم YAI كتطبيق مستقل</h4>
            <p className="text-[13px] opacity-90 mb-8 max-w-[240px] leading-relaxed font-bold">
               احصل على تجربة أسرع، تنبيهات المهام، ودخول فوري من شاشتك الرئيسية.
            </p>
            
            <button 
              onClick={onInstall}
              className="w-full py-4 bg-white text-[#10a37f] rounded-2xl font-black text-[15px] shadow-xl active-scale transition-all hover:bg-emerald-50 flex items-center justify-center gap-3 group/btn"
            >
               <div className="bg-emerald-500/10 p-1 rounded-lg group-hover/btn:bg-emerald-500/20 transition-colors">
                  <Icon name="download" size={20} />
               </div>
               تثبيت النسخة الكاملة
            </button>
         </div>
      </div>
    );
  }

  if (type === 'banner') {
    return (
      <div className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl h-12 flex items-center justify-center relative overflow-hidden group animate-in fade-in duration-1000">
         <span className="absolute top-0 left-0 bg-gray-200 dark:bg-white/10 text-[8px] px-1 font-bold text-gray-500 rounded-br">AD</span>
         <p className="text-[10px] text-gray-600 dark:text-gray-400 font-medium px-4 text-center">YAI Pro: تمتع بتجربة خالية من الإعلانات تماماً.</p>
      </div>
    );
  }

  return null;
};