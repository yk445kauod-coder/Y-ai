import React from 'react';
import { Icon } from './Icons';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chats: any[];
  currentChatId: string;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  onOpenScheduler: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  onInstall: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, onClose, chats, currentChatId, onSelectChat, onNewChat, onDeleteChat, onOpenScheduler, onOpenSettings, onLogout, onInstall
}) => {
  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      />
      
      <div className={`fixed right-0 top-0 bottom-0 w-[85%] max-w-[320px] bg-white dark:bg-[#0f0f0f] z-50 transform transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col border-l border-gray-100 dark:border-white/5 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full pt-safe">
          <div className="p-4 flex items-center justify-between">
            <h2 className="font-black text-xl px-2">YAI</h2>
            <button onClick={onClose} className="p-2 active-scale text-gray-400"><Icon name="close" size={24} /></button>
          </div>

          <div className="px-4 mb-6">
            <button 
              onClick={() => { onNewChat(); onClose(); }}
              className="flex items-center gap-3 w-full bg-black dark:bg-white p-4 rounded-2xl text-sm font-black text-white dark:text-black shadow-lg active-scale"
            >
              <Icon name="add" size={20} />
              دردشة جديدة
            </button>
          </div>

          <div className="px-4 space-y-1 mb-6">
             <button 
               onClick={() => { onOpenScheduler(); onClose(); }}
               className="flex items-center gap-3 w-full p-3 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400"
             >
                <Icon name="calendar_today" size={20} className="text-emerald-500" />
                المساعد اليومي
             </button>
             <button 
               onClick={() => { onOpenSettings(); onClose(); }}
               className="flex items-center gap-3 w-full p-3 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400"
             >
                <Icon name="settings" size={20} className="text-gray-400" />
                الإعدادات
             </button>

             <button 
               onClick={() => { onInstall(); onClose(); }}
               className="group flex items-center justify-between w-full p-4 mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-sm font-black text-emerald-600 dark:text-emerald-400 active-scale shadow-sm relative overflow-hidden"
             >
                <div className="flex items-center gap-3 relative z-10">
                   <Icon name="install_mobile" size={20} />
                   تثبيت التطبيق
                </div>
                <span className="text-[9px] bg-emerald-500 text-white px-2 py-0.5 rounded-full z-10 animate-bounce">NEW</span>
                <div className="absolute top-0 left-0 w-full h-full bg-emerald-500/5 group-hover:scale-110 transition-transform" />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 hide-scrollbar">
            <div className="flex items-center justify-between mb-4 px-2">
               <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">المحادثات الأخيرة</h3>
            </div>
            <div className="space-y-1 pb-10">
              {chats.map(chat => (
                <div key={chat.id} className="group flex items-center gap-1">
                  <button
                    onClick={() => { onSelectChat(chat.id); onClose(); }}
                    className={`flex-1 text-right px-4 py-3 rounded-xl text-sm truncate transition-all flex items-center gap-3 ${currentChatId === chat.id ? 'bg-gray-100 dark:bg-white/5 text-black dark:text-white font-black' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                  >
                    <Icon name="chat_bubble_outline" size={16} className="shrink-0 opacity-40" />
                    <span className="truncate">{chat.title || 'دردشة فارغة'}</span>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); if(confirm('حذف المحادثة؟')) onDeleteChat(chat.id); }}
                    className="p-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                  >
                    <Icon name="delete" size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 dark:border-white/5 mt-auto bg-gray-50/50 dark:bg-white/[0.02] pb-safe-bottom">
             <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center text-[12px] font-black text-white dark:text-black italic">Y</div>
                   <span className="text-sm font-black">المسؤول</span>
                </div>
                <button onClick={onLogout} className="text-gray-400 p-2"><Icon name="logout" size={20} /></button>
             </div>
          </div>
        </div>
      </div>
    </>
  );
};
