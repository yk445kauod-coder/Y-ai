import React, { useState } from 'react';
import { Icon } from './Icons';

export const Auth: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-chatgpt-bg flex flex-col items-center justify-center p-6 text-gray-900 dark:text-chatgpt-text transition-colors">
      <div className="w-full max-w-sm space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black dark:bg-white rounded-full shadow-lg mb-6">
            <span className="text-4xl font-black text-white dark:text-black italic">Y</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Welcome to YAI</h1>
          <p className="text-gray-500 dark:text-chatgpt-secondaryText text-[14px]">The future of intelligent assistance.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <Icon name="mail" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-chatgpt-secondaryText" />
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-gray-50 dark:bg-chatgpt-userMsg border border-gray-200 dark:border-chatgpt-border rounded-2xl py-3.5 pl-12 pr-4 focus:ring-1 focus:ring-chatgpt-accent outline-none transition-all text-[15px] dark:text-white"
                placeholder="Email address"
                required
              />
            </div>
            <div className="relative">
              <Icon name="lock" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-chatgpt-secondaryText" />
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-gray-50 dark:bg-chatgpt-userMsg border border-gray-200 dark:border-chatgpt-border rounded-2xl py-3.5 pl-12 pr-4 focus:ring-1 focus:ring-chatgpt-accent outline-none transition-all text-[15px] dark:text-white"
                placeholder="Password"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-3.5 rounded-2xl hover:opacity-90 transition-all active:scale-[0.98] mt-2 shadow-md"
          >
            Continue
          </button>

          <div className="text-center pt-2">
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-gray-500 dark:text-chatgpt-secondaryText hover:text-black dark:hover:text-white transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
            </button>
          </div>
        </form>

        <div className="flex flex-col items-center gap-6">
           <div className="w-full h-px bg-gray-100 dark:bg-chatgpt-border" />
           <p className="text-[11px] text-gray-400 dark:text-chatgpt-secondaryText font-medium">Terms of Use | Privacy Policy</p>
        </div>
      </div>
    </div>
  );
};