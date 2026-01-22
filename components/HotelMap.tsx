import React, { useState, useMemo } from 'react';
import { Room, RoomStatus, RoomCategory, Booking } from '../types';
import { 
  Layers, 
  Map as MapIcon, 
  Info, 
  CheckCircle2, 
  UserCheck, 
  Clock, 
  Hammer,
  Navigation,
  ChevronRight,
  Maximize2
} from 'lucide-react';

interface HotelMapProps {
  rooms: Room[];
  categories: RoomCategory[];
  bookings: Booking[];
  onRoomClick: (room: Room) => void;
}

const HotelMap: React.FC<HotelMapProps> = ({ rooms, categories, bookings, onRoomClick }) => {
  const [activeFloor, setActiveFloor] = useState<number>(1);

  const floors = useMemo(() => {
    const floorSet = new Set(rooms.map(r => r.floor));
    // Added explicit types for sort parameters to fix arithmetic operation error
    return Array.from(floorSet).sort((a: number, b: number) => a - b);
  }, [rooms]);

  const roomsOnFloor = useMemo(() => {
    return rooms.filter(r => r.floor === activeFloor).sort((a, b) => a.number.localeCompare(b.number));
  }, [rooms, activeFloor]);

  const getStatusColor = (status: RoomStatus) => {
    switch (status) {
      case RoomStatus.AVAILABLE: return 'bg-emerald-500';
      case RoomStatus.OCCUPIED: return 'bg-indigo-500';
      case RoomStatus.CLEANING: return 'bg-amber-500';
      case RoomStatus.MAINTENANCE: return 'bg-rose-500';
      default: return 'bg-slate-400';
    }
  };

  const getStatusLightColor = (status: RoomStatus) => {
    switch (status) {
      case RoomStatus.AVAILABLE: return 'bg-emerald-50 border-emerald-100 text-emerald-700';
      case RoomStatus.OCCUPIED: return 'bg-indigo-50 border-indigo-100 text-indigo-700';
      case RoomStatus.CLEANING: return 'bg-amber-50 border-amber-100 text-amber-700';
      case RoomStatus.MAINTENANCE: return 'bg-rose-50 border-rose-100 text-rose-700';
      default: return 'bg-slate-50 border-slate-100 text-slate-700';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Floor Navigator Sidebar */}
      <div className="lg:w-64 space-y-6">
        <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <Navigation size={14} className="text-indigo-500" /> Floor Navigator
          </h3>
          <div className="space-y-2">
            {floors.map(floor => (
              <button
                key={floor}
                onClick={() => setActiveFloor(floor)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all group ${
                  activeFloor === floor 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Layers size={18} className={activeFloor === floor ? 'text-indigo-200' : 'text-slate-400'} />
                  <span className="font-bold">Floor {floor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black ${activeFloor === floor ? 'text-indigo-100' : 'text-slate-400'}`}>
                    {rooms.filter(r => r.floor === floor).length} Units
                  </span>
                  <ChevronRight size={14} className={activeFloor === floor ? 'text-white' : 'text-slate-300'} />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Legend</h3>
          <div className="space-y-3">
            {Object.values(RoomStatus).map(status => (
              <div key={status} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(status)} shadow-sm`} />
                <span className="text-xs font-bold text-slate-600 capitalize">{status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map View Area */}
      <div className="flex-1 space-y-6">
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm min-h-[500px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Interactive Floor Plan</h2>
              <p className="text-sm font-medium text-slate-400">Current View: <span className="text-indigo-600 font-bold">Level {activeFloor}</span></p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-6 px-6 py-2 bg-slate-50 border border-slate-100 rounded-2xl">
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available</p>
                  <p className="text-sm font-black text-emerald-600">{roomsOnFloor.filter(r => r.status === RoomStatus.AVAILABLE).length}</p>
                </div>
                <div className="w-px h-6 bg-slate-200" />
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Occupied</p>
                  <p className="text-sm font-black text-indigo-600">{roomsOnFloor.filter(r => r.status === RoomStatus.OCCUPIED).length}</p>
                </div>
              </div>
              <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-600 hover:bg-slate-100 transition-all border border-slate-100">
                <Maximize2 size={20} />
              </button>
            </div>
          </div>

          {/* Schematic Layout */}
          <div className="flex-1 bg-slate-50/50 rounded-[32px] border-4 border-dashed border-slate-100 p-10 relative overflow-hidden">
             {/* Schematic Hallway Effect */}
             <div className="absolute inset-x-10 top-1/2 -translate-y-1/2 h-20 bg-white/40 border-y border-slate-200 z-0 pointer-events-none" />
             
             <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-8">
               {roomsOnFloor.map(room => {
                 const cat = categories.find(c => c.id === room.categoryId);
                 const activeBooking = bookings.find(b => b.roomId === room.id && b.status === 'checked-in');
                 
                 return (
                   <button
                     key={room.id}
                     onClick={() => onRoomClick(room)}
                     className={`group relative h-36 rounded-3xl border-2 transition-all hover:scale-105 active:scale-95 flex flex-col p-4 shadow-sm hover:shadow-xl ${
                       getStatusLightColor(room.status)
                     } ${room.status === RoomStatus.AVAILABLE ? 'hover:border-emerald-500' : 'hover:border-indigo-500'}`}
                   >
                     <div className="flex items-start justify-between w-full">
                       <span className="text-xl font-black">{room.number}</span>
                       <div className={`p-1.5 rounded-lg bg-white/50 backdrop-blur-sm`}>
                         {room.status === RoomStatus.AVAILABLE && <CheckCircle2 size={14} />}
                         {room.status === RoomStatus.OCCUPIED && <UserCheck size={14} />}
                         {room.status === RoomStatus.CLEANING && <Clock size={14} />}
                         {room.status === RoomStatus.MAINTENANCE && <Hammer size={14} />}
                       </div>
                     </div>
                     
                     <div className="mt-auto text-left">
                       <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest truncate">{cat?.name}</p>
                       {activeBooking && (
                         <div className="mt-1.5 flex items-center gap-1">
                           <div className="w-1 h-1 bg-indigo-400 rounded-full animate-pulse" />
                           <p className="text-[9px] font-black truncate text-indigo-700">GUEST IN-HOUSE</p>
                         </div>
                       )}
                     </div>

                     {/* Tooltip on hover (simulated) */}
                     <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 rounded-3xl pointer-events-none" />
                   </button>
                 );
               })}
             </div>

             {roomsOnFloor.length === 0 && (
               <div className="h-full flex flex-col items-center justify-center text-slate-300 py-20">
                 <MapIcon size={48} className="mb-4 opacity-20" />
                 <p className="font-bold">No rooms configured for this level.</p>
               </div>
             )}
          </div>

          <div className="mt-8 flex items-center justify-center gap-8">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-slate-300" /> North Wing
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-slate-300" /> South Wing
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-slate-300" /> Signature Suites
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelMap;