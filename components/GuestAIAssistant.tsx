import React, { useState } from 'react';
import { MessageCircle, X, Send, Bot, Sparkles } from 'lucide-react';
import { MenuItem, RoomCategory, TaskType, TaskPriority } from '../types';

interface GuestAIAssistantProps {
  menu: MenuItem[];
  categories: RoomCategory[];
  availableRoomsCount: number;
  onServiceRequest: (roomNumber: string, type: TaskType, details: string, priority: TaskPriority) => void;
}

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
  };

  return (
    <>
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
                </div>
              </div>
            )}
          </div>

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
          </div>
        </div>
      )}
    </>
  );
};

export default GuestAIAssistant;
