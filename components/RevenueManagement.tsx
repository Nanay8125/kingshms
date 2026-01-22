
import React, { useMemo, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, Cell, ComposedChart, Line
} from 'recharts';
import { Room, Booking, RoomCategory, RoomStatus } from '../types';
// Added missing 'X' icon to the imports list
import { TrendingUp, DollarSign, Target, Sparkles, ArrowUpRight, ArrowDownRight, RefreshCw, Zap, ShieldCheck, CalendarDays, Percent, Edit3, RotateCcw, Save, Check, X } from 'lucide-react';
import { generateRevenueStrategy } from '../services/geminiService';

interface RevenueManagementProps {
  rooms: Room[];
  bookings: Booking[];
  categories: RoomCategory[];
}

const RevenueManagement: React.FC<RevenueManagementProps> = ({ rooms, bookings, categories }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiStrategy, setAiStrategy] = useState<string | null>(null);
  
  // State for manual overrides
  // Map of categoryId -> manual price
  const [manualOverrides, setManualOverrides] = useState<Record<string, number>>({});
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');

  // Current day context for dynamic pricing
  const today = new Date().getDay();
  const isWeekend = today === 0 || today === 5 || today === 6; // Sun, Fri, Sat

  const stats = useMemo(() => {
    const totalRev = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const adr = bookings.length > 0 ? totalRev / bookings.length : 0;
    const revPar = totalRev / (rooms.length || 1);
    const gopar = totalRev * 0.45 / (rooms.length || 1); // Simulated 45% margin

    return { totalRev, adr, revPar, gopar };
  }, [rooms, bookings]);

  const categoryOccupancy = useMemo(() => {
    const occMap: Record<string, { occupied: number; total: number; rate: number }> = {};
    
    categories.forEach(cat => {
      const catRooms = rooms.filter(r => r.categoryId === cat.id);
      const occupied = catRooms.filter(r => r.status === RoomStatus.OCCUPIED).length;
      occMap[cat.id] = {
        occupied,
        total: catRooms.length,
        rate: catRooms.length > 0 ? (occupied / catRooms.length) * 100 : 0
      };
    });
    
    return occMap;
  }, [rooms, categories]);

  const forecastData = [
    { day: 'Mon', actual: 4200, forecast: 4400 },
    { day: 'Tue', actual: 3800, forecast: 4000 },
    { day: 'Wed', actual: 5100, forecast: 4900 },
    { day: 'Thu', actual: 4800, forecast: 5200 },
    { day: 'Fri', actual: 7200, forecast: 7500 },
    { day: 'Sat', actual: 8900, forecast: 9200 },
    { day: 'Sun', actual: 6500, forecast: 6800 },
  ];

  const handleGenerateStrategy = async () => {
    setIsGenerating(true);
    const strategy = await generateRevenueStrategy(categories, bookings);
    setAiStrategy(strategy);
    setIsGenerating(false);
  };

  const startEditing = (id: string, currentPrice: number) => {
    setEditingCategoryId(id);
    setTempPrice(currentPrice.toFixed(0));
  };

  const saveOverride = (id: string) => {
    const price = parseFloat(tempPrice);
    if (!isNaN(price) && price >= 0) {
      setManualOverrides(prev => ({ ...prev, [id]: price }));
      setEditingCategoryId(null);
    }
  };

  const resetOverride = (id: string) => {
    const next = { ...manualOverrides };
    delete next[id];
    setManualOverrides(next);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Revenue KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Revenue</p>
          <h3 className="text-2xl font-black text-slate-900">${stats.totalRev.toLocaleString()}</h3>
          <div className="flex items-center gap-1 mt-2 text-emerald-600 text-xs font-bold">
            <TrendingUp size={14} /> +18.4% <span className="text-slate-400 font-medium">vs LW</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">ADR (Avg Daily Rate)</p>
          <h3 className="text-2xl font-black text-slate-900">${stats.adr.toFixed(2)}</h3>
          <div className="flex items-center gap-1 mt-2 text-emerald-600 text-xs font-bold">
            <ArrowUpRight size={14} /> $12.50 <span className="text-slate-400 font-medium">increase</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">RevPAR</p>
          <h3 className="text-2xl font-black text-slate-900">${stats.revPar.toFixed(2)}</h3>
          <div className="flex items-center gap-1 mt-2 text-rose-600 text-xs font-bold">
            <ArrowDownRight size={14} /> -2.1% <span className="text-slate-400 font-medium">vs target</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600" />
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">GOPPAR (Simulated)</p>
          <h3 className="text-2xl font-black text-slate-900">${stats.gopar.toFixed(2)}</h3>
          <div className="flex items-center gap-1 mt-2 text-emerald-600 text-xs font-bold">
            <ShieldCheck size={14} /> Optimized <span className="text-slate-400 font-medium">margin</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Demand & Forecast Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Target size={20} className="text-indigo-600" />
                Revenue Forecast
              </h3>
              <p className="text-xs text-slate-400 font-medium">AI predicted income vs actual performance</p>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-indigo-500" />
                 <span className="text-[10px] font-black uppercase text-slate-400">Actual</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-indigo-200" />
                 <span className="text-[10px] font-black uppercase text-slate-400">Forecast</span>
               </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} 
                />
                <Bar dataKey="actual" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
                <Line type="monotone" dataKey="forecast" stroke="#94a3b8" strokeWidth={3} strokeDasharray="8 8" dot={{fill: '#fff', stroke: '#94a3b8', strokeWidth: 2, r: 4}} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Strategy Advice */}
        <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-900/20 relative overflow-hidden">
          <Sparkles className="absolute top-4 right-4 text-indigo-400 opacity-30" size={64} />
          <h3 className="text-xl font-black mb-2 flex items-center gap-2">
            <Zap size={20} className="text-indigo-200" />
            AI Pricing Engine
          </h3>
          <p className="text-indigo-100 text-xs font-medium leading-relaxed mb-6">
            Gemini analyses market trends and booking patterns to optimize your RevPAR.
          </p>
          
          <div className="space-y-6">
            <button 
              onClick={handleGenerateStrategy}
              disabled={isGenerating}
              className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-sm hover:bg-indigo-50 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {isGenerating ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
              {aiStrategy ? 'Refresh Strategy' : 'Generate Strategy'}
            </button>

            {aiStrategy && (
              <div className="p-5 bg-white/10 border border-white/20 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-3 flex items-center gap-2">
                  <ShieldCheck size={14} /> AI Recommendations
                </p>
                <div className="text-xs text-indigo-50 leading-relaxed whitespace-pre-wrap">
                  {aiStrategy}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Pricing Table */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <DollarSign size={20} className="text-emerald-500" />
            Dynamic Rate Management
          </h3>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
             <CalendarDays size={14} className="text-indigo-500" />
             <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider">
               Today: {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today]} 
               {isWeekend ? ' (Weekend Mode)' : ' (Weekday Mode)'}
             </span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Room Category</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Base Rate</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Demand Factors</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">AI Optimized</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Final Rate</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {categories.map((cat, idx) => {
                const occ = categoryOccupancy[cat.id] || { rate: 0 };
                const isVilla = cat.name === 'Presidential Villa';
                
                let optimized = cat.basePrice;
                let priceLabel = 'Market Rate';
                let isIncrease = false;
                
                // Implement Presidential Villa specific logic
                if (isVilla) {
                  if (isWeekend) {
                    optimized = cat.basePrice * 1.15;
                    priceLabel = 'Weekend Peak (+15%)';
                    isIncrease = true;
                  } else {
                    optimized = cat.basePrice * 0.90;
                    priceLabel = 'Weekday Saver (-10%)';
                    isIncrease = false;
                  }
                } else {
                  // Standard AI logic for others based on occupancy & general demand
                  const baseDemand = (idx + today) % 2 === 0;
                  const occPremium = occ.rate > 70 ? 0.05 : 0;
                  const multiplier = baseDemand ? 1.05 + occPremium : 0.98;
                  optimized = cat.basePrice * multiplier;
                  isIncrease = multiplier > 1;
                  priceLabel = occ.rate > 70 ? 'High Occ. Premium' : (baseDemand ? 'Steady Interest' : 'Volume Strategy');
                }

                const manualPrice = manualOverrides[cat.id];
                const finalRate = manualPrice !== undefined ? manualPrice : optimized;
                const isOverridden = manualPrice !== undefined;
                const isEditing = editingCategoryId === cat.id;

                return (
                  <tr key={cat.id} className={`group transition-colors ${isEditing ? 'bg-indigo-50/30' : 'hover:bg-slate-50'}`}>
                    <td className="py-5">
                      <p className="font-bold text-slate-800">{cat.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Occupancy: {occ.rate.toFixed(1)}%</p>
                    </td>
                    <td className="py-5 text-center font-black text-slate-600">${cat.basePrice}</td>
                    <td className="py-5 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          occ.rate > 60 ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {occ.rate > 60 ? 'High Demand' : 'Normal'}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 italic">{priceLabel}</span>
                      </div>
                    </td>
                    <td className="py-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                         <span className={`text-sm font-black ${isIncrease ? 'text-rose-600' : 'text-emerald-600'}`}>
                           ${optimized.toFixed(0)}
                         </span>
                         {isIncrease ? (
                           <TrendingUp size={12} className="text-rose-500" />
                         ) : (
                           <TrendingUp size={12} className="text-emerald-500 rotate-180" />
                         )}
                      </div>
                    </td>
                    <td className="py-5 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-sm font-black text-slate-400">$</span>
                          <input 
                            type="number"
                            className="w-20 px-2 py-1 bg-white border border-indigo-200 rounded-lg text-sm font-black text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            value={tempPrice}
                            autoFocus
                            onChange={e => setTempPrice(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && saveOverride(cat.id)}
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="flex items-center justify-center gap-2">
                            <span className={`text-lg font-black ${isOverridden ? 'text-indigo-600' : 'text-slate-900'}`}>
                              ${finalRate.toFixed(0)}
                            </span>
                            {isOverridden && (
                              <span className="bg-indigo-100 text-indigo-700 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest">Manual</span>
                            )}
                          </div>
                          {isOverridden && (
                            <div className="flex items-center gap-1 text-[9px] font-bold">
                              <span className={finalRate > optimized ? 'text-rose-500' : 'text-emerald-500'}>
                                {finalRate > optimized ? '+' : ''}{(finalRate - optimized).toFixed(0)}$ from AI
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-5 text-right">
                       <div className="flex items-center justify-end gap-2">
                          {isEditing ? (
                            <>
                              <button 
                                onClick={() => setEditingCategoryId(null)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                              >
                                <X size={16} />
                              </button>
                              <button 
                                onClick={() => saveOverride(cat.id)}
                                className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-900/10"
                              >
                                <Check size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              {isOverridden && (
                                <button 
                                  onClick={() => resetOverride(cat.id)}
                                  className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                                  title="Revert to AI recommendation"
                                >
                                  <RotateCcw size={16} />
                                </button>
                              )}
                              <button 
                                onClick={() => startEditing(cat.id, finalRate)}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                title="Adjust price manually"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${
                                isOverridden 
                                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                                  : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white'
                              }`}>
                                {isOverridden ? 'Apply Manual' : 'Apply AI'}
                              </button>
                            </>
                          )}
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-start gap-4">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0">
              <Percent size={18} />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-1">Dynamic Strategy Status</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                The Presidential Villa pricing is strictly governed by day-of-week rules (+15% Weekends / -10% Weekdays). 
                Other categories are optimized using real-time occupancy data.
              </p>
            </div>
          </div>
          
          <div className="p-5 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-1">Manual Overrides Permitted</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Adjust optimized rates based on local events or groups not yet reflected in occupancy trends. Manual prices will persist until reset.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueManagement;
