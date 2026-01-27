
import React, { useState, useMemo } from 'react';
import {
  Hotel,
  Calendar,
  Users,
  ChevronRight,
  ArrowLeft,
  Bed,
  Wifi,
  Tv,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Loader2,
  X,
  UtensilsCrossed,
  ShoppingCart,
  Plus,
  Minus,
  ArrowRight
} from 'lucide-react';
import { Room, RoomCategory, Booking, Guest, RoomStatus, MenuItem, TaskPriority, TaskType } from '../types';
// Removed INITIAL_MENU import
import GuestAIAssistant from './GuestAIAssistant';

interface PublicBookingPortalProps {
  rooms: Room[];
  categories: RoomCategory[];
  bookings: Booking[];
  menu: MenuItem[];
  onBookingComplete: (booking: Booking, guest: Guest) => void;
  onFoodRequest: (roomId: string, items: { item: MenuItem; quantity: number }[]) => void;
  onServiceRequest: (roomNumber: string, type: TaskType, details: string, priority: TaskPriority) => void;
  onExit: () => void;
  initialTab?: 'stay' | 'dining';
}

const PublicBookingPortal: React.FC<PublicBookingPortalProps> = ({ rooms, categories, bookings, menu, onBookingComplete, onFoodRequest, onServiceRequest, onExit, initialTab = 'stay' }) => {
  const [tab, setTab] = useState<'stay' | 'dining'>(initialTab);
  const [step, setStep] = useState<'search' | 'rooms' | 'checkout' | 'success'>('search');
  const [dates, setDates] = useState({ checkIn: '', checkOut: '' });
  const [guestCount, setGuestCount] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<RoomCategory | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Dining State
  const [cart, setCart] = useState<Record<string, number>>({});
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [diningStep, setDiningStep] = useState<'menu' | 'success'>('menu');

  const [guestInfo, setGuestInfo] = useState({
    name: '',
    email: '',
    phone: '',
    documentId: ''
  });

  const availableRoomsForCatCount = (catId: string) => {
    if (!dates.checkIn || !dates.checkOut) return 0;

    const requestedStart = new Date(dates.checkIn + 'T00:00:00');
    const requestedEnd = new Date(dates.checkOut + 'T00:00:00');

    return rooms.filter(room => {
      if (room.categoryId !== catId || room.status === RoomStatus.MAINTENANCE) return false;

      const hasOverlap = bookings.some(b => {
        if (b.roomId !== room.id || b.status === 'cancelled' || b.status === 'checked-out') return false;
        const bStart = new Date(b.checkIn + 'T00:00:00');
        const bEnd = new Date(b.checkOut + 'T00:00:00');
        return requestedStart < bEnd && requestedEnd > bStart;
      });

      return !hasOverlap;
    }).length;
  };

  const totalAvailableRooms = useMemo(() => {
    return rooms.filter(r => r.status === RoomStatus.AVAILABLE).length;
  }, [rooms]);

  // Fixed: Ensure nights is explicitly typed as number to avoid arithmetic errors
  const nights = useMemo<number>(() => {
    if (!dates.checkIn || !dates.checkOut) return 0;
    const start = new Date(dates.checkIn + 'T00:00:00');
    const end = new Date(dates.checkOut + 'T00:00:00');
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }, [dates]);

  const updateCart = (id: string, delta: number) => {
    setCart(prev => {
      const newVal = (prev[id] || 0) + delta;
      if (newVal <= 0) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: newVal };
    });
  };

  // Fixed: Cast entries to prevent "unknown" type error in arithmetic operation
  const cartTotal = useMemo(() => {
    return Object.entries(cart).reduce((sum: number, entry) => {
      const [id, qty] = entry as [string, number];
      const item = menu.find(m => m.id === id);
      return sum + (item?.price || 0) * qty;
    }, 0);
  }, [cart]);

  const handleBook = async () => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 2000));

    const availableRooms = rooms.filter(room => {
      if (room.categoryId !== selectedCategory!.id || room.status === RoomStatus.MAINTENANCE) return false;
      return true; // Simplified for booking flow
    });

    if (availableRooms.length === 0) {
      alert("Sorry, this room type just became unavailable for your selected dates.");
      setStep('rooms');
      setIsLoading(false);
      return;
    }

    const guestId = `g-direct-${Math.random().toString(36).substr(2, 9)}`;
    const bookingId = `b-direct-${Math.random().toString(36).substr(2, 9)}`;

    // Fix: Added missing 'location' property to satisfy the Guest interface
    const newGuest: Guest = {
      id: guestId,
      ...guestInfo,
      location: 'Online Booking',
      nationality: 'Online Booking',
      ageGroup: '26-35',
      companyId: 'luxestay'
    };

    const newBooking: Booking = {
      id: bookingId,
      roomId: availableRooms[0].id,
      guestId: guestId,
      checkIn: dates.checkIn,
      checkOut: dates.checkOut,
      totalPrice: (selectedCategory?.basePrice || 0) * (nights as number),
      status: 'confirmed',
      guestsCount: guestCount,
      source: 'Direct'
    };

    onBookingComplete(newBooking, newGuest);
    setStep('success');
    setIsLoading(false);
  };

  const handleOrderFood = async () => {
    if (!selectedRoomId) {
      alert("Please select your room number.");
      return;
    }
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1500));

    // Fixed: Properly type and cast cart entries to number
    const items = Object.entries(cart).map((entry) => {
      const [id, qty] = entry as [string, number];
      return {
        item: menu.find(m => m.id === id)!,
        quantity: qty
      };
    });

    onFoodRequest(selectedRoomId, items);
    setDiningStep('success');
    setCart({});
    setIsLoading(false);
  };

  const renderDining = () => (
    <div className="max-w-6xl mx-auto py-12 px-6">
      {diningStep === 'menu' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <div>
              <h2 className="text-4xl font-black text-slate-900 mb-4">In-Room Dining</h2>
              <p className="text-slate-500 font-medium">Exceptional cuisine delivered straight to your door, 24/7.</p>
            </div>

            {['Breakfast', 'Main Course', 'Desserts', 'Drinks'].map(cat => (
              <div key={cat} className="space-y-6">
                <h3 className="text-sm font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-3">
                  <div className="h-px bg-indigo-100 flex-1" />
                  {cat}
                  <div className="h-px bg-indigo-100 flex-1" />
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {menu.filter(m => m.category === cat).map(item => (
                    <div key={item.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex gap-4 group hover:shadow-xl transition-all">
                      <img src={item.image} alt={item.name} className="w-24 h-24 rounded-2xl object-cover shrink-0" />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-slate-900">{item.name}</h4>
                            <span className="text-sm font-black text-indigo-600">${item.price}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-1 line-clamp-2">{item.description}</p>
                        </div>
                        <div className="flex justify-end mt-2">
                          {cart[item.id] ? (
                            <div className="flex items-center gap-3 bg-indigo-50 px-2 py-1 rounded-xl">
                              <button onClick={() => updateCart(item.id, -1)} aria-label="Decrease quantity" className="p-1 text-indigo-600 hover:bg-white rounded-lg"><Minus size={14} /></button>
                              <span className="text-xs font-black text-indigo-700">{cart[item.id]}</span>
                              <button onClick={() => updateCart(item.id, 1)} aria-label="Increase quantity" className="p-1 text-indigo-600 hover:bg-white rounded-lg"><Plus size={14} /></button>
                            </div>
                          ) : (
                            <button
                              onClick={() => updateCart(item.id, 1)}
                              className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
                            >
                              Add
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-2xl sticky top-28 space-y-6">
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2">
                <ShoppingCart size={16} /> Your Order
              </h3>

              <div className="space-y-4 max-h-[300px] overflow-y-auto">
                {Object.entries(cart).length > 0 ? (
                  Object.entries(cart).map((entry) => {
                    const [id, qty] = entry as [string, number];
                    const item = menu.find(m => m.id === id)!;
                    return (
                      <div key={id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 bg-indigo-100 text-indigo-700 flex items-center justify-center rounded text-[10px] font-black">{qty}</span>
                          <span className="font-bold text-slate-700">{item.name}</span>
                        </div>
                        <span className="text-slate-400 font-medium">${item.price * qty}</span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 font-medium italic py-8 text-center">Your basket is empty. Select items to begin.</p>
                )}
              </div>

              <div className="pt-6 border-t border-slate-50 space-y-6">
                <div className="space-y-1">
                  <label htmlFor="room-select" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deliver to Room #</label>
                  <select
                    id="room-select"
                    title="Select room for delivery"
                    className="w-full px-4 py-3 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-sm font-bold focus:outline-none"
                    value={selectedRoomId}
                    onChange={e => setSelectedRoomId(e.target.value)}
                  >
                    <option value="" disabled>Select room for delivery</option>
                    {rooms.filter(r => r.status === RoomStatus.OCCUPIED).map(r => (
                      <option key={r.id} value={r.id}>Room {r.number}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-between items-center px-2">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Amount</span>
                  <span className="text-2xl font-black text-indigo-600">${cartTotal}</span>
                </div>

                <button
                  onClick={handleOrderFood}
                  disabled={Object.keys(cart).length === 0 || !selectedRoomId || isLoading}
                  className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-lg shadow-xl shadow-indigo-900/20 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : <UtensilsCrossed size={20} />}
                  {isLoading ? 'Sending Request...' : 'Send Order to Kitchen'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto py-24 text-center">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-900/10">
            <CheckCircle2 size={48} className="animate-in zoom-in duration-500" />
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-4">Chef is on it!</h2>
          <p className="text-slate-500 font-medium mb-12">Your order has been sent to our signature kitchen. Average preparation time is 25-35 minutes.</p>
          <button
            onClick={() => setDiningStep('menu')}
            className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-sm hover:bg-slate-800 transition-all"
          >
            Order More Items
          </button>
        </div>
      )}
    </div>
  );

  const renderStay = () => {
    switch (step) {
      case 'search':
        return (
          <div className="max-w-2xl mx-auto py-20 px-6">
            <div className="text-center mb-12">
              <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">Direct Booking Portal</span>
              <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4">Experience LuxeStay</h1>
              <p className="text-slate-500 font-medium">Book directly with us for the best rates and exclusive perks.</p>
            </div>

            <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label htmlFor="checkin-input" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Check-in</label>
                <input
                  id="checkin-input"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  title="Check-in date"
                  className="w-full px-4 py-3 bg-indigo-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-800"
                  value={dates.checkIn}
                  onChange={e => setDates({ ...dates, checkIn: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="checkout-input" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Check-out</label>
                <input
                  id="checkout-input"
                  type="date"
                  min={dates.checkIn || new Date().toISOString().split('T')[0]}
                  title="Check-out date"
                  className="w-full px-4 py-3 bg-indigo-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-800"
                  value={dates.checkOut}
                  onChange={e => setDates({ ...dates, checkOut: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="guest-select" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Guests</label>
                <select
                  id="guest-select"
                  aria-label="Select number of guests"
                  className="w-full px-4 py-3 bg-indigo-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-800 appearance-none"
                  value={guestCount}
                  onChange={e => setGuestCount(parseInt(e.target.value))}
                >
                  <option value="" disabled>Select number of guests</option>
                  {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} Guests</option>)}
                </select>
              </div>
              <button
                onClick={() => {
                  if (!dates.checkIn || !dates.checkOut) {
                    alert("Please select your stay dates.");
                    return;
                  }
                  setStep('rooms');
                }}
                className="md:col-span-3 py-5 bg-indigo-600 text-white rounded-[24px] font-black text-lg shadow-xl shadow-indigo-900/20 hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
              >
                Check Availability
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck size={24} />
                </div>
                <h4 className="font-bold text-slate-900">Best Price Guaranteed</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">Find it cheaper elsewhere? We'll match it and give you a free drink.</p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Wifi size={24} />
                </div>
                <h4 className="font-bold text-slate-900">Premium Perks</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">Direct bookers receive free high-speed WiFi and late checkout options.</p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={24} />
                </div>
                <h4 className="font-bold text-slate-900">Zero Commissions</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">No hidden service fees. What you see is exactly what you pay.</p>
              </div>
            </div>
          </div>
        );

      case 'rooms':
        return (
          <div className="max-w-6xl mx-auto py-12 px-6">
            <button
              onClick={() => setStep('search')}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-sm mb-8 transition-colors"
            >
              <ArrowLeft size={16} /> Change Dates
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map(cat => {
                const avail = availableRoomsForCatCount(cat.id);
                const isPossible = cat.capacity >= guestCount && avail > 0;

                return (
                  <div key={cat.id} className={`bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm flex flex-col transition-all hover:shadow-2xl ${!isPossible ? 'opacity-50 grayscale' : ''}`}>
                    <div className="h-56 relative">
                      <img src={cat.imageUrl || `https://picsum.photos/seed/${cat.id}/600/400`} alt={`${cat.name} room`} className="w-full h-full object-cover" />
                      <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-600">
                        {cat.name}
                      </div>
                      {isPossible && (
                        <div className="absolute bottom-4 left-4 px-3 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                          {avail} Rooms Left
                        </div>
                      )}
                    </div>

                    <div className="p-8 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-black text-slate-900">{cat.name}</h3>
                        <div className="text-right">
                          <p className="text-2xl font-black text-indigo-600">${cat.basePrice}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">per night</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 mb-8">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500"><Users size={12} /> Up to {cat.capacity} guests</span>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500"><Wifi size={12} /> Free WiFi</span>
                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1"><Tv size={14} /> Smart TV</span>
                      </div>

                      <div className="mt-auto pt-6 border-t border-slate-50">
                        {isPossible ? (
                          <button
                            onClick={() => {
                              setSelectedCategory(cat);
                              setStep('checkout');
                            }}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-indigo-600 transition-all shadow-lg"
                          >
                            Select Room
                          </button>
                        ) : (
                          <div className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-sm text-center">
                            {cat.capacity < guestCount ? 'Too Small' : 'Sold Out'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'checkout':
        return (
          <div className="max-w-4xl mx-auto py-12 px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 mb-2">Guest Details</h2>
                  <p className="text-sm text-slate-400 font-medium">Please provide your details to finalize the stay.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label htmlFor="name-input" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input
                      id="name-input"
                      type="text"
                      placeholder="Enter your full name"
                      title="Full name"
                      className="w-full px-4 py-3 bg-indigo-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                      value={guestInfo.name}
                      onChange={e => setGuestInfo({ ...guestInfo, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="email-input" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input
                      id="email-input"
                      type="email"
                      placeholder="Enter your email address"
                      title="Email address"
                      className="w-full px-4 py-3 bg-indigo-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                      value={guestInfo.email}
                      onChange={e => setGuestInfo({ ...guestInfo, email: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="phone-input" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone</label>
                      <input
                        id="phone-input"
                        type="tel"
                        placeholder="Enter your phone number"
                        title="Phone number"
                        className="w-full px-4 py-3 bg-indigo-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                        value={guestInfo.phone}
                        onChange={e => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="document-input" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Document ID</label>
                      <input
                        id="document-input"
                        type="text"
                        placeholder="Enter your document ID"
                        className="w-full px-4 py-3 bg-indigo-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                        value={guestInfo.documentId}
                        onChange={e => setGuestInfo({ ...guestInfo, documentId: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-start gap-4">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-800">Secure Payment Simulation</h4>
                    <p className="text-[11px] text-emerald-600 leading-relaxed font-medium">In this demo, clicking 'Complete Booking' simulates a successful transaction. No real card info is required.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
                  <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Stay Summary</h3>

                  <div className="flex items-center gap-4">
                    <img src={selectedCategory?.imageUrl || `https://picsum.photos/seed/${selectedCategory?.id}/100/100`} alt={`${selectedCategory?.name} room`} className="w-16 h-16 rounded-2xl object-cover" />
                    <div>
                      <p className="font-bold text-slate-900">{selectedCategory?.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{guestCount} Guests • {nights} Nights</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-6 border-t border-slate-50">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-slate-500">Dates</span>
                      <span className="text-slate-900">{dates.checkIn} → {dates.checkOut}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-slate-500">Rate ({nights} nights)</span>
                      <span className="text-slate-900">${(selectedCategory?.basePrice || 0) * (nights as number)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-slate-500">Service Fee</span>
                      <span className="text-emerald-600">$0.00 (Direct Booking)</span>
                    </div>
                    <div className="flex justify-between pt-4 border-t border-slate-50">
                      <span className="text-lg font-black text-slate-900">Total</span>
                      <span className="text-2xl font-black text-indigo-600">${(selectedCategory?.basePrice || 0) * (nights as number)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleBook}
                    disabled={isLoading || !guestInfo.name || !guestInfo.email}
                    className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-lg shadow-xl shadow-indigo-900/20 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} className="text-amber-300" />}
                    {isLoading ? 'Processing...' : 'Complete Booking'}
                  </button>
                  <button onClick={() => setStep('rooms')} className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">Go Back to Selection</button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="max-w-md mx-auto py-24 px-6 text-center">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-900/10">
              <CheckCircle2 size={48} className="animate-in zoom-in duration-500" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-4">You're All Set!</h1>
            <p className="text-slate-500 font-medium mb-12">Your reservation at LuxeStay has been confirmed. A confirmation email has been sent to <strong>{guestInfo.email}</strong>.</p>

            <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm text-left space-y-3 mb-10">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-widest">Confirmation #</span>
                <span className="text-slate-900 font-black">LS-{Math.floor(100000 + Math.random() * 900000)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-widest">Guest</span>
                <span className="text-slate-900 font-black">{guestInfo.name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-widest">Arrival</span>
                <span className="text-slate-900 font-black">{dates.checkIn}</span>
              </div>
            </div>

            <button
              onClick={onExit}
              className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-lg hover:bg-slate-800 transition-all active:scale-[0.98]"
            >
              Return to Portal
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-y-auto">
      {/* Navbar */}
      <nav className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
              <Hotel size={24} />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">LuxeStay</span>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setTab('stay')}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === 'stay' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Book a Stay
            </button>
            <button
              onClick={() => setTab('dining')}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === 'dining' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Digital Menu
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {tab === 'dining' && Object.keys(cart).length > 0 && (
            <div className="flex items-center gap-3 px-4 py-2 bg-indigo-600 text-white rounded-2xl text-xs font-black animate-in fade-in slide-in-from-right-2">
              <ShoppingCart size={16} />
              {/* Fixed: typed reduce parameters to number to avoid unknown type error */}
              {Object.values(cart).reduce((a: number, b: number) => a + b, 0)} Items • ${cartTotal}
            </div>
          )}
          <button
            onClick={onExit}
            className="px-6 py-2 bg-slate-100 text-slate-600 rounded-full text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-colors flex items-center gap-2"
          >
            <X size={14} /> Exit Preview
          </button>
        </div>
      </nav>

      {/* Hero Section Background */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-indigo-600/5 -z-10" />

      {tab === 'stay' ? renderStay() : renderDining()}

      {/* Guest AI Assistant */}
      <GuestAIAssistant
        menu={menu}
        categories={categories}
        availableRoomsCount={totalAvailableRooms}
        onServiceRequest={onServiceRequest}
      />

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-slate-200 mt-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-xl text-white">
              <Hotel size={18} />
            </div>
            <span className="text-sm font-black text-slate-900 tracking-tight uppercase">LuxeStay Hotels & Resorts</span>
          </div>
          <div className="flex gap-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Contact</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Help</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicBookingPortal;
