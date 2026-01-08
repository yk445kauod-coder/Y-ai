import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icons';

interface SandboxError {
  message: string;
  line?: number;
  column?: number;
  type: 'runtime' | 'transpile' | 'promise' | 'console';
  stack?: string;
}

interface AppSandboxProps {
  html: string;
  onClose: () => void;
  onFixApp?: (error: string) => void;
}

export const AppSandbox: React.FC<AppSandboxProps> = ({ html, onClose, onFixApp }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<SandboxError | null>(null);
  const [finalDoc, setFinalDoc] = useState<string | null>(null);
  const [sandboxKey, setSandboxKey] = useState(0); // For resetting the sandbox
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const prepareDoc = async () => {
      setError(null);
      try {
        let content = html;
        const isFullHtml = /<html/i.test(html) || /<!DOCTYPE/i.test(html);

        // If it's just a code block (TS/TSX/JS), wrap it and transpile
        if (!isFullHtml) {
          try {
            const transformed = (window as any).Babel.transform(html, {
              presets: ['typescript', 'react'],
              filename: 'index.tsx'
            }).code;

            content = `
              <!DOCTYPE html>
              <html lang="en">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <script type="importmap">
                  {
                    "imports": {
                      "react": "https://esm.sh/react@^19.2.3",
                      "react-dom": "https://esm.sh/react-dom@^19.2.3",
                      "react-dom/client": "https://esm.sh/react-dom@^19.2.3/client"
                    }
                  }
                  </script>
                  <script src="https://cdn.tailwindcss.com"></script>
                  <style>
                    body { margin: 0; padding: 0; overflow-x: hidden; }
                    #root { min-height: 100vh; }
                  </style>
                </head>
                <body class="bg-white dark:bg-[#111]">
                  <div id="root"></div>
                  <script type="module">
                    ${transformed}
                  </script>
                </body>
              </html>
            `;
          } catch (babelErr: any) {
            setError({
              message: babelErr.message,
              type: 'transpile',
              stack: babelErr.stack
            });
            return;
          }
        }

        // Robust Error Catcher for Runtime
        const errorCatcher = `
          <script>
            (function() {
              const reportError = (data) => {
                window.parent.postMessage({ 
                  type: 'sandbox-error', 
                  payload: data 
                }, '*');
              };

              window.onerror = function(message, source, lineno, colno, error) {
                reportError({
                  message: message,
                  line: lineno,
                  column: colno,
                  type: 'runtime',
                  stack: error ? error.stack : ''
                });
                return false;
              };
              
              window.onunhandledrejection = function(event) {
                reportError({
                  message: 'Unhandled Promise: ' + (event.reason?.message || event.reason),
                  type: 'promise',
                  stack: event.reason?.stack || ''
                });
              };

              const originalConsoleError = console.error;
              console.error = function(...args) {
                const msg = args.map(arg => 
                  typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
                ).join(' ');
                
                // Avoid infinite loops if reporting fails
                if (!msg.includes('sandbox-error')) {
                  reportError({
                    message: msg,
                    type: 'console'
                  });
                }
                originalConsoleError.apply(console, args);
              };
            })();
          </script>
        `;

        if (content.includes('<head>')) {
          content = content.replace('<head>', `<head>${errorCatcher}`);
        } else if (content.includes('<html>')) {
          content = content.replace('<html>', `<html><head>${errorCatcher}</head>`);
        } else {
          content = `<!DOCTYPE html><html><head>${errorCatcher}</head><body>${content}</body></html>`;
        }

        setFinalDoc(content);
      } catch (err: any) {
        setError({
          message: "Internal Preparation Error: " + err.message,
          type: 'runtime'
        });
      }
    };

    prepareDoc();
  }, [html, sandboxKey]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'sandbox-error') {
        setError(event.data.payload);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleFix = () => {
    if (error && onFixApp) {
      const errorContext = `[${error.type.toUpperCase()}] ${error.message}${error.line ? ` (Line: ${error.line}:${error.column})` : ''}`;
      onFixApp(errorContext);
      onClose();
    }
  };

  const resetSandbox = () => {
    setSandboxKey(prev => prev + 1);
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300 ${isFullscreen ? 'p-0' : ''}`}>
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />
      
      <div className={`bg-white dark:bg-[#0a0a0a] w-full h-full rounded-[2.5rem] overflow-hidden shadow-4xl relative z-10 flex flex-col border border-white/10 ${isFullscreen ? 'rounded-none border-none' : ''}`}>
        <header className="h-16 px-6 bg-white dark:bg-[#111] border-b border-gray-100 dark:border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <Icon name="play_arrow" size={24} />
             </div>
             <div className="hidden sm:block">
                <h3 className="font-black text-sm tracking-tight dark:text-white">YAI Sandbox v2</h3>
                <p className="text-[9px] opacity-40 uppercase tracking-widest font-black dark:text-white">Execution Environment</p>
             </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={resetSandbox} 
              className="p-2.5 text-gray-400 hover:text-emerald-500 transition-all hover:bg-emerald-500/10 rounded-xl flex items-center gap-2"
              title="إعادة التشغيل"
            >
              <Icon name="refresh" size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Reset</span>
            </button>
            <div className="w-px h-6 bg-gray-200 dark:bg-white/10 mx-1" />
            <button 
              onClick={() => setIsFullscreen(!isFullscreen)} 
              className="p-2.5 text-gray-400 hover:text-white transition-all hover:bg-white/10 rounded-xl"
            >
              <Icon name={isFullscreen ? "fullscreen_exit" : "fullscreen"} size={22} />
            </button>
            <button 
              onClick={onClose} 
              className="p-2.5 text-gray-400 hover:text-red-500 transition-all hover:bg-red-500/10 rounded-xl"
            >
              <Icon name="close" size={22} />
            </button>
          </div>
        </header>

        <div className="flex-1 relative bg-white dark:bg-black">
          {finalDoc && !error?.type?.includes('transpile') && (
            <iframe 
              key={sandboxKey}
              ref={iframeRef}
              srcDoc={finalDoc}
              title="Application Sandbox"
              className="w-full h-full border-none"
              sandbox="allow-scripts allow-forms allow-popups allow-modals allow-same-origin"
            />
          )}
          
          {error && (
            <div className="absolute inset-0 z-50 flex items-end p-6 pointer-events-none">
              <div className="w-full max-w-2xl mx-auto bg-[#1a1a1a]/95 backdrop-blur-2xl shadow-4xl rounded-[2.5rem] border border-red-500/30 text-white animate-in slide-in-from-bottom-12 duration-500 pointer-events-auto overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/20">
                        <Icon name="error" size={24} />
                      </div>
                      <div>
                        <h4 className="font-black text-sm tracking-tight text-red-400 uppercase">Sandbox Exception</h4>
                        <p className="text-[9px] opacity-60 font-black tracking-widest uppercase">Type: {error.type}</p>
                      </div>
                    </div>
                    <button onClick={() => setError(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                      <Icon name="close" size={20} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="p-5 bg-black/40 rounded-2xl border border-white/5 font-mono text-[12px] leading-relaxed break-all">
                      <div className="text-red-400 font-bold mb-1">
                        {error.message}
                      </div>
                      {error.line && (
                        <div className="text-[10px] text-gray-500 mb-2">
                          Location: line {error.line}, column {error.column}
                        </div>
                      )}
                      {error.stack && (
                        <div className="mt-4 pt-4 border-t border-white/5 text-[10px] text-gray-600 overflow-x-auto max-h-[120px] custom-scrollbar whitespace-pre-wrap">
                          {error.stack}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={handleFix}
                        className="flex-1 py-4 bg-white text-black font-black text-[13px] rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98]"
                      >
                        <Icon name="auto_fix" size={20} /> 
                        Repair Logic
                      </button>
                      <button 
                        onClick={resetSandbox}
                        className="px-6 py-4 bg-white/10 text-white font-black text-[13px] rounded-2xl hover:bg-white/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                      >
                        <Icon name="refresh" size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!finalDoc && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/5 dark:bg-white/5">
               <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Initializing Environment...</p>
            </div>
          )}
        </div>

        {!isFullscreen && (
          <footer className="h-10 px-8 flex items-center justify-between text-[9px] font-black text-gray-500 bg-white dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-white/5 uppercase tracking-[0.2em] shrink-0">
             <span>Security: Isolated Node</span>
             <span className="opacity-40 italic">Neural Engine Sandbox</span>
          </footer>
        )}
      </div>
    </div>
  );
};
