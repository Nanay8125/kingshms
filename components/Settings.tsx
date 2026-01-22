
import React, { useState } from 'react';
import { 
  UserPlus, 
  Trash2, 
  Shield, 
  Search, 
  ShieldAlert, 
  AlertTriangle, 
  UserCog, 
  Key,
  Mail,
  Smartphone,
  CheckCircle2,
  X,
  Info,
  ShieldCheck,
  Lock,
  Eye,
  Settings as SettingsIcon
} from 'lucide-react';
import { StaffMember, UserRole } from '../types';

interface SettingsProps {
  staff: StaffMember[];
  onAddStaff: () => void;
  onDeleteStaff: (staffId: string) => void;
  currentUser: StaffMember;
}

const Settings: React.FC<SettingsProps> = ({ staff, onAddStaff, onDeleteStaff, currentUser }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case UserRole.MANAGEMENT: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case UserRole.FRONT_DESK: return 'bg-blue-100 text-blue-700 border-blue-200';
      case UserRole.HOUSEKEEPING: return 'bg-amber-100 text-amber-700 border-amber-200';
      case UserRole.MAINTENANCE: return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const roleDefinitions = [
    { role: 'Administrator', icon: ShieldAlert, color: 'text-indigo-600', access: 'Full terminal access. Revenue, Settings, and User Management.' },
    { role: 'Management', icon: UserCog, color: 'text-emerald-600', access: 'Operational control. Analytics, Revenue, and Staff Directory access.' },
    { role: 'Front Desk', icon: Info, color: 'text-blue-600', access: 'Guest-facing. Booking control, Guest logs, and Messaging Hub.' },
    { role: 'Operations', icon: SettingsIcon, color: 'text-amber-600', access: 'Service-facing. Task board and Departmental Inbox access only.' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Account Management Header */}
      <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-indigo-600 text-white rounded-3xl shadow-xl shadow-indigo-200/50">
            <UserCog size={36} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">User Management</h2>
            <p className="text-sm font-medium text-slate-500">Add, manage, or revoke access keys for the LuxeStay HMS terminal.</p>
          </div>
        </div>
        <button 
          onClick={onAddStaff}
          className="w-full md:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/20 active:scale-95"
        >
          <UserPlus size={18} />
          Onboard New Account
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* User Table Card */}
        <div className="xl:col-span-2 bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Shield size={14} className="text-indigo-500" /> System Registry
            </h3>
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Filter by name, email or role..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Active User</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Credentials</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Security Level</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStaff.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                           <img src={member.avatar} className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-100 shadow-sm" alt={member.name} />
                           <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${member.status === 'offline' ? 'bg-slate-300' : 'bg-emerald-500'}`} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 flex items-center gap-2">
                            {member.name}
                            {member.id === currentUser.id && (
                              <span className="bg-indigo-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Self</span>
                            )}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{member.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <Mail size={12} className="text-slate-400" /> {member.email}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <Smartphone size={12} className="text-slate-400" /> {member.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm inline-block ${getRoleBadgeColor(member.permissionRole)}`}>
                        {member.permissionRole.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="View Terminal Logs">
                          <Eye size={18} />
                        </button>
                        <button className="p-2.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Reset Credentials">
                          <Key size={18} />
                        </button>
                        <button 
                          onClick={() => setConfirmDelete(member.id)}
                          disabled={member.id === currentUser.id}
                          className={`p-2.5 rounded-xl transition-all ${
                            member.id === currentUser.id 
                              ? 'text-slate-100 cursor-not-allowed' 
                              : 'text-slate-300 hover:text-rose-600 hover:bg-rose-50'
                          }`}
                          title="Revoke Access"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredStaff.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center py-32 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-6">
                <ShieldAlert size={40} />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-1">No matches found</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Refine your search parameters</p>
            </div>
          )}
        </div>

        {/* Permissions Guide Side Column */}
        <div className="space-y-8">
          <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl shadow-indigo-900/20 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full" />
             <h3 className="text-lg font-black mb-6 flex items-center gap-3">
               <ShieldCheck className="text-indigo-400" /> Permissions Reference
             </h3>
             <div className="space-y-6">
               {roleDefinitions.map((def, i) => (
                 <div key={i} className="flex gap-4 group">
                    <div className={`p-2.5 rounded-2xl bg-white/5 border border-white/10 ${def.color} transition-colors group-hover:bg-white/10`}>
                      <def.icon size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-indigo-200 mb-1">{def.role}</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{def.access}</p>
                    </div>
                 </div>
               ))}
             </div>
          </div>

          <div className="bg-amber-50 p-8 rounded-[40px] border border-amber-100">
             <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-500 text-white rounded-xl">
                  <Lock size={18} />
                </div>
                <h4 className="text-sm font-black text-amber-800 uppercase tracking-widest">Security Warning</h4>
             </div>
             <p className="text-xs text-amber-700 font-medium leading-relaxed">
               Revoking access is immediate and permanent. The targeted user will be logged out of all active sessions and their terminal keys will be invalidated.
             </p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-rose-600 px-8 py-6 flex items-center justify-between text-white">
              <h2 className="text-xl font-black flex items-center gap-3">
                <AlertTriangle size={24} />
                Revoke Access
              </h2>
              <button onClick={() => setConfirmDelete(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                <ShieldAlert size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3">Confirm Account Deletion</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
                Are you sure you want to permanently revoke access for <strong>{staff.find(s => s.id === confirmDelete)?.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 rounded-2xl transition-all"
                >
                  Discard
                </button>
                <button 
                  onClick={() => {
                    if (confirmDelete) {
                      onDeleteStaff(confirmDelete);
                      setConfirmDelete(null);
                    }
                  }}
                  className="flex-[1.5] px-6 py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-rose-700 transition-all shadow-xl shadow-rose-900/20 flex items-center justify-center gap-3"
                >
                  <CheckCircle2 size={20} />
                  Revoke Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
