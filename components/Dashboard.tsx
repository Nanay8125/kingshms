
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, Users, Bed, CreditCard, ClipboardList, Star, Globe, Sparkles } from 'lucide-react';
import { Room, Booking, RoomStatus, Task, TaskStatus, Feedback, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface DashboardProps {
  rooms: Room[];
  bookings: Booking[];
  tasks?: Task[];
  feedback?: Feedback[];
  onPreviewWebsite?: () => void;
  language: Language;
}

const Dashboard: React.FC<DashboardProps> = ({ rooms, bookings, tasks = [], feedback = [], onPreviewWebsite, language }) => {
  const t = (key: string) => TRANSLATIONS[language][key] || key;
  
  const occupiedCount = rooms.filter(r => r.status === RoomStatus.OCCUPIED).length;
  const occupancyRate = (occupiedCount / rooms.length) * 100;
  const totalRevenue = bookings.reduce((acc, b) => acc + b.totalPrice, 0);
  const pendingTasks = tasks.filter(t => t.status !== TaskStatus.COMPLETED).length;
  const avgRating = feedback.length > 0 ? feedback.reduce((a, b) => a + b.rating, 0) / feedback.length : 0;

  const directBookings = bookings.filter(b => b.source === 'Direct');
  const directRevenue = directBookings.reduce((acc, b) => acc + b.totalPrice, 0);
  const commissionSaved = directRevenue * 0.15; // Assume 15% OTA commission

  const data = [
    { name: 'Mon', revenue: 4000, occupancy: 70 },
    { name: 'Tue', revenue: 3000, occupancy: 65 },
    { name: 'Wed', revenue: 5000, occupancy: 85 },
    { name: 'Thu', revenue: 2780, occupancy: 60 },
    { name: 'Fri', revenue: 6890, occupancy: 95 },
    { name: 'Sat', revenue: 8390, occupancy: 100 },
    { name: 'Sun', revenue: 4490, occupancy: 75 },
  ];

  const StatCard = ({ title, value, subValue, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        <span className="text-sm font-medium text-emerald-600 flex items-center gap-1">
          <TrendingUp size={14} /> +12%
        </span>
      </div>
      <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{subValue}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Promo Banner for Direct Bookings */}
      <div className="bg-indigo-600 rounded-[32px] p-6 sm:p-8 text-white flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl shadow-indigo-900/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full" />
        <div className="relative z-10 space-y-2 text-center lg:text-left">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{t('directBookingsBanner')}</h2>
          <p className="text-indigo-100 font-medium max-w-lg mx-auto lg:mx-0">
            {language === 'en' 
              ? 'Stop paying 15-20% OTA commissions. Your guest-facing booking engine is live and optimized for conversion.'
              : 'Arrêtez de payer 15-20% de commissions OTA. Votre moteur de réservation client est en ligne et optimisé pour la conversion.'}
          </p>
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
            <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/20">
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">Comm. Saved (Est)</p>
              <p className="text-lg sm:text-xl font-black">${commissionSaved.toLocaleString()}</p>
            </div>
            <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/20">
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">Direct Share</p>
              <p className="text-lg sm:text-xl font-black">{bookings.length > 0 ? Math.round((directBookings.length / bookings.length) * 100) : 0}%</p>
            </div>
          </div>
        </div>
        <button 
          onClick={onPreviewWebsite}
          className="relative z-10 w-full lg:w-auto px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black shadow-xl hover:bg-indigo-50 transition-all active:scale-95 flex items-center justify-center gap-3"
        >
          <Globe size={20} />
          {t('previewPortal')}
          <Sparkles size={16} className="text-amber-500" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={t('totalRevenue')} 
          value={`$${totalRevenue.toLocaleString()}`} 
          subValue={t('vsLastMonth')}
          icon={CreditCard}
          color="bg-indigo-500"
        />
        <StatCard 
          title={t('occupancyRate')} 
          value={`${occupancyRate.toFixed(1)}%`} 
          subValue={`${occupiedCount} ${t('rooms')} ${t('occupied')}`}
          icon={Bed}
          color="bg-emerald-500"
        />
        <StatCard 
          title={t('guestRating')} 
          value={`${avgRating.toFixed(1)} / 5`} 
          subValue={`${feedback.length} ${t('internalReviews')}`}
          icon={Star}
          color="bg-amber-500"
        />
        <StatCard 
          title={t('operationTasks')} 
          value={pendingTasks.toString()} 
          subValue={t('unfinishedTasks')}
          icon={ClipboardList}
          color="bg-rose-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 mb-6">{language === 'en' ? 'Revenue Performance' : 'Performance des Revenus'}</h3>
          <div className="h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 mb-6">{language === 'en' ? 'Occupancy Trends' : 'Tendances d\'Occupation'}</h3>
          <div className="h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                   cursor={{fill: '#f8fafc'}}
                   contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                />
                <Bar dataKey="occupancy" fill="#10b981" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
