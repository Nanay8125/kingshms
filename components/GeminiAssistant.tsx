
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, MessageSquare } from 'lucide-react';
import { getHotelAssistantResponse } from '../services/geminiService';
import { Room, Booking, Guest } from '../types';

interface GeminiAssistantProps {
  context: { rooms: Room[]; bookings: Booking[]; guests: Guest[] };
}

const GeminiAssistant: React.FC<GeminiAssistantProps> = ({ context }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Hello! I am your AI Operations Assistant. How can I help you manage LuxeStay today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const response = await getHotelAssistantResponse(userMsg, context);
    setMessages(prev => [...prev, { role: 'bot', text: response || "Something went wrong." }]);
    setIsLoading(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-indigo-700 transition-all z-40 group"
      >
        <Sparkles size={24} className="group-hover:scale-110 transition-transform" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-8 w-96 h-[500px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-indigo-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Bot size={24} />
              </div>
              <div>
                <h4 className="font-bold text-sm">LuxeAI Concierge</h4>
                <p className="text-[10px] text-indigo-100 uppercase tracking-widest font-semibold">Active Assistant</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} aria-label="Close AI assistant" className="hover:bg-white/10 p-1 rounded-lg">
              <X size={20} />
            </button>
          </div>

          <div 
            ref={scrollRef}
            className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50"
          >
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  m.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                  <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" />
                  <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-100 bg-white">
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about rooms, occupancy..."
                className="flex-1 bg-transparent border-none focus:outline-none px-3 py-2 text-sm text-slate-700"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading}
                className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="text-[10px] text-center text-slate-400 mt-2">Powered by Gemini AI Operations Engine</p>
          </div>
        </div>
      )}
    </>
  );
};

export default GeminiAssistant;
