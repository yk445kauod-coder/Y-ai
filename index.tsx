import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Sidebar } from './components/Sidebar';
import { ChatInput } from './components/ChatInput';
import { MessageBubble } from './components/MessageBubble';
import { Scheduler } from './components/Scheduler';
import { Settings } from './components/Settings';
import { AdPlaceholder } from './components/AdPlaceholder';
import { Message, ToolMode, ChatSession, FileAttachment, PersonaConfig, Task } from './types';
import { generateAIStream } from './geminiService';
import { Icon } from './components/Icons';

const AGENTS = [
  { id: 'general', name: 'YAI المساعد', icon: 'bolt', desc: 'نقاشات ذكية وإجابات فورية', color: 'bg-emerald-500' },
  { id: 'creative', name: 'الرسام الرقمي', icon: 'palette', desc: 'حول كلماتك إلى فن بصري', color: 'bg-orange-500' },
  { id: 'reasoning', name: 'المحلل المنطقي', icon: 'psychology', desc: 'حل المسائل المعقدة والبرمجة', color: 'bg-purple-600' },
  { id: 'search', name: 'الباحث الذكي', icon: 'language', desc: 'بحث عميق في الويب وتوثيق', color: 'bg-blue-600' }
];

const YAIApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('yai_session_active') === 'true');
  const [currentView, setCurrentView] = useState<'chat' | 'scheduler' | 'settings'>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    } else {
      setShowInstallModal(true);
    }
  };

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('yai_chat_sessions');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => localStorage.getItem('yai_active_session_id'));
  const [activeTools, setActiveTools] = useState<ToolMode[]>([ToolMode.Search]);
  const [activeModelName, setActiveModelName] = useState<string | null>(null);
  
  const [personaConfig, setPersonaConfig] = useState<PersonaConfig>(() => {
    const saved = localStorage.getItem('yai_persona_config');
    return saved ? JSON.parse(saved) : {
      aiName: 'YAI',
      personality: 'مساعد ذكي، مبدع، ودقيق.',
      memoryBrief: '',
      preferredStyle: 'احترافي بلمسة ودودة',
      shortMemoryLimit: 15,
      longTermMemory: ''
    };
  });

  useEffect(() => {
    localStorage.setItem('yai_chat_sessions', JSON.stringify(sessions));
    if (activeSessionId) localStorage.setItem('yai_active_session_id', activeSessionId);
  }, [sessions, activeSessionId]);

  useEffect(() => {
    localStorage.setItem('yai_persona_config', JSON.stringify(personaConfig));
  }, [personaConfig]);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollOptions: ScrollToOptions = {
        top: scrollRef.current.scrollHeight,
        behavior: isLoading ? 'smooth' : 'auto'
      };
      scrollRef.current.scrollTo(scrollOptions);
    }
  }, [sessions, isLoading]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;

  const handleNewChat = (agentId: string = 'general') => {
    const newId = Date.now().toString();
    const agent = AGENTS.find(a => a.id === agentId);
    let initialTools = [ToolMode.Search];
    if (agentId === 'creative') initialTools = [ToolMode.Image];
    if (agentId === 'reasoning') initialTools = [ToolMode.Reasoning];

    const newSession: ChatSession = {
      id: newId,
      title: agent ? agent.name : 'محادثة جديدة',
      messages: [],
      activeTools: initialTools
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    setActiveTools(initialTools);
    setCurrentView('chat');
  };

  const handleSendMessage = async (content: string, attachments: FileAttachment[], regenerateId?: string) => {
    if (!activeSessionId) handleNewChat();
    const sessionId = activeSessionId || sessions[0]?.id;
    
    let historyToUse: Message[] = [];
    if (regenerateId) {
      const session = sessions.find(s => s.id === sessionId);
      if (!session) return;
      const msgIndex = session.messages.findIndex(m => m.id === regenerateId);
      if (msgIndex === -1) return;
      historyToUse = session.messages.slice(0, msgIndex);
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, messages: historyToUse } : s));
      const lastUserMsg = session.messages[msgIndex - 1];
      content = lastUserMsg.content;
      attachments = lastUserMsg.files || [];
    } else {
      const userMsg: Message = { id: Date.now().toString(), role: 'user', content, timestamp: new Date(), files: attachments };
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, messages: [...s.messages, userMsg], title: s.messages.length === 0 ? content.substring(0, 30) : s.title } : s));
      historyToUse = (sessions.find(s => s.id === sessionId)?.messages || []).concat(userMsg);
    }

    setIsLoading(true);
    const assistantMsgId = Date.now().toString() + "-ai";
    
    setSessions(prev => prev.map(s => s.id === sessionId ? { 
      ...s, 
      messages: [...s.messages, { id: assistantMsgId, role: 'assistant', content: '', timestamp: new Date(), isStreaming: true }] 
    } : s));

    try {
      const stream = generateAIStream(content, historyToUse, activeTools, attachments, personaConfig);
      for await (const chunk of stream) {
        if (chunk.modelUsed) setActiveModelName(chunk.modelUsed.includes('image') ? 'المصور' : personaConfig.aiName);
        
        // Handle dynamic memory updates
        if (chunk.newFact) {
          setPersonaConfig(prev => {
            const existingFacts = prev.longTermMemory ? prev.longTermMemory.split('\n') : [];
            const isDuplicate = existingFacts.some(f => f.includes(chunk.newFact));
            if (isDuplicate) return prev;
            return {
              ...prev,
              longTermMemory: (prev.longTermMemory ? prev.longTermMemory + '\n' : '') + `- ${chunk.newFact}`
            };
          });
        }

        setSessions(prev => prev.map(s => 
          s.id === sessionId ? {
            ...s,
            messages: s.messages.map(m => m.id === assistantMsgId ? {
              ...m,
              content: chunk.text || m.content,
              images: chunk.images || m.images,
              searchGrounding: chunk.grounding || m.searchGrounding,
              thinkingContent: chunk.thinking || m.thinkingContent,
              isStreaming: !chunk.isDone,
              isError: chunk.isError
            } : m)
          } : s
        ));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setTimeout(() => setActiveModelName(null), 3000);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0d0d0d] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-black dark:bg-white rounded-[2.2rem] flex items-center justify-center shadow-2xl rotate-6 mb-12 animate-bounce duration-[4s]">
           <span className="text-5xl font-black text-white dark:text-black italic">Y</span>
        </div>
        <h1 className="text-6xl font-black mb-6 tracking-tighter">YAI <span className="text-emerald-500">الذكي.</span></h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-sm font-bold">المساعد الشخصي الذي يفكر معك، يرسم لك، ويتذكرك دائماً.</p>
        <button onClick={() => { localStorage.setItem('yai_session_active', 'true'); setIsAuthenticated(true); }} className="bg-black dark:bg-white text-white dark:text-black font-black px-14 py-5 rounded-[1.8rem] text-xl shadow-2xl active-scale hover:scale-105 transition-all">ابدأ الآن</button>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-white dark:bg-[#0d0d0d] text-[#171717] dark:text-[#ececec] overflow-hidden">
      <Sidebar 
        isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} 
        chats={sessions} currentChatId={activeSessionId || ''} 
        onSelectChat={(id) => { setActiveSessionId(id); setCurrentView('chat'); }} 
        onNewChat={() => handleNewChat()} onDeleteChat={(id) => setSessions(prev => prev.filter(s => s.id !== id))}
        onOpenScheduler={() => { setCurrentView('scheduler'); setIsSidebarOpen(false); }} 
        onOpenSettings={() => { setCurrentView('settings'); setIsSidebarOpen(false); }}
        onLogout={() => { localStorage.clear(); setIsAuthenticated(false); }} 
        onInstall={handleInstallClick}
      />
      
      <div className="flex-1 flex flex-col relative w-full h-full overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 bg-white/90 dark:bg-[#0d0d0d]/90 backdrop-blur-xl z-30 shrink-0 border-b border-gray-100 dark:border-white/5">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 active-scale"><Icon name="menu" size={26} /></button>
          <div className="flex flex-col items-center">
             <h1 className="text-base font-black tracking-tight">{activeModelName || personaConfig.aiName}</h1>
             <div className="h-1 flex items-center">
                {isLoading && (
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                )}
             </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleInstallClick} className="p-2 text-emerald-500 active-scale"><Icon name="install_mobile" size={24} /></button>
            <button onClick={() => handleNewChat()} className="p-2 active-scale"><Icon name="edit_note" size={26} /></button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-white dark:bg-[#0d0d0d]" ref={scrollRef}>
          <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col min-h-full">
            {currentView === 'chat' ? (
              <>
                {!activeSession || activeSession.messages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-12 py-20">
                    <div className="w-20 h-20 bg-black dark:bg-white rounded-[1.8rem] flex items-center justify-center shadow-2xl rotate-6 animate-pulse">
                       <span className="text-4xl font-black text-white dark:text-black italic">Y</span>
                    </div>
                    <h2 className="text-3xl font-black leading-tight tracking-tight">مرحباً بك، أنا {personaConfig.aiName}.<br/><span className="text-gray-400">كيف أساعدك اليوم؟</span></h2>
                    <div className="w-full max-w-sm space-y-4">
                       <AdPlaceholder type="install_promo" onInstall={handleInstallClick} />
                       <div className="grid grid-cols-1 gap-3 text-right">
                          {AGENTS.map(agent => (
                            <button key={agent.id} onClick={() => handleNewChat(agent.id)} className="flex items-center gap-4 p-5 bg-gray-50 dark:bg-white/5 rounded-[1.5rem] border border-transparent hover:border-emerald-500/20 active-scale transition-all">
                               <div className={`w-10 h-10 ${agent.color} rounded-xl flex items-center justify-center text-white shrink-0`}><Icon name={agent.icon} size={20} /></div>
                               <div className="flex-1 min-w-0"><p className="font-black text-sm">{agent.name}</p><p className="text-[10px] text-gray-400 font-bold">{agent.desc}</p></div>
                            </button>
                          ))}
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-8 pb-32">
                    {activeSession.messages.map((msg) => (
                      <MessageBubble key={msg.id} message={msg} onRegenerate={() => handleSendMessage('', [], msg.id)} />
                    ))}
                    {isLoading && activeSession.messages[activeSession.messages.length - 1]?.role === 'user' && (
                      <div className="flex gap-4 items-start animate-in fade-in duration-500">
                         <div className="w-8 h-8 rounded-lg bg-black dark:bg-white flex items-center justify-center shrink-0">
                            <span className="text-xs font-black text-white dark:text-black italic">Y</span>
                         </div>
                         <div className="flex gap-1.5 p-3 rounded-2xl bg-gray-50 dark:bg-white/5">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot"></div>
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot"></div>
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot"></div>
                         </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : currentView === 'scheduler' ? <Scheduler /> : 
                <Settings config={personaConfig} onSave={setPersonaConfig} onClose={() => setCurrentView('chat')} />
            }
          </div>
        </main>

        {currentView === 'chat' && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white dark:from-[#0d0d0d] via-white/95 dark:via-[#0d0d0d]/95 to-transparent pt-8 pb-4 px-4 z-20">
            <div className="max-w-3xl mx-auto">
              <ChatInput onSend={handleSendMessage} tools={activeTools} toggleTool={(tool) => setActiveTools(prev => prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool])} isLoading={isLoading} />
            </div>
          </div>
        )}
      </div>

      {showInstallModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
           <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-sm rounded-[2.5rem] p-10 text-center space-y-8 shadow-4xl animate-in zoom-in duration-300">
              <button onClick={() => setShowInstallModal(false)} className="absolute top-6 left-6 text-gray-400"><Icon name="close" size={24} /></button>
              <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto text-emerald-500"><Icon name="install_mobile" size={40} /></div>
              <h3 className="text-2xl font-black">تثبيت YAI</h3>
              <p className="text-sm text-gray-500 font-bold">أضف YAI إلى شاشتك الرئيسية للوصول السريع وتنبيهات المهام الذكية.</p>
              <div className="space-y-4 text-right">
                 <div className="flex items-center gap-3 flex-row-reverse"><span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">1</span><p className="text-sm font-bold">افتح قائمة المشاركة في متصفحك.</p></div>
                 <div className="flex items-center gap-3 flex-row-reverse"><span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">2</span><p className="text-sm font-bold">اختر "إضافة إلى الشاشة الرئيسية".</p></div>
              </div>
              <button onClick={() => setShowInstallModal(false)} className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black active-scale">حسناً، فهمت</button>
           </div>
        </div>
      )}
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<YAIApp />);
