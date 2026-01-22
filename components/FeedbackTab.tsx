
import React from 'react';
import { Star, MessageSquare, User, Calendar, Bed } from 'lucide-react';
import { Feedback, Guest, Room, Booking } from '../types';

interface FeedbackTabProps {
  feedback: Feedback[];
  guests: Guest[];
  rooms: Room[];
}

const FeedbackTab: React.FC<FeedbackTabProps> = ({ feedback, guests, rooms }) => {
  const averageRating = feedback.length > 0 
    ? feedback.reduce((acc, f) => acc + f.rating, 0) / feedback.length 
    : 0;

  return (
    <div className="space-y-8 pb-10">
      {/* Summary Header */}
      <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="text-center md:text-left">
          <h2 className="text-4xl font-black text-slate-900">{averageRating.toFixed(1)}</h2>
          <div className="flex items-center justify-center md:justify-start gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={16} className={`${s <= Math.round(averageRating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
            ))}
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Overall Satisfaction</p>
        </div>
        
        <div className="hidden md:block w-px h-16 bg-slate-100" />
        
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-6 w-full">
          <div className="text-center">
            <p className="text-xl font-black text-slate-900">{feedback.length}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Reviews</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-black text-emerald-600">{feedback.filter(f => f.rating >= 4).length}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Positive</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-black text-amber-600">{feedback.filter(f => f.rating === 3).length}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Neutral</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-black text-rose-600">{feedback.filter(f => f.rating <= 2).length}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Negative</p>
          </div>
        </div>
      </div>

      {/* Feedback Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {feedback.slice().reverse().map((f) => {
          const guest = guests.find(g => g.id === f.guestId);
          const room = rooms.find(r => r.id === f.roomId);
          return (
            <div key={f.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={`https://picsum.photos/seed/${f.guestId}/40/40`} 
                    className="w-10 h-10 rounded-full border-2 border-slate-100" 
                    alt="Guest"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{guest?.name || 'Anonymous Guest'}</h4>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={10} className={`${s <= f.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg uppercase tracking-wider mb-1">
                    Room {room?.number || 'N/A'}
                  </span>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {new Date(f.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <MessageSquare size={14} className="absolute -left-1 -top-1 text-slate-100" />
                <p className="text-sm text-slate-600 italic pl-5 leading-relaxed">
                  "{f.comment}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1"><User size={12} /> Verified Guest</span>
                  <span className="flex items-center gap-1"><Bed size={12} /> Stay Completed</span>
                </div>
                <button className="text-[10px] font-black text-indigo-500 hover:text-indigo-700 uppercase tracking-wider">
                  Respond
                </button>
              </div>
            </div>
          );
        })}

        {feedback.length === 0 && (
          <div className="md:col-span-2 py-20 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 text-center">
            <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-bold">No feedback collected yet.</p>
            <p className="text-xs text-slate-400 mt-1">Feedback is gathered during the check-out process.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackTab;
