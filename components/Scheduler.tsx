import React, { useState, useEffect } from 'react';
import { Icon } from './Icons';
import { Task } from '../types';

export const Scheduler: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('yai_tasks');
    return saved ? JSON.parse(saved) : [
      { id: '1', text: 'مراجعة أهداف اليوم مع YAI', completed: false, time: '09:00', isRecurring: true },
      { id: '2', text: 'تحليل مشاريع البرمجة المعلقة', completed: false, time: '14:30', isRecurring: false }
    ];
  });
  
  const [newTask, setNewTask] = useState('');
  const [newTime, setNewTime] = useState('12:00');
  const [isRecurring, setIsRecurring] = useState(false);

  useEffect(() => {
    localStorage.setItem('yai_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const task: Task = {
      id: Date.now().toString(),
      text: newTask,
      completed: false,
      time: newTime,
      isRecurring: isRecurring
    };
    setTasks([...tasks, task]);
    setNewTask('');
    setIsRecurring(false);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500 py-4 pb-24">
      <header className="px-1 text-right">
         <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">المساعد اليومي والمهام</h2>
         <p className="text-gray-500 dark:text-chatgpt-secondaryText text-[14px]">نظم وقتك ودع YAI يذكرك بالمهام المتكررة.</p>
      </header>

      <div className="bg-gray-50 dark:bg-[#1a1a1a] rounded-3xl border border-gray-200 dark:border-white/5 overflow-hidden shadow-sm">
         <div className="p-5 border-b border-gray-200 dark:border-white/5 flex items-center justify-between flex-row-reverse">
            <h3 className="font-semibold text-[15px] flex items-center gap-2 text-gray-900 dark:text-white flex-row-reverse">
               <Icon name="schedule" size={18} className="text-emerald-500" />
               جدول المواعيد
            </h3>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded-full font-bold">
               {tasks.filter(t => !t.completed).length} مهام معلقة
            </span>
         </div>
         
         <div className="p-1 max-h-[400px] overflow-y-auto custom-scrollbar">
            {tasks.length === 0 ? (
              <div className="p-10 text-center opacity-30">لا توجد مهام حالية</div>
            ) : tasks.map(task => (
               <div key={task.id} className="group flex items-center gap-4 p-4 hover:bg-gray-100 dark:hover:bg-white/5 rounded-2xl transition-all flex-row-reverse text-right">
                  <button 
                    onClick={() => toggleTask(task.id)}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 dark:border-white/10'}`}
                  >
                     {task.completed && <Icon name="check" size={14} className="text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                     <p className={`text-[14px] font-bold truncate ${task.completed ? 'line-through text-gray-400 opacity-60' : 'text-gray-900 dark:text-white'}`}>
                        {task.text}
                     </p>
                     <div className="flex items-center gap-3 mt-1 flex-row-reverse">
                        <span className="text-[11px] text-gray-500 flex items-center gap-1 flex-row-reverse">
                           <Icon name="timer" size={12} />
                           {task.time}
                        </span>
                        {task.isRecurring && (
                          <span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md font-bold flex items-center gap-1">
                             <Icon name="refresh" size={10} />
                             يومي
                          </span>
                        )}
                     </div>
                  </div>
                  <button onClick={() => removeTask(task.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                     <Icon name="delete" size={18} />
                  </button>
               </div>
            ))}
         </div>

         <form onSubmit={addTask} className="p-5 bg-white dark:bg-[#0f0f0f] border-t border-gray-200 dark:border-white/5 space-y-4">
            <div className="flex items-center gap-2 flex-row-reverse">
               <input 
                  value={newTask}
                  onChange={e => setNewTask(e.target.value)}
                  placeholder="أضف مهمة جديدة..."
                  className="flex-1 bg-gray-50 dark:bg-white/5 border-none rounded-xl text-[14px] py-3 px-4 outline-none text-gray-900 dark:text-white text-right"
               />
            </div>
            <div className="flex items-center justify-between flex-row-reverse">
               <div className="flex items-center gap-4 flex-row-reverse">
                  <input 
                    type="time" 
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    className="bg-gray-50 dark:bg-white/5 border-none rounded-lg text-xs py-1.5 px-3 text-emerald-500 font-bold outline-none"
                  />
                  <button 
                    type="button"
                    onClick={() => setIsRecurring(!isRecurring)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${isRecurring ? 'bg-emerald-500 text-white shadow-md' : 'bg-gray-50 dark:bg-white/5 text-gray-400 border border-gray-100 dark:border-white/5'}`}
                  >
                     <Icon name="refresh" size={14} />
                     تكرار يومي
                  </button>
               </div>
               <button type="submit" className="bg-black dark:bg-white text-white dark:text-black w-10 h-10 rounded-xl flex items-center justify-center shadow-lg active-scale">
                  <Icon name="add" size={24} />
               </button>
            </div>
         </form>
      </div>

      <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl flex items-center gap-4 flex-row-reverse text-right">
         <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/20">
            <Icon name="auto_fix" size={24} />
         </div>
         <div className="flex-1">
            <h4 className="font-black text-sm text-emerald-600 dark:text-emerald-400">التذكير الذكي نشط</h4>
            <p className="text-[11px] text-emerald-600/70 dark:text-emerald-400/60 font-medium leading-relaxed">سوف يقوم YAI بإرسال تنبيه في المواعيد المحددة أعلاه تلقائياً.</p>
         </div>
      </div>
    </div>
  );
};
