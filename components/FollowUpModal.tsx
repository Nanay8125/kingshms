
import React, { useState, useEffect } from 'react';
import { X, Mail, Send, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Booking, Guest } from '../types';
import { generateGuestFollowUpEmail } from '../services/geminiService';

interface FollowUpModalProps {
  booking: Booking;
  guest: Guest;
  onClose: () => void;
  onSend: (subject: string, body: string) => void;
}

const FollowUpModal: React.FC<FollowUpModalProps> = ({ booking, guest, onClose, onSend }) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadDraft();
  }, [booking, guest]);

  const loadDraft = async () => {
    setIsLoading(true);
    const draft = await generateGuestFollowUpEmail(guest, booking);
    setSubject(draft.subject);
    setBody(draft.body);
    setIsLoading(false);
  };

  const handleSend = async () => {
    setIsSending(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1500));
    onSend(subject, body);
    setIsSending(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-emerald-600 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-white/20 rounded-xl">
               <Mail size={20} />
             </div>
             <div>
               <h2 className="text-xl font-black">Personalized Follow-up</h2>
               <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest">Guest: {guest.name}</p>
             </div>
          </div>
          <button onClick={onClose} aria-label="Close follow-up modal" className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-4">
               <RefreshCw className="animate-spin text-emerald-500" size={32} />
               <p className="text-sm font-bold animate-pulse">Gemini is drafting a personal thank-you note...</p>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Email Subject</label>
                <input
                  type="text"
                  placeholder="Enter email subject"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:outline-none text-sm font-bold text-slate-800"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                  Message Body
                  <button 
                    onClick={loadDraft}
                    className="flex items-center gap-1 text-[10px] text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    <Sparkles size={10} /> Re-generate with AI
                  </button>
                </label>
                <textarea
                  rows={8}
                  placeholder="Enter your personalized message"
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:outline-none text-sm leading-relaxed text-slate-600 resize-none font-medium"
                  value={body}
                  onChange={e => setBody(e.target.value)}
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button 
                  onClick={onClose}
                  className="flex-1 py-4 text-sm font-black text-slate-500 hover:bg-slate-50 rounded-2xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSend}
                  disabled={isSending}
                  className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-lg shadow-emerald-900/20 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSending ? (
                    <RefreshCw className="animate-spin" size={18} />
                  ) : (
                    <Send size={18} />
                  )}
                  {isSending ? 'Sending...' : 'Send Follow-up'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowUpModal;
