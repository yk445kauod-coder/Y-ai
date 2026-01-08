import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Icon } from './Icons';
import { ToolMode, FileAttachment } from '../types';

interface ChatInputProps {
  onSend: (text: string, files: FileAttachment[]) => void;
  tools: ToolMode[];
  toggleTool: (tool: ToolMode) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, tools, toggleTool, isLoading }) => {
  const [input, setInput] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<FileAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isRTLInput = useMemo(() => {
    const rtlChars = /[\u0600-\u06FF]/;
    return rtlChars.test(input);
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((input.trim() || attachedFiles.length > 0) && !isLoading) {
      onSend(input, attachedFiles);
      setInput('');
      setAttachedFiles([]);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setAttachedFiles(prev => [...prev, {
            name: file.name,
            type: file.type,
            data: ev.target?.result as string
          }]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  return (
    <div className="w-full pb-safe flex flex-col items-center">
      {/* Floating Pill Tool Selector - Styled like screenshot */}
      <div className="flex flex-row-reverse gap-2 mb-4 overflow-x-auto hide-scrollbar pb-1 px-4 max-w-full animate-in slide-in-from-bottom-5 duration-700">
        {[
          { id: ToolMode.Search, icon: 'search', label: 'بحث ويب' },
          { id: ToolMode.Reasoning, icon: 'psychology', label: 'تفكير عميق' },
          { id: ToolMode.Image, icon: 'palette', label: 'توليد صور' },
          { id: ToolMode.Assistant, icon: 'calendar_today', label: 'مساعد' }
        ].map((tool, idx) => (
          <button
            key={tool.id}
            onClick={() => toggleTool(tool.id)}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full text-[13px] font-black transition-all shrink-0 whitespace-nowrap border-2 shadow-sm animate-in fade-in duration-500 ease-out`}
            style={{ 
               animationDelay: `${idx * 100}ms`,
               backgroundColor: tools.includes(tool.id) ? 'black' : 'white',
               color: tools.includes(tool.id) ? 'white' : '#676767',
               borderColor: tools.includes(tool.id) ? 'black' : '#f0f0f0'
            }}
          >
            {tools.includes(tool.id) && <Icon name="check" size={14} className="animate-in zoom-in duration-300" />}
            <Icon name={tool.icon} size={16} />
            {tool.label}
          </button>
        ))}
      </div>

      {attachedFiles.length > 0 && (
        <div className="flex flex-row-reverse gap-2 mb-4 overflow-x-auto hide-scrollbar w-full px-4">
          {attachedFiles.map((f, i) => (
            <div key={i} className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-2xl text-[11px] flex items-center gap-3 shrink-0 animate-in zoom-in duration-300">
              <Icon name="description" size={16} className="text-emerald-500" />
              <span className="truncate max-w-[120px] font-black text-emerald-600 dark:text-emerald-400">{f.name}</span>
              <button onClick={() => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i))} className="p-1 hover:bg-emerald-500/20 rounded-full transition-colors">
                <Icon name="close" size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modern High-Quality Input Bar */}
      <div className="relative w-full bg-white dark:bg-white/[0.08] rounded-[2rem] border-2 border-gray-100 dark:border-white/5 focus-within:border-emerald-500/30 transition-all p-2 flex items-end gap-2 shadow-2xl shadow-black/5 animate-in slide-in-from-bottom-10 duration-1000">
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange} 
          multiple 
        />
        
        <button 
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-emerald-500 transition-colors active-scale bg-gray-50 dark:bg-white/5 rounded-full shrink-0"
        >
          <Icon name="add" size={28} />
        </button>
        
        <textarea
          ref={textareaRef}
          value={input}
          dir={isRTLInput ? 'rtl' : 'ltr'}
          onChange={(e) => setInput(e.target.value)}
          placeholder="تحدث مع YAI..."
          className={`flex-1 bg-transparent border-none focus:ring-0 text-black dark:text-white py-3 px-2 resize-none overflow-y-auto max-h-[150px] outline-none text-[16px] placeholder:text-gray-400 font-bold ${isRTLInput ? 'text-right' : ''}`}
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 768) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />

        <button
          onClick={() => handleSubmit()}
          disabled={isLoading || (!input.trim() && attachedFiles.length === 0)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl shrink-0 active-scale ${
            isLoading || (!input.trim() && attachedFiles.length === 0)
            ? 'bg-gray-100 dark:bg-white/5 text-gray-300 shadow-none' 
            : 'bg-black dark:bg-white text-white dark:text-black'
          }`}
        >
          {isLoading ? (
            <div className="animate-spin h-6 w-6 border-[3px] border-current border-t-transparent rounded-full" />
          ) : (
            <Icon name="arrow_upward" size={26} />
          )}
        </button>
      </div>
      
      <p className="mt-3 text-[10px] text-gray-400 font-black opacity-40 uppercase tracking-widest hidden sm:block">YAI can make mistakes. Verify important info.</p>
    </div>
  );
};