import React, { useState } from 'react';
import {
  LayoutDashboard,
  Bed,
  Users,
  CalendarCheck,
  Settings,
  LogOut,
  Hotel,
  BarChart3,
  ClipboardList,
  MessageSquare,
  Send,
  UserCircle2,
  Bell,
  CheckCircle2,
  Clock,
  AlertCircle,
  Coins,
  MessageCircle,
  Languages,
  Menu,
  X,
  Utensils,
  Layers
} from 'lucide-react';
import { InAppNotification, StaffMember, UserRole, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notificationCount?: number;
  inAppNotifications?: InAppNotification[];
  onMarkNotifRead?: (id: string) => void;
  staff?: StaffMember[];
  currentUser: StaffMember;
  onLogout: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  notificationCount = 0,
  inAppNotifications = [],
  // Fixed: explicitly typed the default function parameter to prevent "Expected 0 arguments" error
  onMarkNotifRead = (_id: string) => {},
  staff = [],
  currentUser,
  onLogout,
  language,
  onLanguageChange
}) => {
  const [isNotifTrayOpen, setIsNotifTrayOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const t = (key: string) => TRANSLATIONS[language][key] || key;

  const menuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.MANAGEMENT, UserRole.FRONT_DESK, UserRole.HOUSEKEEPING, UserRole.MAINTENANCE] },
    { id: 'rooms', label: t('rooms'), icon: Bed, roles: [UserRole.ADMIN, UserRole.MANAGEMENT, UserRole.FRONT_DESK, UserRole.HOUSEKEEPING, UserRole.MAINTENANCE] },
    { id: 'bookings', label: t('bookings'), icon: CalendarCheck, roles: [UserRole.ADMIN, UserRole.MANAGEMENT, UserRole.FRONT_DESK] },
    { id: 'guests', label: t('guests'), icon: Users, roles: [UserRole.ADMIN, UserRole.MANAGEMENT, UserRole.FRONT_DESK] },
    { id: 'messages', label: t('messages'), icon: MessageCircle, roles: [UserRole.ADMIN, UserRole.MANAGEMENT, UserRole.FRONT_DESK] },
    { id: 'staff', label: t('staff'), icon: UserCircle2, roles: [UserRole.ADMIN, UserRole.MANAGEMENT] },
    { id: 'categories', label: 'Room Categories', icon: Layers, roles: [UserRole.ADMIN, UserRole.MANAGEMENT] },
    { id: 'menu', label: 'Menu Management', icon: Utensils, roles: [UserRole.ADMIN, UserRole.MANAGEMENT] },
    { id: 'tasks', label: t('tasks'), icon: ClipboardList, roles: [UserRole.ADMIN, UserRole.MANAGEMENT, UserRole.FRONT_DESK, UserRole.HOUSEKEEPING, UserRole.MAINTENANCE] },
    { id: 'inbox', label: t('inbox'), icon: Send, badge: notificationCount, roles: [UserRole.ADMIN, UserRole.MANAGEMENT, UserRole.FRONT_DESK, UserRole.HOUSEKEEPING, UserRole.MAINTENANCE] },
    { id: 'feedback', label: t('feedback'), icon: MessageSquare, roles: [UserRole.ADMIN, UserRole.MANAGEMENT] },
    { id: 'revenue', label: t('revenue'), icon: Coins, roles: [UserRole.ADMIN, UserRole.MANAGEMENT] },
    { id: 'analytics', label: t('analytics'), icon: BarChart3, roles: [UserRole.ADMIN, UserRole.MANAGEMENT] },
    { id: 'settings', label: t('settings'), icon: Settings, roles: [UserRole.ADMIN] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(currentUser.permissionRole));
  const unreadCount = inAppNotifications.filter(n => !n.read).length;

  const handleTabSelect = (tab: string) => {
    setActiveTab(tab);
    setIsSidebarOpen(false); // Close sidebar on mobile/tablet after selection
  };

  return (
    <div className="flex h-screen bg-[#0f172a] overflow-hidden relative">
      {/* Mobile/Tablet Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col shrink-0 border-r border-white/5 transition-transform duration-300 transform
        lg:static lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500 p-2 rounded-lg">
              <Hotel size={24} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">LuxeStay</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-white" aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabSelect(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium text-left">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full ring-2 ring-slate-900">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 rounded-xl transition-all w-full"
          >
            <LogOut size={20} />
            <span className="font-medium">{t('signOut')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0 relative z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg sm:text-xl font-semibold text-slate-800 capitalize truncate">
              {activeTab.replace('-', ' ')}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-6">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
               <button
                 onClick={() => onLanguageChange('en')}
                 className={`px-2 sm:px-3 py-1 rounded-lg text-[10px] font-black tracking-widest transition-all ${language === 'en' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 EN
               </button>
               <button
                 onClick={() => onLanguageChange('fr')}
                 className={`px-2 sm:px-3 py-1 rounded-lg text-[10px] font-black tracking-widest transition-all ${language === 'fr' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 FR
               </button>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotifTrayOpen(!isNotifTrayOpen)}
                className={`p-2 rounded-xl transition-all relative ${
                  isNotifTrayOpen ? 'bg-slate-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                }`}
                aria-label="Notifications"
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[8px] font-black flex items-center justify-center rounded-full ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {isNotifTrayOpen && (
                <div className="absolute right-0 top-14 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Recent Activity</h3>
                    <span className="text-[10px] font-bold text-slate-400">{inAppNotifications.length} alerts</span>
                  </div>
                  <div className="max-h-[350px] overflow-y-auto">
                    {inAppNotifications.length > 0 ? (
                      inAppNotifications.map(notif => {
                        const targetStaff = staff.find(s => s.id === notif.staffId);
                        return (
                          <div
                            key={notif.id}
                            onClick={() => onMarkNotifRead(notif.id)}
                            className={`p-4 border-b border-slate-50 flex items-start gap-3 hover:bg-slate-50 cursor-pointer transition-colors ${!notif.read ? 'bg-indigo-50/30' : ''}`}
                          >
                            <div className={`p-1.5 rounded-lg shrink-0 ${notif.type === 'task' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'}`}>
                              {notif.type === 'task' ? <ClipboardList size={16} /> : <AlertCircle size={16} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-0.5">
                                <h4 className="text-xs font-bold text-slate-800 truncate">{notif.title}</h4>
                                <span className="text-[9px] text-slate-400 font-medium shrink-0 ml-2">{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 line-clamp-2 mb-2">{notif.message}</p>
                              {targetStaff && (
                                <div className="flex items-center gap-1.5">
                                  <img src={targetStaff.avatar} alt={`${targetStaff.name} avatar`} className="w-4 h-4 rounded-full" />
                                  <span className="text-[9px] font-bold text-indigo-600">Assignee: {targetStaff.name}</span>
                                </div>
                              )}
                            </div>
                            {!notif.read && <div className="w-2 h-2 bg-indigo-500 rounded-full shrink-0 mt-1" />}
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-10 text-center text-slate-300">
                        <Clock size={32} className="mx-auto mb-3 opacity-20" />
                        <p className="text-xs font-bold">No activity logged</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 ml-2 sm:ml-0">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">{currentUser.name}</p>
                <p className="text-xs text-slate-500">{currentUser.role}</p>
              </div>
              <img
                src={currentUser.avatar}
                alt={`${currentUser.name} avatar`}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-slate-200 object-cover"
              />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#0f172a]">
          <div className="max-w-[1600px] mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
