
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, User, MessageSquare, Loader2, BellRing } from 'lucide-react';
import { getGuestAssistantResponse } from '../services/geminiService';
import { MenuItem, RoomCategory, TaskPriority, TaskType } from '../types';

interface GuestAIAssistantProps {
  menu: MenuItem[];
  categories: RoomCategory[];
  availableRoomsCount: number;
  onServiceRequest: (roomNumber: string, type: TaskType, details: string, priority: TaskPriority) => void;
}

const GuestAIAssistant: React.FC<GuestAIAssistantProps> = ({ menu, categories, availableRoomsCount, onServiceRequest }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string; isAction?: boolean }[]>([
    { role: 'bot', text: 'Welcome to LuxeStay! I am your AI Concierge. How can I make your stay perfect today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const response = await getGuestAssistantResponse(userMsg, { menu, categories, availableRooms: availableRoomsCount });
    
    if (response.functionCalls) {
      for (const fc of response.functionCalls) {
        if (fc.name === 'request_hotel_service') {
          const { roomNumber, serviceType, details, priority } = fc.args as any;
          const type = serviceType === 'maintenance' ? TaskType.MAINTENANCE : TaskType.SERVICE;
          const p = (priority as TaskPriority) || TaskPriority.MEDIUM;
          
          onServiceRequest(roomNumber, type, details, p);
          
          setMessages(prev => [...prev, { 
            role: 'bot', 
            text: `I've sent a request for ${serviceType} to Room ${roomNumber}. Our staff will be with you shortly.`,
            isAction: true 
          }]);
        }
      }
    }

    if (response.text) {
      setMessages(prev => [...prev, { role: 'bot', text: response.text }]);
    } else if (!response.functionCalls) {
      setMessages(prev => [...prev, { role: 'bot', text: "I'm sorry, I couldn't process that. Can you try rephrasing?" }]);
    }
    
    setIsLoading(false);
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-10 right-10 w-16 h-16 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-indigo-600 transition-all z-[60] group border-4 border-white"
      >
        <Sparkles size={28} className="group-hover:scale-110 transition-transform text-amber-400" />
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
          <span className="text-[10px] font-black">AI</span>
        </div>
      </button>

      {/* Chat Interface */}
      {isOpen && (
        <div className="fixed bottom-28 right-10 w-[400px] h-[600px] bg-white rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] border border-slate-100 flex flex-col overflow-hidden z-[70] animate-in slide-in-from-bottom-8 duration-500">
          <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                <Bot size={28} className="text-amber-400" />
              </div>
              <div>
                <h4 className="font-black text-lg tracking-tight">AI Concierge</h4>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black">Always Online</p>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-colors">
              <X size={20} />
            </button>
          </div>

          <div 
            ref={scrollRef}
            className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/50"
          >
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`max-w-[85%] p-4 rounded-[24px] text-sm leading-relaxed shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-slate-900 text-white rounded-tr-none' 
                    : m.isAction 
                      ? 'bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-tl-none font-bold'
                      : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 p-4 rounded-[24px] rounded-tl-none shadow-sm flex items-center gap-3">
                  <Loader2 className="animate-spin text-indigo-600" size={16} />
                  <span className="text-xs font-bold text-slate-400">Concierge is typing...</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-slate-100 bg-white">
            <div className="flex items-center gap-3 bg-indigo-50/50 p-2 rounded-[24px] border border-indigo-100/50">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask for towels, room types, or dinner..."
                className="flex-1 bg-transparent border-none focus:outline-none px-4 py-2 text-sm font-medium text-slate-700 placeholder:text-slate-400"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="w-10 h-10 bg-slate-900 text-white rounded-xl hover:bg-indigo-600 disabled:opacity-50 transition-all flex items-center justify-center shadow-lg"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest mt-4 opacity-50">LuxeStay Intelligent Guest Service v1.2</p>
          </div>
        </div>
      )}
    </>
  );
};

export default GuestAIAssistant;
