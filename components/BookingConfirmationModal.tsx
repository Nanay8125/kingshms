
import React from 'react';
import { X, LogIn, LogOut, CheckCircle2, User, Bed, AlertCircle } from 'lucide-react';
import { Booking, Guest, Room } from '../types';

interface BookingConfirmationModalProps {
  booking: Booking;
  guest: Guest | undefined;
  room: Room | undefined;
  type: 'in' | 'out';
  onClose: () => void;
  onConfirm: () => void;
}

const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({ booking, guest, room, type, onClose, onConfirm }) => {
  const isIn = type === 'in';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className={`${isIn ? 'bg-indigo-600' : 'bg-amber-500'} px-8 py-6 flex items-center justify-between text-white`}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl">
               {isIn ? <LogIn size={24} /> : <LogOut size={24} />}
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">{isIn ? 'Guest Check-In' : 'Guest Check-Out'}</h2>
              <p className="text-xs font-bold opacity-80 uppercase tracking-widest mt-0.5">Operation Confirmation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors" aria-label="Close modal">
            <X size={28} />
          </button>
        </div>

        <div className="p-8">
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <img 
                src={`https://picsum.photos/seed/${booking.guestId}/100/100`} 
                className="w-16 h-16 rounded-2xl border-4 border-white shadow-sm" 
                alt="Guest"
              />
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Primary Guest</p>
                <h3 className="text-lg font-black text-slate-900 leading-tight">{guest?.name}</h3>
                <p className="text-xs font-bold text-indigo-600">ID: {booking.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Bed size={10} /> Room Unit
                </p>
                <p className="text-sm font-black text-slate-700">Room #{room?.number}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <User size={10} /> Occupancy
                </p>
                <p className="text-sm font-black text-slate-700">{booking.guestsCount} {booking.guestsCount > 1 ? 'Guests' : 'Guest'}</p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 mb-8 px-2">
            <div className={`p-2 rounded-xl shrink-0 ${isIn ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
              <AlertCircle size={20} />
            </div>
            <p className="text-xs font-medium text-slate-500 leading-relaxed">
              {isIn 
                ? `Checking in will update Room ${room?.number} status to "Occupied" and trigger the automated AI welcome greeting.` 
                : `Checking out will update Room ${room?.number} status to "Cleaning" and initiate the automated housekeeping task.`
              }
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 rounded-2xl transition-all"
            >
              Discard
            </button>
            <button
              onClick={onConfirm}
              className={`flex-[2] px-6 py-4 ${isIn ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-900/20' : 'bg-amber-500 hover:bg-amber-600 shadow-amber-900/20'} text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl flex items-center justify-center gap-3 active:scale-[0.98]`}
            >
              <CheckCircle2 size={20} />
              Confirm {isIn ? 'Arrival' : 'Departure'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationModal;
