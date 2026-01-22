import React, { useState, useMemo } from 'react';
import {
  User,
  Phone,
  Briefcase,
  MoreVertical,
  Search,
  Plus,
  Filter,
  LayoutGrid,
  X,
  Mail,
  SortAsc,
  UserCheck,
  UserMinus,
  RotateCcw,
  Activity,
  Key,
  KeyRound,
  Ban,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { StaffMember, StaffStatus, Task, TaskStatus, UserRole } from '../types';

interface StaffManagementProps {
  staff: StaffMember[];
  tasks: Task[];
  onUpdateStaffStatus: (staffId: string, status: StaffStatus) => void;
  onAddStaff: () => void;
  onDeleteStaff: (staffId: string) => void;
  onGenerateAccessKey: (staffId: string, description?: string) => void;
  onRevokeAccessKey: (staffId: string, keyId: string) => void;
  currentUser: StaffMember;
}

const StaffManagement: React.FC<StaffManagementProps> = ({
  staff,
  tasks,
  onUpdateStaffStatus,
  onAddStaff,
  onDeleteStaff,
  onGenerateAccessKey,
  onRevokeAccessKey,
  currentUser
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'workload'>('name');
  const [showAccessKeys, setShowAccessKeys] = useState<{[staffId: string]: boolean}>({});

  const departments = useMemo(() => {
    const depts = new Set(staff.map(s => s.department));
    return ['All', ...Array.from(depts)];
  }, [staff]);

  const statuses = ['All', ...Object.values(StaffStatus)];

  const getActiveTaskCount = (staffId: string) => {
    return tasks.filter(t => t.assignedStaffId === staffId && t.status !== TaskStatus.COMPLETED).length;
  };

  const filteredStaff = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    let result = staff.filter(member => {
      const matchesSearch =
        member.name.toLowerCase().includes(query) ||
        member.role.toLowerCase().includes(query) ||
        member.department.toLowerCase().includes(query);

      const matchesDept = deptFilter === 'All' || member.department === deptFilter;
      const matchesStatus = statusFilter === 'All' || member.status === statusFilter;

      return matchesSearch && matchesDept && matchesStatus;
    });

    // Apply Sorting
    if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'workload') {
      result.sort((a, b) => getActiveTaskCount(b.id) - getActiveTaskCount(a.id));
    }

    return result;
  }, [staff, searchQuery, deptFilter, statusFilter, sortBy, tasks]);

  const getStatusColor = (status: StaffStatus) => {
    switch (status) {
      case StaffStatus.AVAILABLE: return 'bg-emerald-500';
      case StaffStatus.BUSY: return 'bg-rose-500';
      case StaffStatus.OFFLINE: return 'bg-slate-400';
      case StaffStatus.ON_BREAK: return 'bg-amber-500';
      default: return 'bg-slate-400';
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setDeptFilter('All');
    setStatusFilter('All');
    setSortBy('name');
  };

  return (
    <div className="space-y-6">
      {/* Top Action & Search Bar */}
      <div className="flex flex-col xl:flex-row items-center justify-between gap-4 bg-white/5 p-4 rounded-[32px] border border-white/5">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, role or unit..."
            className="w-full pl-12 pr-12 py-3.5 bg-slate-900 border border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white text-sm font-medium shadow-inner transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1 rounded-full hover:bg-slate-800"
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Department Filter */}
          <div className="relative flex-1 sm:flex-none">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <select
              className="w-full sm:w-44 pl-10 pr-8 py-3.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-2xl font-bold text-[10px] uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              title="Filter by department"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept === 'All' ? 'All Units' : dept}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative flex-1 sm:flex-none">
            <Activity className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <select
              className="w-full sm:w-44 pl-10 pr-8 py-3.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-2xl font-bold text-[10px] uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              title="Filter by status"
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status === 'All' ? 'Any Status' : status.replace('-', ' ')}</option>
              ))}
            </select>
          </div>

          {/* Sort Control */}
          <div className="relative flex-1 sm:flex-none">
            <SortAsc className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <select
              className="w-full sm:w-44 pl-10 pr-8 py-3.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-2xl font-bold text-[10px] uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              title="Sort staff"
            >
              <option value="name">Sort by Name</option>
              <option value="workload">Highest Workload</option>
            </select>
          </div>

          <button
            onClick={onAddStaff}
            className="flex-1 sm:flex-none px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-900/40 transition-all active:scale-95"
          >
            <Plus size={18} />
            Add Staff
          </button>
        </div>
      </div>

      {/* Result Meta */}
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Staff Registry</span>
           <span className="bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full text-[10px] font-black">
             {filteredStaff.length} of {staff.length}
           </span>
        </div>
        {(searchQuery || deptFilter !== 'All' || statusFilter !== 'All') && (
          <button
            onClick={resetFilters}
            className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw size={12} /> Reset Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Add Staff Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-[40px] border-2 border-dashed border-indigo-200 p-6 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all group animate-in fade-in zoom-in-95 duration-300 cursor-pointer" onClick={() => {
          console.log('Add Staff card clicked');
          onAddStaff();
        }}>
          <div className="flex flex-col items-center justify-center h-full min-h-[280px] text-center">
            <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center mb-4 group-hover:bg-indigo-700 transition-colors">
              <Plus size={32} className="text-white" />
            </div>
            <h3 className="text-lg font-black text-indigo-900 mb-2">Add New Staff</h3>
            <p className="text-sm text-indigo-700 font-medium leading-relaxed">
              Onboard a new team member with access keys and permissions
            </p>
            <div className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest group-hover:bg-indigo-700 transition-colors">
              Quick Add
            </div>
          </div>
        </div>

        {filteredStaff.map((member) => {
          const activeTasks = getActiveTaskCount(member.id);
          return (
            <div key={member.id} className="bg-white rounded-[40px] border border-slate-200 p-6 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all group animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-16 h-16 rounded-3xl object-cover border-4 border-slate-50 shadow-sm"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white shadow-sm ${getStatusColor(member.status)}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 leading-tight line-clamp-1">{member.name}</h3>
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-0.5">{member.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {currentUser.permissionRole === UserRole.ADMIN && member.id !== currentUser.id && (
                    <button
                      onClick={() => onDeleteStaff(member.id)}
                      className="p-2 text-slate-300 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                      title="Delete Staff"
                    >
                      <UserMinus size={20} />
                    </button>
                  )}
                  <button className="p-2 text-slate-300 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors" title="More Options">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5">
                    <Briefcase size={10} /> Unit
                  </p>
                  <p className="text-[11px] font-bold text-slate-700 truncate">{member.department}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5">
                    <LayoutGrid size={10} /> Workload
                  </p>
                  <p className={`text-[11px] font-black ${activeTasks > 2 ? 'text-rose-500' : 'text-emerald-600'}`}>
                    {activeTasks} Active
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="text-slate-400 font-bold flex items-center gap-1.5"><Mail size={12} /> Email</span>
                  <span className="text-slate-700 font-medium truncate max-w-[120px]">{member.email}</span>
                </div>
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="text-slate-400 font-bold flex items-center gap-1.5"><Phone size={12} /> Contact</span>
                  <span className="text-slate-700 font-medium">{member.phone}</span>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-50">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2 px-1">Shift Control</label>
                  <select
                    value={member.status}
                    onChange={(e) => onUpdateStaffStatus(member.id, e.target.value as StaffStatus)}
                    className="w-full text-xs font-black p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all cursor-pointer hover:bg-white text-slate-600"
                    title="Update staff status"
                  >
                    <option value={StaffStatus.AVAILABLE}>Set Available</option>
                    <option value={StaffStatus.BUSY}>Set Busy</option>
                    <option value={StaffStatus.ON_BREAK}>Set On Break</option>
                    <option value={StaffStatus.OFFLINE}>Set Offline</option>
                  </select>
                </div>

                {/* Access Keys Section */}
                {currentUser.permissionRole === UserRole.ADMIN && (
                  <div className="pt-4 mt-4 border-t border-slate-50">
                    <div className="flex items-center justify-between mb-2 px-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Access Keys</label>
                      <button
                        onClick={() => setShowAccessKeys(prev => ({ ...prev, [member.id]: !prev[member.id] }))}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                        title={showAccessKeys[member.id] ? "Hide access keys" : "Show access keys"}
                      >
                        {showAccessKeys[member.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                    </div>
                    {showAccessKeys[member.id] && (
                      <div className="space-y-2">
                        {member.accessKeys && member.accessKeys.length > 0 ? (
                          member.accessKeys.map((key) => (
                            <div key={key.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <KeyRound size={10} className="text-slate-400" />
                                  <span className="text-[10px] font-mono text-slate-600 truncate">{key.key}</span>
                                </div>
                                {key.description && (
                                  <p className="text-[8px] text-slate-500 mt-0.5 truncate">{key.description}</p>
                                )}
                                <p className="text-[8px] text-slate-400 mt-0.5">
                                  Created: {new Date(key.createdAt).toLocaleDateString()}
                                  {key.lastUsed && ` • Last used: ${new Date(key.lastUsed).toLocaleDateString()}`}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 ml-2">
                                <button
                                  onClick={() => navigator.clipboard.writeText(key.key)}
                                  className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                                  title="Copy key"
                                >
                                  <Copy size={10} />
                                </button>
                                {key.active ? (
                                  <button
                                    onClick={() => onRevokeAccessKey(member.id, key.id)}
                                    className="p-1 text-rose-400 hover:text-rose-600 transition-colors"
                                    title="Revoke key"
                                  >
                                    <Ban size={10} />
                                  </button>
                                ) : (
                                  <span className="text-[8px] text-rose-500 font-medium">Revoked</span>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-[10px] text-slate-400 text-center py-2">No access keys</p>
                        )}
                        <button
                          onClick={() => onGenerateAccessKey(member.id, `Generated on ${new Date().toLocaleDateString()}`)}
                          className="w-full text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest flex items-center justify-center gap-1 py-2 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                        >
                          <Key size={12} />
                          Generate New Key
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StaffManagement;
