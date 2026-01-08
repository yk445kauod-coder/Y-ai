import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Message } from '../types';
import { Mermaid } from './Mermaid';
import { Icon } from './Icons';
import { AppSandbox } from './AppSandbox';

interface MessageBubbleProps {
  message: Message;
  onRegenerate?: () => void;
  onFixApp?: (error: string, code: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onRegenerate, onFixApp }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [activeSandboxHtml, setActiveSandboxHtml] = useState<string | null>(null);

  const isRTL = useMemo(() => {
    const rtlChars = /[\u0600-\u06FF]/;
    return rtlChars.test(message.content);
  }, [message.content]);

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    const lang = match ? match[1] : '';
    const code = String(children).replace(/\n$/, '');
    const [blockCopied, setBlockCopied] = useState(false);

    if (!inline && lang) {
      if (lang === 'mermaid') return <Mermaid chart={code} />;
      
      const isRunnable = ['html', 'typescript', 'tsx', 'ts', 'javascript', 'js'].includes(lang);

      if (isRunnable) {
        return (
          <div className="my-4 space-y-2 direction-ltr" dir="ltr">
            <div className="rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/5 p-5 flex flex-col gap-4">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-lg">
                     <Icon name="play_arrow" size={24} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-black text-sm tracking-tight text-emerald-600 dark:text-emerald-400 uppercase">تطبيق جاهز للتشغيل</h4>
                    <p className="text-[10px] opacity-60 font-bold">Neutral Sandbox Environment Enabled</p>
                  </div>
               </div>
               <button onClick={() => setActiveSandboxHtml(code)} className="w-full py-3 bg-emerald-500 text-white rounded-[1.2rem] font-black text-sm shadow-xl active-scale transition-all hover:bg-emerald-600">
                  تشغيل التطبيق الآن
               </button>
            </div>
            
            <div className="group relative rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/40 overflow-hidden">
               <div className="flex items-center justify-between px-4 py-2 bg-gray-100/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                 <span className="text-[9px] uppercase font-black tracking-widest text-gray-400">{lang}</span>
                 <button onClick={() => { navigator.clipboard.writeText(code); setBlockCopied(true); setTimeout(() => setBlockCopied(false), 2000); }} className="text-gray-400 hover:text-emerald-500">
                   <Icon name={blockCopied ? 'check' : 'content_copy'} size={14} />
                 </button>
               </div>
               <div className="p-5 overflow-x-auto custom-scrollbar">
                 <code className="text-[12px] font-mono leading-relaxed text-gray-800 dark:text-gray-200" {...props}>{children}</code>
               </div>
            </div>
          </div>
        );
      }

      return (
        <div className="group relative my-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/20 overflow-hidden direction-ltr" dir="ltr">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-100/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
            <span className="text-[9px] uppercase font-black tracking-widest text-gray-400">{lang}</span>
            <button onClick={() => { navigator.clipboard.writeText(code); setBlockCopied(true); setTimeout(() => setBlockCopied(false), 2000); }} className="text-gray-400 hover:text-emerald-500">
              <Icon name={blockCopied ? 'check' : 'content_copy'} size={14} />
            </button>
          </div>
          <div className="p-5 overflow-x-auto custom-scrollbar">
            <code className="text-[12px] font-mono leading-relaxed text-gray-800 dark:text-gray-200" {...props}>{children}</code>
          </div>
        </div>
      );
    }
    return <code className="bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-[13px] font-mono font-bold" {...props}>{children}</code>;
  };

  return (
    <>
      <div className={`flex w-full group/bubble animate-in fade-in slide-in-from-bottom-2 duration-500 ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div className={`flex gap-4 max-w-[98%] md:max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          {!isUser && (
            <div className="flex-shrink-0 mt-1 hidden sm:block">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-black dark:bg-white shadow-lg rotate-3 group-hover/bubble:rotate-0 transition-transform">
                <span className="text-[16px] font-black text-white dark:text-black italic">Y</span>
              </div>
            </div>
          )}
          
          <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} flex-1 min-w-0`}>
            <div 
              dir={isRTL ? 'rtl' : 'ltr'}
              className={`transition-all ${isUser ? 'bg-gray-100 dark:bg-white/10 px-5 py-3.5 rounded-[1.8rem] rounded-tr-sm text-black dark:text-white shadow-sm' : 'text-gray-800 dark:text-[#ececec] w-full px-1'}`}
            >
              <div className={`text-[16px] leading-[1.7] markdown-content ${message.isError ? 'text-red-500 font-black' : 'font-medium'}`}>
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm, remarkMath]} 
                  rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
                  components={{ code: CodeBlock }}
                >
                  {message.content + (message.isStreaming ? ' ▎' : '')}
                </ReactMarkdown>
              </div>

              {message.images && message.images.length > 0 && (
                <div className="grid grid-cols-1 gap-4 mt-8">
                  {message.images.map((img, idx) => (
                    <div key={idx} className="relative group/img rounded-[2rem] overflow-hidden border border-gray-100 dark:border-white/5 shadow-2xl max-w-sm mx-auto sm:mx-0 animate-in zoom-in duration-500">
                      <img src={img} alt="Generated Asset" className="w-full h-auto" />
                      <a href={img} download={`yai-art-${idx}.png`} className="absolute top-6 right-6 p-4 bg-black/40 backdrop-blur-xl rounded-2xl text-white opacity-0 group-hover/img:opacity-100 transition-opacity active-scale">
                        <Icon name="download" size={24} />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!isUser && !message.isError && !message.isStreaming && (
              <div className={`flex items-center gap-1 mt-3 opacity-0 group-hover/bubble:opacity-100 transition-all ${isRTL ? 'flex-row-reverse' : ''}`}>
                <button onClick={handleCopyMessage} className="p-2.5 text-gray-400 hover:text-black dark:hover:text-white transition-colors active-scale"><Icon name={copied ? 'check' : 'content_copy'} size={14} /></button>
                <button onClick={() => setFeedback('up')} className={`p-2.5 active-scale ${feedback === 'up' ? 'text-emerald-500' : 'text-gray-400'}`}><Icon name="thumb_up" size={14} /></button>
                <button onClick={() => setFeedback('down')} className={`p-2.5 active-scale ${feedback === 'down' ? 'text-red-500' : 'text-gray-400'}`}><Icon name="thumb_down" size={14} /></button>
                {onRegenerate && (
                  <button onClick={onRegenerate} className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-black text-gray-400 hover:text-emerald-500 transition-colors bg-gray-50 dark:bg-white/5 rounded-xl ml-2 active-scale">
                    <Icon name="refresh" size={14} />
                    إعادة التوليد
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {activeSandboxHtml && (
        <AppSandbox 
          html={activeSandboxHtml} 
          onClose={() => setActiveSandboxHtml(null)} 
          onFixApp={onFixApp ? (err) => onFixApp(err, activeSandboxHtml) : undefined}
        />
      )}
    </>
  );
};