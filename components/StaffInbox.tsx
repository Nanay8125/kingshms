
import React, { useState } from 'react';
import { Mail, MailOpen, Send, Clock, Filter, Search, User, Inbox, AlertCircle } from 'lucide-react';
import { StaffEmail } from '../types';

interface StaffInboxProps {
  emails: StaffEmail[];
}

const StaffInbox: React.FC<StaffInboxProps> = ({ emails }) => {
  const [selectedEmail, setSelectedEmail] = useState<StaffEmail | null>(null);

  const getDeptColor = (dept: string) => {
    switch (dept) {
      case 'Housekeeping': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Front Desk': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Management': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Finance': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Email List */}
      <div className="w-1/3 border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search outbox..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {emails.length > 0 ? (
            emails.slice().reverse().map((email) => (
              <button
                key={email.id}
                onClick={() => setSelectedEmail(email)}
                className={`w-full text-left p-4 border-b border-slate-50 transition-all hover:bg-slate-50 flex flex-col gap-1 ${
                  selectedEmail?.id === email.id ? 'bg-indigo-50/50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border ${getDeptColor(email.recipientDept)}`}>
                    {email.recipientDept}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{new Date(email.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{email.subject}</h4>
                <p className="text-xs text-slate-500 line-clamp-1">{email.body}</p>
              </button>
            ))
          ) : (
            <div className="p-10 text-center">
              <Inbox size={40} className="mx-auto text-slate-200 mb-4" />
              <p className="text-sm text-slate-400 font-medium">No automated notifications sent yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Email Body */}
      <div className="flex-1 bg-white flex flex-col">
        {selectedEmail ? (
          <>
            <div className="p-8 border-b border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
                    <Send size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">{selectedEmail.subject}</h2>
                    <p className="text-sm text-slate-500">To: {selectedEmail.recipientDept} Dept.</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{new Date(selectedEmail.timestamp).toLocaleDateString()}</p>
                  <p className="text-xs text-slate-400 font-medium">{new Date(selectedEmail.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 py-4 px-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <Clock size={14} className="text-indigo-500" />
                  Sent via LuxeStay Automation
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <AlertCircle size={14} className="text-amber-500" />
                  Priority: Standard
                </div>
              </div>
            </div>
            
            <div className="flex-1 p-8 overflow-y-auto">
              <div className="max-w-2xl prose prose-slate">
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {selectedEmail.body}
                </p>
              </div>
              
              <div className="mt-12 pt-8 border-t border-slate-100">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4">Internal System Metadata</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Transaction ID</p>
                    <p className="text-xs font-mono font-bold text-slate-600">{selectedEmail.id}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Trigger Event</p>
                    <p className="text-xs font-bold text-slate-600 capitalize">{selectedEmail.type.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
            <Mail size={64} className="mb-4 opacity-20" />
            <p className="font-bold text-slate-400">Select an internal notification to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffInbox;
