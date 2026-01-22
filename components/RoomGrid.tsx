
import React, { useState, useMemo } from 'react';
import { Room, RoomStatus, RoomCategory, Booking } from '../types';
import { BedDouble, CheckCircle2, Clock, Hammer, UserCheck, Users, Search, X, Calendar, ArrowRight, Info, Plus } from 'lucide-react';
import RoomForm from './RoomForm';
import { sanitizeSearchQuery } from '../services/security';

interface RoomGridProps {
  rooms: Room[];
  categories: RoomCategory[];
  bookings: Booking[];
  onStatusChange: (roomId: string, newStatus: RoomStatus) => void;
  onRoomClick: (room: Room) => void;
  onAddRoom: (room: Omit<Room, 'id'>) => void;
}

const RoomGrid: React.FC<RoomGridProps> = ({ rooms, categories, bookings, onStatusChange, onRoomClick, onAddRoom }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dates, setDates] = useState({ checkIn: '', checkOut: '' });
  const [showAddRoomForm, setShowAddRoomForm] = useState(false);

  const getStatusDetails = (status: RoomStatus | 'BOOKED_FOR_RANGE') => {
    switch (status) {
      case RoomStatus.AVAILABLE:
        return { color: 'bg-emerald-50 border-emerald-200 text-emerald-700', icon: CheckCircle2, label: 'Available' };
      case RoomStatus.OCCUPIED:
        return { color: 'bg-blue-50 border-blue-200 text-blue-700', icon: UserCheck, label: 'Occupied' };
      case RoomStatus.CLEANING:
        return { color: 'bg-amber-50 border-amber-200 text-amber-700', icon: Clock, label: 'Cleaning' };
      case RoomStatus.MAINTENANCE:
        return { color: 'bg-rose-50 border-rose-200 text-rose-700', icon: Hammer, label: 'Maintenance' };
      case 'BOOKED_FOR_RANGE':
        return { color: 'bg-indigo-50 border-indigo-200 text-indigo-700', icon: Calendar, label: 'Reserved' };
    }
  };

  const filteredRooms = useMemo(() => {
    // Sanitize search query to prevent injection
    const query = sanitizeSearchQuery(searchQuery).toLowerCase().trim();
    return rooms.filter(room =>
      room.number.toLowerCase().includes(query) ||
      room.floor.toString().includes(query)
    );
  }, [rooms, searchQuery]);

  const getRoomStatusForRange = (room: Room) => {
    // If room is under maintenance, it's always blocked regardless of selection
    if (room.status === RoomStatus.MAINTENANCE) return RoomStatus.MAINTENANCE;

    // Only perform date-based check if both dates are provided
    if (dates.checkIn && dates.checkOut) {
      const requestedStart = new Date(dates.checkIn + 'T00:00:00');
      const requestedEnd = new Date(dates.checkOut + 'T00:00:00');

      const hasConflict = bookings.some(b => {
        if (b.roomId !== room.id || b.status === 'cancelled' || b.status === 'checked-out') return false;
        const bStart = new Date(b.checkIn + 'T00:00:00');
        const bEnd = new Date(b.checkOut + 'T00:00:00');
        return requestedStart < bEnd && requestedEnd > bStart;
      });

      if (hasConflict) return 'BOOKED_FOR_RANGE';
      return RoomStatus.AVAILABLE;
    }

    return room.status;
  };

  const nights = useMemo(() => {
    if (!dates.checkIn || !dates.checkOut) return 0;
    const start = new Date(dates.checkIn + 'T00:00:00');
    const end = new Date(dates.checkOut + 'T00:00:00');
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [dates]);

  return (
    <div className="space-y-6">
      {/* Header with Add Room Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Room Management</h2>
          <p className="text-sm text-slate-500 mt-1">Manage your hotel rooms and availability</p>
        </div>
        <button
          onClick={() => setShowAddRoomForm(true)}
          className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20 flex items-center gap-3 active:scale-[0.98]"
        >
          <Plus size={20} />
          Add Room
        </button>
      </div>

      {/* Search & Availability Bar */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col xl:flex-row items-center gap-6">
        <div className="relative flex-1 w-full">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Filter room numbers..."
            className="w-full pl-12 pr-12 py-3 bg-indigo-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-all"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
          <div className="flex items-center gap-2 bg-indigo-50/50 p-1 rounded-2xl border border-slate-200 w-full sm:w-auto">
            <div className="flex flex-col px-3 py-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Arrival</label>
              <input
                type="date"
                className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none"
                value={dates.checkIn}
                onChange={e => setDates({ ...dates, checkIn: e.target.value })}
              />
            </div>
            <ArrowRight size={14} className="text-slate-300" />
            <div className="flex flex-col px-3 py-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Departure</label>
              <input
                type="date"
                min={dates.checkIn}
                className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none"
                value={dates.checkOut}
                onChange={e => setDates({ ...dates, checkOut: e.target.value })}
              />
            </div>
            {(dates.checkIn || dates.checkOut) && (
              <button
                onClick={() => setDates({ checkIn: '', checkOut: '' })}
                className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {nights > 0 && (
            <div className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest animate-in zoom-in-95">
              {nights} Nights Mode
            </div>
          )}
        </div>
      </div>

      {(dates.checkIn && dates.checkOut && nights <= 0) && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 animate-in slide-in-from-top-2">
          <Hammer size={18} />
          <p className="text-xs font-bold">Please select a valid check-out date after the check-in date.</p>
        </div>
      )}

      {filteredRooms.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredRooms.map((room) => {
            const category = categories.find(c => c.id === room.categoryId);
            const statusForRange = getRoomStatusForRange(room);
            const { color, icon: Icon, label } = getStatusDetails(statusForRange);
            const isRangeActive = !!(dates.checkIn && dates.checkOut);

            return (
              <div
                key={room.id}
                onClick={() => onRoomClick(room)}
                className={`p-5 rounded-3xl border transition-all hover:shadow-2xl bg-white group relative overflow-hidden cursor-pointer active:scale-95 shadow-sm border-slate-100 hover:border-indigo-100 ${isRangeActive && statusForRange === RoomStatus.AVAILABLE ? 'ring-2 ring-emerald-500/20' : ''
                  }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-2xl font-black text-slate-800 tracking-tight">#{room.number}</span>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Floor {room.floor}</p>
                  </div>
                  <div className={`p-2.5 rounded-2xl transition-colors duration-500 ${color}`}>
                    <Icon size={20} />
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div>
                    <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <BedDouble size={14} className="text-indigo-500" />
                      {category?.name || 'Unknown Type'}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium"><Users size={12} /> {category?.capacity} Pax</span>
                      <span className="flex items-center gap-1 font-bold text-indigo-600">${category?.basePrice}<span className="text-[10px] font-normal text-slate-400">/nt</span></span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-auto" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${color.split(' ')[0].replace('-50', '-500')} animate-pulse`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${color.split(' ')[2]}`}>{label}</span>
                      </div>
                      {isRangeActive && (
                        <span className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">For selected range</span>
                      )}
                    </div>
                  </div>

                  {/* Status update select only visible when not in date-range mode to avoid confusion */}
                  {!isRangeActive && (
                    <select
                      value={room.status}
                      onChange={(e) => onStatusChange(room.id, e.target.value as RoomStatus)}
                      className="mt-2 text-[10px] w-full bg-indigo-50/50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all hover:bg-white cursor-pointer"
                    >
                      <option value={RoomStatus.AVAILABLE}>Set Available</option>
                      <option value={RoomStatus.OCCUPIED}>Set Occupied</option>
                      <option value={RoomStatus.CLEANING}>Set Cleaning</option>
                      <option value={RoomStatus.MAINTENANCE}>Set Maintenance</option>
                    </select>
                  )}

                  {isRangeActive && statusForRange === RoomStatus.AVAILABLE && (
                    <button className="mt-2 w-full py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-900/10 hover:bg-emerald-700 transition-all">
                      Quick Reserve
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border-2 border-dashed border-slate-200">
          <div className="p-4 bg-slate-50 rounded-full mb-4">
            <Search size={32} className="text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No rooms found</h3>
          <p className="text-sm text-slate-500 mt-1">We couldn't find any rooms matching "{searchQuery}"</p>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-6 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Add Room Modal */}
      {showAddRoomForm && (
        <RoomForm
          categories={categories}
          onClose={() => setShowAddRoomForm(false)}
          onSubmit={(roomData) => {
            onAddRoom(roomData);
            setShowAddRoomForm(false);
          }}
        />
      )}
    </div>
  );
};

export default RoomGrid;
