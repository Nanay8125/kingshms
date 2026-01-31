
import React, { useMemo, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend, LineChart, Line
} from 'recharts';
import { Room, Booking, RoomCategory, Guest, RoomStatus, Task, StaffMember, TaskStatus } from '../types';
import { TrendingUp, DollarSign, Bed, Users, Percent, Globe, ExternalLink, CheckCircle2, ClipboardList, Briefcase, Filter } from 'lucide-react';

interface AnalyticsDashboardProps {
  rooms: Room[];
  bookings: Booking[];
  categories: RoomCategory[];
  guests: Guest[];
  tasks: Task[];
  staff: StaffMember[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ rooms, bookings, categories, guests, tasks, staff }) => {
  const [ageFilter, setAgeFilter] = useState<string>('All');

  const stats = useMemo(() => {
    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const occupiedCount = rooms.filter(r => r.status === RoomStatus.OCCUPIED).length;
    const occupancyRate = (occupiedCount / rooms.length) * 100;

    const adr = bookings.length > 0 ? totalRevenue / bookings.length : 0;
    const revPar = totalRevenue / (rooms.length || 1);

    return { totalRevenue, occupancyRate, adr, revPar, occupiedCount };
  }, [rooms, bookings]);

  const sourceData = useMemo(() => {
    const counts: { [key: string]: number } = {};
    bookings.forEach(b => {
      counts[b.source] = (counts[b.source] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [bookings]);

  const occupancyByCat = useMemo(() => {
    return categories.map(cat => {
      const catRooms = rooms.filter(r => r.categoryId === cat.id);
      const occupied = catRooms.filter(r => r.status === RoomStatus.OCCUPIED).length;
      return {
        name: cat.name,
        occupied,
        total: catRooms.length,
        rate: catRooms.length > 0 ? (occupied / catRooms.length) * 100 : 0
      };
    });
  }, [categories, rooms]);

  const taskPerformanceData = useMemo(() => {
    // Completion rate by Department
    const depts = Array.from(new Set(staff.map(s => s.department)));
    const deptStats = depts.map(dept => {
      const deptStaffIds = staff.filter(s => s.department === dept).map(s => s.id);
      const deptTasks = tasks.filter(t => t.assignedStaffId && deptStaffIds.includes(t.assignedStaffId));
      const completed = deptTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
      const total = deptTasks.length;
      return {
        name: dept,
        rate: total > 0 ? Math.round((completed / total) * 100) : 0,
        completed,
        total
      };
    });

    // Completion rate by Staff Member (top 5)
    const staffStats = staff.map(s => {
      const staffTasks = tasks.filter(t => t.assignedStaffId === s.id);
      const completed = staffTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
      const total = staffTasks.length;
      return {
        name: s.name.split(' ')[0],
        rate: total > 0 ? Math.round((completed / total) * 100) : 0,
        completed,
        total
      };
    }).sort((a, b) => b.rate - a.rate).slice(0, 5);

    // Weekly completion trend (simulated for demonstration based on createdAt)
    const dailyTrend: { [key: string]: number } = {};
    tasks.forEach(t => {
      const date = new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (t.status === TaskStatus.COMPLETED) {
        dailyTrend[date] = (dailyTrend[date] || 0) + 1;
      }
    });

    const trend = Object.entries(dailyTrend).map(([date, count]) => ({ date, count })).slice(-7);

    return { deptStats, staffStats, trend };
  }, [tasks, staff]);

  const revenueTrend = [
    { day: 'May 20', revenue: 4500, revPar: 450 },
    { day: 'May 21', revenue: 5200, revPar: 520 },
    { day: 'May 22', revenue: 4800, revPar: 480 },
    { day: 'May 23', revenue: 6100, revPar: 610 },
    { day: 'May 24', revenue: 7500, revPar: 750 },
    { day: 'May 25', revenue: 8900, revPar: 890 },
    { day: 'May 26', revenue: 8200, revPar: 820 },
  ];

  const nationalityData = useMemo(() => {
    const filteredGuests = ageFilter === 'All'
      ? guests
      : guests.filter(g => g.ageGroup === ageFilter);

    const counts: { [key: string]: number } = {};
    filteredGuests.forEach(g => {
      counts[g.nationality] = (counts[g.nationality] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [guests, ageFilter]);

  return (
    <div className="space-y-8 pb-12">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <DollarSign size={24} />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">+14.2%</span>
          </div>
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Total Revenue</p>
          <h3 className="text-3xl font-black text-slate-900 mt-1">${stats.totalRevenue.toLocaleString()}</h3>
          <p className="text-[10px] text-slate-400 mt-2 font-medium">Accumulated from all sources</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Percent size={24} />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">High</span>
          </div>
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Occupancy %</p>
          <h3 className="text-3xl font-black text-slate-900 mt-1">{stats.occupancyRate.toFixed(1)}%</h3>
          <p className="text-[10px] text-slate-400 mt-2 font-medium">{stats.occupiedCount} of {rooms.length} rooms occupied</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
              <CheckCircle2 size={24} />
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">Efficient</span>
          </div>
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Avg Task Rate</p>
          <h3 className="text-3xl font-black text-slate-900 mt-1">
            {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === TaskStatus.COMPLETED).length / tasks.length) * 100) : 0}%
          </h3>
          <p className="text-[10px] text-slate-400 mt-2 font-medium">Global completion average</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <TrendingUp size={24} />
            </div>
          </div>
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest">RevPAR</p>
          <h3 className="text-3xl font-black text-slate-900 mt-1">${stats.revPar.toFixed(2)}</h3>
          <p className="text-[10px] text-slate-400 mt-2 font-medium">Revenue per available room</p>
        </div>
      </div>

      {/* Task Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Briefcase size={20} className="text-indigo-600" />
                Departmental Completion Rates
              </h3>
              <p className="text-xs text-slate-400 font-medium">Efficiency tracking by operational division</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskPerformanceData.deptStats} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide domain={[0, 100]} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="rate" fill="#6366f1" radius={[0, 8, 8, 0]} barSize={24} label={{ position: 'right', formatter: (v: any) => `${v}%`, fontSize: 10, fontWeight: 'bold', fill: '#6366f1' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 mb-2 flex items-center gap-2">
            <ClipboardList size={20} className="text-emerald-500" />
            Staff Efficiency
          </h3>
          <p className="text-xs text-slate-400 font-medium mb-6">Top 5 performance by individual</p>
          <div className="space-y-4">
            {taskPerformanceData.staffStats.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 border border-slate-200">
                  #{i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-700">{s.name}</span>
                    <span className="text-[10px] font-black text-emerald-600">{s.rate}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    {/* eslint-disable-next-line react/forbid-dom-props */}
                    <div
                      className="h-full bg-emerald-500 rounded-full progress-bar-fill"
                      ref={(el) => {
                        if (el) el.style.setProperty('--progress-width', `${s.rate}%`);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Financial Trends */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black text-slate-800">Financial Performance</h3>
              <p className="text-xs text-slate-400 font-medium">Daily Revenue vs RevPAR analytics</p>
            </div>
            <button className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-xl transition-colors">
              Full Report <ExternalLink size={14} />
            </button>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="revPar" stroke="#10b981" strokeWidth={2} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking Sources */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 mb-2">Booking Channels</h3>
          <p className="text-xs text-slate-400 font-medium mb-8">Distribution by reservation source</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Occupancy by Category */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
            <Bed size={20} className="text-indigo-500" />
            Performance by Room Type
          </h3>
          <div className="space-y-6">
            {occupancyByCat.map((cat, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">{cat.name}</span>
                  <span className="text-xs font-black text-indigo-600">{cat.rate.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  {/* eslint-disable-next-line react/forbid-dom-props */}
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-1000 progress-bar-fill"
                    ref={(el) => {
                      if (el) el.style.setProperty('--progress-width', `${cat.rate}%`);
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>{cat.occupied} occupied</span>
                  <span>{cat.total} total</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Guest Demographics */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Globe size={20} className="text-emerald-500" />
                Top Guest Nationalities
              </h3>
              <p className="text-xs text-slate-400 font-medium">Geographic distribution of visitors</p>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 p-1.5 rounded-xl">
              <Filter size={14} className="text-slate-400 ml-1.5" />
              <select
                className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-600 focus:outline-none cursor-pointer pr-2"
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value)}
                aria-label="Filter guests by age group"
              >
                <option value="All">All Ages</option>
                <option value="18-25">18-25</option>
                <option value="26-35">26-35</option>
                <option value="36-50">36-50</option>
                <option value="50+">50+</option>
              </select>
            </div>
          </div>

          <div className="h-64 mt-6">
            {nationalityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={nationalityData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#10b981" radius={[0, 8, 8, 0]} barSize={24} label={{ position: 'right', fontSize: 10, fontWeight: 'bold', fill: '#10b981' }} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300">
                <Users size={32} className="opacity-20 mb-2" />
                <p className="text-xs font-bold uppercase tracking-widest">No guests in this group</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
