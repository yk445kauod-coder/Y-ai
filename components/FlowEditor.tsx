import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Icon } from './Icons';
import { Node, Connection, AgentFlow, NodeType } from '../types';

interface FlowEditorProps {
  onSave: (flow: AgentFlow) => void;
  onClose?: () => void;
}

const CATEGORIES = [
  { id: 'ai', label: 'الذكاء الاصطناعي', color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { id: 'tools', label: 'الأدوات والربط', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'logic', label: 'المنطق والتحكم', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
];

const NODE_DEFS: Array<{ type: NodeType; icon: string; label: string; color: string; category: string; description: string }> = [
  { type: 'trigger', icon: 'bolt', label: 'محفز البداية', color: 'bg-emerald-500', category: 'logic', description: 'يبدأ التدفق عند استلام رسالة' },
  { type: 'ai_agent', icon: 'psychology', label: 'وكيل ذكي (Agent)', color: 'bg-orange-600', category: 'ai', description: 'يحلل وينفذ مهام مستقلة' },
  { type: 'ai_chain', icon: 'account_tree', label: 'تسلسل منطقي', color: 'bg-amber-500', category: 'ai', description: 'تفكير خطوة بخطوة' },
  { type: 'image_gen', icon: 'image', label: 'مولد صور', color: 'bg-pink-500', category: 'ai', description: 'إنشاء أصول مرئية' },
  { type: 'google_search', icon: 'language', label: 'بحث ويب مباشر', color: 'bg-blue-600', category: 'tools', description: 'الوصول لمعلومات حية' },
  { type: 'http_request', icon: 'api', label: 'طلب API خارجي', color: 'bg-indigo-500', category: 'tools', description: 'ربط بأنظمة خارجية' },
  { type: 'code_exec', icon: 'code', label: 'تنفيذ كود مخصص', color: 'bg-slate-700', category: 'tools', description: 'تشغيل منطق برمجيا' },
  { type: 'memory', icon: 'storage', label: 'ذاكرة الوكيل', color: 'bg-cyan-500', category: 'ai', description: 'حفظ واسترجاع البيانات' },
  { type: 'output', icon: 'send', label: 'النتيجة النهائية', color: 'bg-rose-500', category: 'logic', description: 'إرسال الرد للمستخدم' },
];

export const FlowEditor: React.FC<FlowEditorProps> = ({ onSave, onClose }) => {
  const [nodes, setNodes] = useState<Node[]>([
    { id: 'start', type: 'trigger', position: { x: 50, y: 200 }, data: { label: 'بداية التدفق', config: {} } },
    { id: 'end', type: 'output', position: { x: 800, y: 200 }, data: { label: 'إرسال الرد', config: {} } }
  ]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [name, setName] = useState('تدفق YAI المخصص');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedNode = useMemo(() => nodes.find(n => n.id === selectedNodeId), [nodes, selectedNodeId]);

  const addNode = (def: typeof NODE_DEFS[0]) => {
    const newNode: Node = {
      id: 'node-' + Math.random().toString(36).substr(2, 6),
      type: def.type,
      position: { x: 400, y: 250 },
      data: { label: def.label, config: {} }
    };
    setNodes([...nodes, newNode]);
    setSelectedNodeId(newNode.id);
  };

  const handleMouseDownNode = (id: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === id);
    if (!node || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setDragOffset({ x: e.clientX - rect.left - node.position.x, y: e.clientY - rect.top - node.position.y });
    setDraggingNodeId(id);
    setSelectedNodeId(id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNodeId && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - dragOffset.x;
      const y = e.clientY - rect.top - dragOffset.y;
      setNodes(prev => prev.map(n => n.id === draggingNodeId ? { ...n, position: { x, y } } : n));
    }
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
    setConnectingSourceId(null);
  };

  const finishConnecting = (id: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    if (connectingSourceId && connectingSourceId !== id) {
      const exists = connections.some(c => c.source === connectingSourceId && c.target === id);
      if (!exists) setConnections([...connections, { id: `conn-${Date.now()}`, source: connectingSourceId, target: id }]);
    }
    setConnectingSourceId(null);
  };

  const removeNode = (id: string) => {
    if (id === 'start' || id === 'end') return;
    setNodes(nodes.filter(n => n.id !== id));
    setConnections(connections.filter(c => c.source !== id && c.target !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  const updateNodeConfig = (nodeId: string, key: string, value: any) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, data: { ...n.data, config: { ...n.data.config, [key]: value } } } : n));
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] dark:bg-[#080808] text-gray-900 dark:text-white overflow-hidden animate-in fade-in duration-500">
      <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 dark:border-white/5 bg-white/80 dark:bg-black/80 backdrop-blur-xl z-30">
         <div className="flex items-center gap-6">
           <button onClick={onClose} className="p-2.5 bg-gray-50 dark:bg-white/5 rounded-2xl active-scale"><Icon name="arrow_forward" size={24} /></button>
           <div className="flex flex-col">
             <input value={name} onChange={e => setName(e.target.value)} className="bg-transparent font-black text-xl outline-none" placeholder="اسم التدفق" />
             <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">YAI Studio | محرك وكلاء ذكي</span>
           </div>
         </div>
         <div className="flex items-center gap-4">
           <button onClick={() => onSave({ id: Date.now().toString(), name, nodes, connections })} className="bg-emerald-500 text-white px-8 py-3.5 rounded-[1.2rem] font-black text-sm shadow-xl active-scale flex items-center gap-2">
             <Icon name="check" size={20} /> حفظ التدفق
           </button>
         </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <div className="w-[320px] border-l border-gray-100 dark:border-white/5 bg-white dark:bg-[#0d0d0d] p-6 overflow-y-auto custom-scrollbar z-20">
           {CATEGORIES.map(cat => (
             <div key={cat.id} className="mb-10">
                <h4 className={`text-[11px] font-black uppercase tracking-widest mb-4 ${cat.color}`}>{cat.label}</h4>
                <div className="space-y-3">
                   {NODE_DEFS.filter(d => d.category === cat.id).map(def => (
                     <button key={def.type} onClick={() => addNode(def)} className="w-full flex items-center gap-4 p-4 bg-gray-50/50 dark:bg-white/[0.02] rounded-2xl border border-transparent hover:border-emerald-500/20 hover:bg-white dark:hover:bg-white/5 transition-all text-right group active-scale">
                        <div className={`w-10 h-10 ${def.color} rounded-xl flex items-center justify-center text-white shadow-lg`}><Icon name={def.icon} size={18} /></div>
                        <div className="flex-1 min-w-0"><p className="font-black text-[13px]">{def.label}</p></div>
                     </button>
                   ))}
                </div>
             </div>
           ))}
        </div>

        <div ref={canvasRef} className="flex-1 relative overflow-hidden bg-[#f1f5f9] dark:bg-[#080808]" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onClick={() => setSelectedNodeId(null)}>
          <div className="absolute inset-0 opacity-[0.2] dark:opacity-[0.1]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {connections.map((conn) => {
              const start = nodes.find(n => n.id === conn.source);
              const end = nodes.find(n => n.id === conn.target);
              if (!start || !end) return null;
              const x1 = start.position.x + 240, y1 = start.position.y + 40, x2 = end.position.x, y2 = end.position.y + 40;
              const cp1 = x1 + 100, cp2 = x2 - 100;
              return (
                <g key={conn.id} onClick={(e) => { e.stopPropagation(); if(confirm('حذف الرابط؟')) setConnections(prev => prev.filter(c => c.id !== conn.id)); }} className="cursor-pointer pointer-events-auto group">
                  <path d={`M ${x1} ${y1} C ${cp1} ${y1}, ${cp2} ${y2}, ${x2} ${y2}`} stroke="#10a37f" strokeWidth="4" fill="none" className="opacity-40 group-hover:opacity-100 transition-opacity" />
                  <circle cx={(x1+x2)/2} cy={(y1+y2)/2} r="8" fill="#10a37f" className="opacity-0 group-hover:opacity-100" />
                </g>
              );
            })}
          </svg>

          {nodes.map(node => {
            const def = NODE_DEFS.find(t => t.type === node.type);
            const isSelected = selectedNodeId === node.id;
            return (
              <div key={node.id} onMouseDown={handleMouseDownNode(node.id)} onClick={(e) => { e.stopPropagation(); setSelectedNodeId(node.id); }} style={{ left: node.position.x, top: node.position.y }}
                className={`absolute w-[240px] bg-white dark:bg-[#121212] rounded-[1.8rem] border-2 shadow-2xl transition-all cursor-pointer group ${isSelected ? 'border-emerald-500 scale-[1.05] z-30' : 'border-gray-100 dark:border-white/5 hover:border-emerald-500/30 z-10'}`}>
                 <div className={`p-4 flex items-center gap-3 border-b border-gray-50 dark:border-white/5 ${def?.color.replace('text', 'bg').replace('600', '500')}/5`}>
                    <div className={`w-9 h-9 ${def?.color} rounded-xl flex items-center justify-center text-white shadow-lg shrink-0`}><Icon name={def?.icon || 'bolt'} size={18} /></div>
                    <div className="overflow-hidden"><p className="text-[12px] font-black uppercase truncate">{node.data.label}</p></div>
                 </div>
                 <div className="p-3 text-[9px] text-gray-400 font-black text-center opacity-60">ID: {node.id.split('-')[1]}</div>
                 {node.id !== 'start' && <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-black border-[3px] border-emerald-500 rounded-full cursor-crosshair hover:scale-125" onMouseUp={finishConnecting(node.id)} />}
                 {node.id !== 'end' && <div className="absolute right-[-12px] top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-black border-[3px] border-emerald-500 rounded-full cursor-crosshair hover:scale-125" onMouseDown={(e) => { e.stopPropagation(); setConnectingSourceId(node.id); }} />}
              </div>
            );
          })}
        </div>

        <div className={`w-[400px] border-r border-gray-100 dark:border-white/5 bg-white dark:bg-[#0d0d0d] z-40 transform transition-transform duration-500 shadow-4xl ${selectedNodeId ? 'translate-x-0' : 'translate-x-full absolute right-0 top-0 bottom-0'}`}>
          {selectedNode ? (
            <div className="h-full flex flex-col p-8 overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-10">
                 <h3 className="font-black text-2xl tracking-tight">إعدادات العقدة</h3>
                 <button onClick={() => setSelectedNodeId(null)} className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl"><Icon name="close" size={24} /></button>
              </div>
              <div className="space-y-8 text-right">
                 <div>
                    <label className="text-[11px] font-black uppercase text-gray-400 block mb-3">اسم العقدة</label>
                    <input value={selectedNode.data.label} onChange={(e) => setNodes(nodes.map(n => n.id === selectedNodeId ? {...n, data: {...n.data, label: e.target.value}} : n))} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl p-4 text-[15px] outline-none font-bold" />
                 </div>
                 {selectedNode.type === 'ai_agent' && (
                   <div>
                      <label className="text-[11px] font-black uppercase text-gray-400 block mb-3">تعليمات الوكيل (System Prompt)</label>
                      <textarea value={selectedNode.data.config.instruction || ''} onChange={(e) => updateNodeConfig(selectedNode.id, 'instruction', e.target.value)} placeholder="أنت خبير في..." className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl p-5 text-sm min-h-[200px] outline-none resize-none" />
                   </div>
                 )}
                 {selectedNode.type === 'image_gen' && (
                   <div>
                      <label className="text-[11px] font-black uppercase text-gray-400 block mb-3">دقة الصورة</label>
                      <select onChange={(e) => updateNodeConfig(selectedNode.id, 'ratio', e.target.value)} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl p-4 text-sm font-bold">
                         <option value="1:1">1:1 مربع</option>
                         <option value="16:9">16:9 عرضي</option>
                         <option value="9:16">9:16 طولي</option>
                      </select>
                   </div>
                 )}
              </div>
              <div className="mt-auto pt-10">
                 <button onClick={() => removeNode(selectedNode.id)} className="w-full py-5 bg-red-500/10 text-red-500 font-black rounded-[1.5rem] hover:bg-red-500/20 transition-all flex items-center justify-center gap-3">
                    <Icon name="delete" size={20} /> حذف العقدة
                 </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center text-gray-400 font-bold">
               <Icon name="touch_app" size={48} className="mb-6 opacity-20" />
               <p>اختر أي عقدة من ساحة العمل لتعديل خصائصها.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};