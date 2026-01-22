
import React from 'react';
import { X, Bed, Hammer, History, Users, Layers, Star, Calendar, ArrowRight, User, MessageSquare, Info, StickyNote } from 'lucide-react';
import { Room, RoomCategory, Booking, Guest, RoomStatus, Feedback } from '../types';

interface RoomDetailsModalProps {
  room: Room;
  category: RoomCategory | undefined;
  bookings: (Booking & { guestName?: string })[];
  feedback: Feedback[];
  onClose: () => void;
}

const RoomDetailsModal: React.FC<RoomDetailsModalProps> = ({ room, category, bookings, feedback, onClose }) => {
  const getStatusDetails = (status: RoomStatus) => {
    switch (status) {
      case RoomStatus.AVAILABLE:
        return { color: 'bg-emerald-100 text-emerald-700', label: 'Available' };
      case RoomStatus.OCCUPIED:
        return { color: 'bg-blue-100 text-blue-700', label: 'Occupied' };
      case RoomStatus.CLEANING:
        return { color: 'bg-amber-100 text-amber-700', label: 'Cleaning' };
      case RoomStatus.MAINTENANCE:
        return { color: 'bg-rose-100 text-rose-700', label: 'Maintenance' };
    }
  };

  const status = getStatusDetails(room.status);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[70] p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-slate-900 px-8 py-6 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center text-3xl font-black">
              {room.number}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black tracking-tight">{category?.name}</h2>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${status.color}`}>
                  {status.label}
                </span>
              </div>
              <p className="text-slate-400 text-sm flex items-center gap-2 mt-1">
                <Layers size={14} /> Floor {room.floor} • <Users size={14} /> Max {category?.capacity} Guests
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X size={28} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Left Column: Info & Amenities */}
            <div className="lg:col-span-2 space-y-8">
              <section>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Star size={14} className="text-amber-500" /> Room Amenities
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {category?.amenities.map((amenity, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold text-slate-700">
                      <div className="w-2 h-2 rounded-full bg-indigo-400" />
                      {amenity}
                    </div>
                  ))}
                </div>
              </section>

              <section className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4">Pricing Strategy</h3>
                <p className="text-4xl font-black text-indigo-700">${category?.basePrice}<span className="text-base font-normal text-indigo-400">/night</span></p>
                <p className="text-xs text-indigo-500 mt-2 font-medium">Seasonal pricing and taxes applied at booking.</p>
              </section>

              {/* Room Rating Section */}
              <section className="p-6 bg-amber-50 rounded-3xl border border-amber-100">
                <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                   <Star size={14} /> Guest Satisfaction
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-amber-700">
                    {feedback.length > 0 
                      ? (feedback.reduce((a, b) => a + b.rating, 0) / feedback.length).toFixed(1)
                      : 'N/A'}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} className={`${s <= Math.round(feedback.reduce((a, b) => a + b.rating, 0) / (feedback.length || 1)) ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-[10px] text-amber-600 font-bold mt-1 uppercase tracking-wider">Based on {feedback.length} internal reviews</p>
              </section>
            </div>

            {/* Right Column: Bookings & Maintenance & Feedback */}
            <div className="lg:col-span-3 space-y-10">
              <section>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Calendar size={14} className="text-blue-500" /> Recent & Upcoming Bookings
                </h3>
                {bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.slice(0, 3).map((booking) => (
                      <div key={booking.id} className="group relative pl-8 pb-4">
                        <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-200" />
                        <div className="absolute left-[-4px] top-1 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_0_4px_white]" />
                        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                              <User size={14} className="text-slate-400" />
                              {booking.guestName}
                            </span>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                              booking.status === 'checked-in' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-500'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-500 font-medium mb-3">
                            <span className="flex items-center gap-1.5"><Calendar size={12} /> {booking.checkIn}</span>
                            <ArrowRight size={12} />
                            <span>{booking.checkOut}</span>
                          </div>
                          
                          {(booking.specialRequests || booking.internalNotes) && (
                            <div className="space-y-2 pt-2 border-t border-slate-50">
                              {booking.specialRequests && (
                                <div className="flex gap-2 p-2 bg-indigo-50/50 rounded-xl">
                                  <Info size={12} className="text-indigo-400 shrink-0 mt-0.5" />
                                  <p className="text-[10px] text-indigo-700 leading-tight"><strong>Req:</strong> {booking.specialRequests}</p>
                                </div>
                              )}
                              {booking.internalNotes && (
                                <div className="flex gap-2 p-2 bg-amber-50/50 rounded-xl">
                                  <StickyNote size={12} className="text-amber-400 shrink-0 mt-0.5" />
                                  <p className="text-[10px] text-amber-700 leading-tight"><strong>Staff:</strong> {booking.internalNotes}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center">
                    <p className="text-sm text-slate-400 font-medium italic">No active or upcoming bookings found.</p>
                  </div>
                )}
              </section>

              {/* Guest Feedback Section */}
              <section>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <MessageSquare size={14} className="text-indigo-500" /> Guest Experience Feedback
                </h3>
                <div className="space-y-4">
                  {feedback.length > 0 ? (
                    feedback.slice(0, 3).map((f) => (
                      <div key={f.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} size={10} className={`${s <= f.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} />
                            ))}
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold">{new Date(f.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-slate-600 italic leading-relaxed">"{f.comment}"</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center">
                      <p className="text-sm text-slate-400 font-medium italic">No guest feedback recorded for this room.</p>
                    </div>
                  )}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Hammer size={14} className="text-rose-500" /> Maintenance Logs
                </h3>
                {room.maintenanceHistory.length > 0 ? (
                  <div className="space-y-4">
                    {room.maintenanceHistory.map((log, i) => (
                      <div key={i} className="flex gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                        <div className={`p-2 rounded-xl h-fit ${log.type === 'repair' ? 'bg-rose-100 text-rose-600' : 'bg-slate-200 text-slate-600'}`}>
                          {log.type === 'repair' ? <Hammer size={16} /> : <History size={16} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{log.description}</p>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">{log.date} • {log.type.charAt(0).toUpperCase() + log.type.slice(1)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center">
                    <p className="text-sm text-slate-400 font-medium italic">Perfect health. No maintenance recorded.</p>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
          >
            Close Room View
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailsModal;
