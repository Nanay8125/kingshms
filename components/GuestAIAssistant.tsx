<<<<<<< HEAD

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, User, MessageSquare, Loader2, BellRing } from 'lucide-react';
import { getGuestAssistantResponse } from '../services/geminiService';
import { MenuItem, RoomCategory, TaskPriority, TaskType } from '../types';
=======
import React, { useState } from 'react';
import { MessageCircle, X, Send, Bot, Sparkles } from 'lucide-react';
import { MenuItem, RoomCategory, TaskType, TaskPriority } from '../types';
>>>>>>> gh-pages-local

interface GuestAIAssistantProps {
  menu: MenuItem[];
  categories: RoomCategory[];
  availableRoomsCount: number;
  onServiceRequest: (roomNumber: string, type: TaskType, details: string, priority: TaskPriority) => void;
}

<<<<<<< HEAD
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
=======
const GuestAIAssistant: React.FC<GuestAIAssistantProps> = ({
  menu,
  categories,
  availableRoomsCount,
  onServiceRequest
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: "Hello! I'm your AI concierge. How can I assist you today?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: input,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I'd be happy to help with that! Let me check our current availability.",
        "Great question! We have several room categories available.",
        "Our restaurant offers a variety of cuisines. Would you like me to show you the menu?",
        "I can help arrange additional services for your stay. What do you need?",
        "Let me connect you with our concierge service for personalized assistance."
      ];

      const botResponse = {
        id: (Date.now() + 1).toString(),
        text: responses[Math.floor(Math.random() * responses.length)],
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
>>>>>>> gh-pages-local
  };

  return (
    <>
<<<<<<< HEAD
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
=======
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open AI concierge chat"
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl shadow-indigo-900/20 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center z-50"
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-3xl shadow-2xl shadow-slate-900/10 border border-slate-200 flex flex-col z-50">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">AI Concierge</h3>
                <p className="text-xs text-slate-400 font-medium">Always here to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close AI concierge chat"
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X size={16} className="text-slate-400" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                    message.isBot
                      ? 'bg-slate-100 text-slate-700'
                      : 'bg-indigo-600 text-white'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-100 p-4 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    </div>
                    <span className="text-xs text-slate-500">AI is typing...</span>
                  </div>
>>>>>>> gh-pages-local
                </div>
              </div>
            )}
          </div>

<<<<<<< HEAD
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
=======
          {/* Quick Actions */}
          <div className="px-6 pb-4">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setInput("I'd like to see the menu")}
                className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-200 transition-colors"
              >
                View Menu
              </button>
              <button
                onClick={() => setInput("What rooms are available?")}
                className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-200 transition-colors"
              >
                Room Info
              </button>
              <button
                onClick={() => setInput("I need housekeeping")}
                className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-200 transition-colors"
              >
                Services
              </button>
            </div>
          </div>

          {/* Input */}
          <div className="p-6 border-t border-slate-100">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                aria-label="Send message"
                className="px-4 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </button>
            </div>
>>>>>>> gh-pages-local
          </div>
        </div>
      )}
    </>
  );
};

export default GuestAIAssistant;
