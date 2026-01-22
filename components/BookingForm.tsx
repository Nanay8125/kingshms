
import React, { useState, useMemo, useEffect } from 'react';
import { X, Calendar, User, Bed, Users as UsersIcon, CreditCard, ClipboardList, AlertCircle, CheckCircle, StickyNote, Moon, Smartphone, Mail, MapPin, Search } from 'lucide-react';
import { Room, Guest, RoomStatus, Booking, RoomCategory } from '../types';

interface BookingFormProps {
  rooms: Room[];
  guests: Guest[];
  allBookings: Booking[];
  categories?: RoomCategory[];
  onClose: () => void;
  onSubmit: (bookingData: { booking: any, newGuest?: Guest }) => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ rooms, guests, allBookings, categories = [], onClose, onSubmit }) => {
  const [isNewGuest, setIsNewGuest] = useState(false);
  const [formData, setFormData] = useState({
    guestId: '',
    roomId: '',
    checkIn: '',
    checkOut: '',
    guestsCount: 1,
    specialRequests: '',
    internalNotes: '',
  });

  const [guestDetails, setGuestDetails] = useState({
    name: '',
    phone: '',
    email: '',
    location: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const todayStr = new Date().toISOString().split('T')[0];

  const selectedRoom = useMemo(() => 
    rooms.find(r => r.id === formData.roomId), 
  [formData.roomId, rooms]);

  const selectedCategory = useMemo(() => 
    categories.find(c => c.id === selectedRoom?.categoryId),
  [selectedRoom, categories]);

  const nightsCount = useMemo(() => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    const start = new Date(formData.checkIn + 'T00:00:00');
    const end = new Date(formData.checkOut + 'T00:00:00');
    const diff = end.getTime() - start.getTime();
    const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  }, [formData.checkIn, formData.checkOut]);

  useEffect(() => {
    const newErrors: { [key: string]: string } = {};

    if (formData.checkIn && formData.checkOut) {
      const start = new Date(formData.checkIn + 'T00:00:00');
      const end = new Date(formData.checkOut + 'T00:00:00');
      if (end <= start) {
        newErrors.checkOut = 'Check-out must be at least one day after check-in';
      }
    }

    if (formData.checkIn && formData.checkIn < todayStr) {
      newErrors.checkIn = 'Check-in cannot be in the past';
    }

    if (selectedCategory && formData.guestsCount > selectedCategory.capacity) {
      newErrors.guestsCount = `Max capacity for this ${selectedCategory.name} is ${selectedCategory.capacity}`;
    }

    if (formData.roomId && formData.checkIn && formData.checkOut && !newErrors.checkOut) {
      const requestedStart = new Date(formData.checkIn + 'T00:00:00');
      const requestedEnd = new Date(formData.checkOut + 'T00:00:00');
      const hasConflict = allBookings.some(booking => {
        if (booking.roomId !== formData.roomId) return false;
        if (booking.status === 'cancelled' || booking.status === 'checked-out') return false;
        const bStart = new Date(booking.checkIn + 'T00:00:00');
        const bEnd = new Date(booking.checkOut + 'T00:00:00');
        return requestedStart < bEnd && requestedEnd > bStart;
      });
      if (hasConflict) {
        newErrors.roomId = 'This room was recently reserved for these dates';
      }
    }

    setErrors(newErrors);
  }, [formData, selectedCategory, allBookings, todayStr]);

  const availableRooms = useMemo(() => {
    if (!formData.checkIn || !formData.checkOut || errors.checkOut) return [];
    const requestedStart = new Date(formData.checkIn + 'T00:00:00');
    const requestedEnd = new Date(formData.checkOut + 'T00:00:00');
    return rooms.filter(room => {
      if (room.status === RoomStatus.MAINTENANCE) return false;
      const hasOverlap = allBookings.some(booking => {
        if (booking.roomId !== room.id) return false;
        if (booking.status === 'cancelled' || booking.status === 'checked-out') return false;
        const bookingStart = new Date(booking.checkIn + 'T00:00:00');
        const bookingEnd = new Date(booking.checkOut + 'T00:00:00');
        return requestedStart < bookingEnd && requestedEnd > bookingStart;
      });
      return !hasOverlap;
    });
  }, [formData.checkIn, formData.checkOut, rooms, allBookings, errors.checkOut]);

  const calculatedTotal = useMemo(() => {
    if (nightsCount <= 0 || !selectedRoom || !selectedCategory || errors.checkOut) return 0;
    return nightsCount * selectedCategory.basePrice;
  }, [nightsCount, selectedRoom, selectedCategory, errors.checkOut]);

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleDateChange = (field: 'checkIn' | 'checkOut', value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value, 
      roomId: '' 
    }));
    setTouched(prev => ({ ...prev, roomId: false }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(errors).length > 0) return;

    let finalGuestId = formData.guestId;
    let newGuest: Guest | undefined = undefined;

    if (isNewGuest) {
      if (!guestDetails.name || !guestDetails.email || !guestDetails.phone || !guestDetails.location) {
        alert("Please provide all guest details: Name, Phone, Email, and Location.");
        return;
      }
      finalGuestId = `g-quick-${Math.random().toString(36).substr(2, 9)}`;
      newGuest = {
        id: finalGuestId,
        name: guestDetails.name,
        email: guestDetails.email,
        phone: guestDetails.phone,
        location: guestDetails.location,
        documentId: 'PENDING',
        nationality: guestDetails.location,
        ageGroup: '26-35'
      };
    } else if (!formData.guestId) {
      setTouched(prev => ({ ...prev, guestId: true }));
      return;
    }

    if (!formData.roomId || !formData.checkIn || !formData.checkOut) {
      setTouched({ guestId: true, roomId: true, checkIn: true, checkOut: true });
      return;
    }

    onSubmit({
      booking: {
        ...formData,
        guestId: finalGuestId,
        id: `b${Math.random().toString(36).substr(2, 9)}`,
        totalPrice: calculatedTotal,
        status: 'confirmed',
        source: 'Direct'
      },
      newGuest
    });
  };

  const datesAreSelected = formData.checkIn && formData.checkOut && !errors.checkOut;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-indigo-600 px-8 py-6 flex items-center justify-between text-white">
          <h2 className="text-xl font-black flex items-center gap-3">
            <Calendar size={24} />
            Reservation Terminal
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors" aria-label="Close booking form">
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Guest Context Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Guest Information</label>
              <button 
                type="button"
                onClick={() => setIsNewGuest(!isNewGuest)}
                className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800 transition-colors flex items-center gap-1.5"
              >
                {isNewGuest ? <><Search size={12}/> Select Existing</> : <><User size={12}/> Register New Guest</>}
              </button>
            </div>

            {isNewGuest ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    required
                    type="text"
                    placeholder="Guest Full Name"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-sm font-bold text-slate-900"
                    value={guestDetails.name}
                    onChange={e => setGuestDetails({ ...guestDetails, name: e.target.value })}
                    aria-label="Guest full name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      required
                      type="tel"
                      placeholder="Phone"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-sm font-bold text-slate-900"
                      value={guestDetails.phone}
                      onChange={e => setGuestDetails({ ...guestDetails, phone: e.target.value })}
                      aria-label="Guest phone number"
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      required
                      type="email"
                      placeholder="Email"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-sm font-bold text-slate-900"
                      value={guestDetails.email}
                      onChange={e => setGuestDetails({ ...guestDetails, email: e.target.value })}
                      aria-label="Guest email address"
                    />
                  </div>
                </div>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    required
                    type="text"
                    placeholder="Guest Location / City"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-sm font-bold text-slate-900"
                    value={guestDetails.location}
                    onChange={e => setGuestDetails({ ...guestDetails, location: e.target.value })}
                    aria-label="Guest location or city"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <select
                  required
                  className={`w-full px-4 py-3.5 bg-slate-50 border rounded-2xl focus:ring-2 focus:outline-none text-sm font-bold text-slate-900 transition-all appearance-none cursor-pointer ${
                    touched.guestId && !formData.guestId ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-indigo-500/20'
                  }`}
                  value={formData.guestId}
                  onBlur={() => handleBlur('guestId')}
                  onChange={e => setFormData({ ...formData, guestId: e.target.value })}
                  aria-label="Select existing guest"
                >
                  <option value="" className="text-slate-400">Search system for guest...</option>
                  {guests.map(g => (
                    <option key={g.id} value={g.id} className="text-slate-900">{g.name} — {g.phone}</option>
                  ))}
                </select>
                {touched.guestId && !formData.guestId && (
                  <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest mt-1 ml-1">Registry selection required</p>
                )}
              </div>
            )}
          </div>

          {/* Dates Section */}
          <div className="grid grid-cols-2 gap-6 pt-2">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Arrival</label>
              <input
                type="date"
                required
                min={todayStr}
                className={`w-full px-4 py-3.5 bg-slate-50 border rounded-2xl focus:ring-2 focus:outline-none text-sm font-bold text-slate-900 transition-all ${
                  touched.checkIn && errors.checkIn ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-indigo-500/20'
                }`}
                value={formData.checkIn}
                onBlur={() => handleBlur('checkIn')}
                onChange={e => handleDateChange('checkIn', e.target.value)}
                aria-label="Check-in date"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Departure</label>
              <input
                type="date"
                required
                min={formData.checkIn || todayStr}
                className={`w-full px-4 py-3.5 bg-slate-50 border rounded-2xl focus:ring-2 focus:outline-none text-sm font-bold text-slate-900 transition-all ${
                  touched.checkOut && errors.checkOut ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-indigo-500/20'
                }`}
                value={formData.checkOut}
                onBlur={() => handleBlur('checkOut')}
                onChange={e => handleDateChange('checkOut', e.target.value)}
                aria-label="Check-out date"
              />
            </div>
          </div>

          {datesAreSelected && (
            <div className="flex justify-center -my-2">
              <div className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 flex items-center gap-2 animate-in slide-in-from-top-1">
                <Moon size={14} className="animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">{nightsCount} Night Stay</span>
              </div>
            </div>
          )}

          {/* Room Selection */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center justify-between">
              Room Inventory
              {!datesAreSelected && (
                <span className="text-[9px] text-amber-600 font-bold flex items-center gap-1">
                   <Calendar size={10} /> Dates required for availability check
                </span>
              )}
            </label>
            <select
              required
              disabled={!datesAreSelected}
              className={`w-full px-4 py-3.5 border rounded-2xl focus:ring-2 focus:outline-none text-sm font-bold transition-all appearance-none cursor-pointer ${
                !datesAreSelected ? 'bg-slate-50/50 border-slate-200 cursor-not-allowed text-slate-300' :
                (touched.roomId && (errors.roomId || !formData.roomId) ? 'border-rose-500 focus:ring-rose-500/20 text-slate-900' : 'bg-slate-50 border-slate-200 focus:ring-indigo-500/20 text-slate-900')
              }`}
              value={formData.roomId}
              onBlur={() => handleBlur('roomId')}
              onChange={e => setFormData({ ...formData, roomId: e.target.value })}
              aria-label="Select available room"
            >
              <option value="" className="text-slate-400">{datesAreSelected ? 'Select an available unit...' : 'Awaiting dates...'}</option>
              {availableRooms.map(r => {
                const cat = categories.find(c => c.id === r.categoryId);
                return (
                  <option key={r.id} value={r.id} className="text-slate-900">
                    Room {r.number} — {cat?.name} (${cat?.basePrice}/night)
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pax Count</label>
              <div className="relative">
                <UsersIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="number"
                  min="1"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold text-slate-900"
                  value={formData.guestsCount}
                  onChange={e => setFormData({ ...formData, guestsCount: parseInt(e.target.value) || 1 })}
                  aria-label="Number of guests"
                />
              </div>
            </div>
            
            {calculatedTotal > 0 && (
              <div className="p-4 bg-emerald-50 rounded-2xl flex flex-col justify-center border border-emerald-100 items-end">
                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">Est. Total</p>
                <span className="text-xl font-black text-emerald-700">${calculatedTotal}</span>
              </div>
            )}
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Special Requests</label>
              <textarea
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-sm font-bold text-slate-900 resize-none h-20"
                placeholder="Dietary, Accessibility, etc..."
                value={formData.specialRequests}
                onChange={e => setFormData({ ...formData, specialRequests: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 rounded-2xl transition-all"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={!formData.roomId || Object.keys(errors).length > 0}
              className={`flex-[2] px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] ${
                !formData.roomId || Object.keys(errors).length > 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-900/20'
              }`}
            >
              <CheckCircle size={20} />
              Verify & Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;
