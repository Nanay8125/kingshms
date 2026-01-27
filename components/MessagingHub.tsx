
import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Search, 
  User, 
  Bot, 
  Send, 
  Languages, 
  Sparkles, 
  Loader2, 
  CheckCheck, 
  ChevronRight,
  UserCircle,
  MoreVertical,
  Clock
} from 'lucide-react';
import { Conversation, ChatMessage } from '../types';
import { generateChatSuggestions, translateText } from '../services/geminiService';

interface MessagingHubProps {
  conversations: Conversation[];
  onSendMessage: (conversationId: string, text: string) => void;
<<<<<<< HEAD
}

const MessagingHub: React.FC<MessagingHubProps> = ({ conversations, onSendMessage }) => {
  const [selectedId, setSelectedId] = useState<string | null>(conversations[0]?.id || null);
  const [inputText, setInputText] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

=======
  onMarkAsRead?: (conversationId: string) => void;
  currentLanguage?: string;
}

const MessagingHub: React.FC<MessagingHubProps> = ({ 
  conversations, 
  onSendMessage, 
  onMarkAsRead,
  currentLanguage = 'en'
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(conversations[0]?.id || null);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [translations, setTranslations] = useState<{ [key: string]: string }>({});
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const filteredConversations = conversations.filter(c => {
    const matchesSearch = c.guestName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         c.roomNumber.includes(searchQuery);
    const matchesFilter = filter === 'all' || (filter === 'unread' && c.unreadCount > 0);
    return matchesSearch && matchesFilter;
  });

>>>>>>> gh-pages-local
  const selectedConversation = conversations.find(c => c.id === selectedId);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    if (selectedConversation) {
      fetchSuggestions(selectedConversation);
<<<<<<< HEAD
=======
      if (selectedConversation.unreadCount > 0 && onMarkAsRead) {
        onMarkAsRead(selectedConversation.id);
      }
>>>>>>> gh-pages-local
    }
  }, [selectedId, selectedConversation?.messages.length]);

  const fetchSuggestions = async (conv: Conversation) => {
    setIsSuggesting(true);
<<<<<<< HEAD
    const suggestions = await generateChatSuggestions(conv);
=======
    const suggestions = await generateChatSuggestions(conv.messages);
>>>>>>> gh-pages-local
    setAiSuggestions(suggestions);
    setIsSuggesting(false);
  };

  const handleSend = () => {
    if (!inputText.trim() || !selectedId) return;
    onSendMessage(selectedId, inputText);
    setInputText('');
  };

  const handleTranslate = async (msgId: string, text: string) => {
<<<<<<< HEAD
    const translated = await translateText(text);
    // In a real app, you'd update state here. 
    // For this demo, we'll just show it in a temporary alert or logic.
    alert(`Translation: ${translated}`);
=======
    if (translations[msgId]) {
        // Toggle off if already translated
        const newTranslations = { ...translations };
        delete newTranslations[msgId];
        setTranslations(newTranslations);
        return;
    }

    const translated = await translateText(text, currentLanguage);
    setTranslations(prev => ({ ...prev, [msgId]: translated }));
>>>>>>> gh-pages-local
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
      {/* Sidebar */}
      <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/30">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-xl font-black text-slate-800 mb-4">Guest Messages</h3>
<<<<<<< HEAD
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
=======
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search conversations..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setFilter('all')}
                className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors ${
                  filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              <button 
                onClick={() => setFilter('unread')}
                className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors ${
                  filter === 'unread' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                Unread
              </button>
            </div>
>>>>>>> gh-pages-local
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
<<<<<<< HEAD
          {conversations.map(conv => (
=======
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <p className="text-xs">No conversations found</p>
            </div>
          ) : (
            filteredConversations.map(conv => (
>>>>>>> gh-pages-local
            <button
              key={conv.id}
              onClick={() => setSelectedId(conv.id)}
              className={`w-full p-4 flex items-start gap-3 transition-all hover:bg-white border-b border-slate-100/50 ${
                selectedId === conv.id ? 'bg-white shadow-sm' : ''
              }`}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black">
                  {conv.guestName.charAt(0)}
                </div>
                {conv.unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-slate-50">
                    {conv.unreadCount}
                  </div>
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm font-bold text-slate-800">{conv.guestName}</span>
                  <span className="text-[10px] text-slate-400 font-medium">Room {conv.roomNumber}</span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-1">{conv.lastMessage}</p>
              </div>
            </button>
<<<<<<< HEAD
          ))}
=======
            ))
          )}
>>>>>>> gh-pages-local
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedConversation ? (
          <>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                  <User size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{selectedConversation.guestName}</h4>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">In Room {selectedConversation.roomNumber}</span>
                  </div>
                </div>
              </div>
              <button className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50">
                <MoreVertical size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
              {selectedConversation.messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'guest' ? 'justify-start' : 'justify-end'} group`}>
                  <div className={`max-w-[70%] flex flex-col ${msg.sender === 'guest' ? 'items-start' : 'items-end'}`}>
                    <div className={`p-4 rounded-[24px] text-sm leading-relaxed shadow-sm relative ${
                      msg.sender === 'guest' 
                        ? 'bg-white text-slate-700 border border-slate-100 rounded-tl-none' 
                        : 'bg-indigo-600 text-white rounded-tr-none'
                    }`}>
                      {msg.text}
<<<<<<< HEAD
                      {msg.sender === 'guest' && (
                        <button 
                          onClick={() => handleTranslate(msg.id, msg.text)}
                          className="absolute -right-10 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-all"
=======
                      {translations[msg.id] && (
                        <div className="mt-2 pt-2 border-t border-slate-100/50 text-indigo-500 text-xs font-medium">
                          {translations[msg.id]}
                        </div>
                      )}
                      {msg.sender === 'guest' && (
                        <button 
                          onClick={() => handleTranslate(msg.id, msg.text)}
                          className={`absolute -right-10 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all ${
                            translations[msg.id] ? 'text-indigo-600 bg-indigo-50' : 'text-slate-300 hover:text-indigo-500 opacity-0 group-hover:opacity-100'
                          }`}
>>>>>>> gh-pages-local
                          title="Translate message"
                        >
                          <Languages size={14} />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                       {msg.sender === 'staff' && <CheckCheck size={12} className="text-indigo-400" />}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-6 border-t border-slate-100 space-y-4 bg-white">
              {/* AI Suggestions */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Bot size={18} />
                </div>
                <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar">
                  {isSuggesting ? (
                    <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest py-2">
                      <Loader2 size={12} className="animate-spin" /> Gemini is thinking...
                    </div>
                  ) : (
                    aiSuggestions.map((s, i) => (
                      <button 
                        key={i} 
                        onClick={() => setInputText(s)}
                        className="px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all whitespace-nowrap"
                      >
                        {s}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Input Area */}
              <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-[24px] border border-slate-100">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message to the guest..."
                  className="flex-1 bg-transparent border-none focus:outline-none px-4 py-2 text-sm font-medium text-slate-700"
                />
                <button 
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="w-12 h-12 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center shadow-lg shadow-indigo-900/10"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
            <MessageSquare size={64} className="mb-4 opacity-10" />
            <p className="font-bold">Select a guest to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingHub;
