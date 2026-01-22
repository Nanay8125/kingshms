
import React, { useState, useMemo } from 'react';
import { X, ClipboardList, AlertCircle, User, LayoutGrid, CheckCircle2, Circle, Copy } from 'lucide-react';
import { Task, TaskStatus, TaskPriority, TaskType, Room, StaffMember, StaffStatus, TaskTemplate } from '../types';

interface TaskFormProps {
  rooms: Room[];
  staff: StaffMember[];
  tasks: Task[];
  templates: TaskTemplate[];
  initialTemplate?: TaskTemplate;
  onClose: () => void;
  onSubmit: (task: Task) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ rooms, staff, tasks, templates, initialTemplate, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: initialTemplate?.title || '',
    description: initialTemplate?.description || '',
    type: initialTemplate?.type || TaskType.CLEANING,
    priority: initialTemplate?.priority || TaskPriority.MEDIUM,
    roomId: '',
    assignedStaffId: ''
  });

  const getStatusIcon = (status: StaffStatus) => {
    switch (status) {
      case StaffStatus.AVAILABLE: return '🟢';
      case StaffStatus.ON_BREAK: return '🟡';
      case StaffStatus.BUSY: return '🔴';
      case StaffStatus.OFFLINE: return '⚪';
      default: return '❓';
    }
  };

  const getActiveTaskCount = (staffId: string) => {
    return tasks.filter(t => t.assignedStaffId === staffId && t.status !== TaskStatus.COMPLETED).length;
  };

  const sortedStaff = useMemo(() => {
    const priority = {
      [StaffStatus.AVAILABLE]: 1,
      [StaffStatus.ON_BREAK]: 2,
      [StaffStatus.BUSY]: 3,
      [StaffStatus.OFFLINE]: 4,
    };
    return [...staff].sort((a, b) => (priority[a.status] || 5) - (priority[b.status] || 5));
  }, [staff]);

  const handleApplyTemplate = (tplId: string) => {
    const tpl = templates.find(t => t.id === tplId);
    if (tpl) {
      setFormData(prev => ({
        ...prev,
        title: tpl.title,
        description: tpl.description,
        type: tpl.type,
        priority: tpl.priority
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTask: Task = {
      id: `task-${Math.random().toString(36).substr(2, 9)}`,
      status: TaskStatus.PENDING,
      createdAt: new Date().toISOString(),
      ...formData
    };
    onSubmit(newTask);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ClipboardList size={20} />
            Assign New Task
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Copy size={14} /> Quick Template
            </label>
            <select
              className="w-full px-4 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-sm font-bold text-indigo-700 appearance-none cursor-pointer"
              onChange={e => handleApplyTemplate(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>Apply a task template...</option>
              {templates.map(tpl => (
                <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Task Title</label>
            <input
              required
              type="text"
              placeholder="e.g. Broken window repair"
              className="w-full px-4 py-2.5 bg-indigo-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-sm font-medium"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
            <textarea
              required
              rows={3}
              placeholder="Provide detailed instructions..."
              className="w-full px-4 py-2.5 bg-indigo-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-sm font-medium resize-none"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Type</label>
              <select
                className="w-full px-4 py-2.5 bg-indigo-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-sm font-medium appearance-none"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as TaskType })}
              >
                {Object.values(TaskType).map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</label>
              <select
                className="w-full px-4 py-2.5 bg-indigo-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-sm font-medium appearance-none"
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
              >
                {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <LayoutGrid size={14} /> Room Link
              </label>
              <select
                className="w-full px-4 py-2.5 bg-indigo-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-sm font-medium appearance-none"
                value={formData.roomId}
                onChange={e => setFormData({ ...formData, roomId: e.target.value })}
              >
                <option value="">General (No Room)</option>
                {rooms.map(room => <option key={room.id} value={room.id}>Room {room.number}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <User size={14} /> Assign Member
              </label>
              <select
                required
                className="w-full px-4 py-2.5 bg-indigo-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-sm font-medium appearance-none"
                value={formData.assignedStaffId}
                onChange={e => setFormData({ ...formData, assignedStaffId: e.target.value })}
              >
                <option value="">Select Staff...</option>
                {sortedStaff.map(member => (
                  <option key={member.id} value={member.id}>
                    {getStatusIcon(member.status)} {member.name} — {member.status.replace('-', ' ').toUpperCase()} ({getActiveTaskCount(member.id)} tasks)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-900/20 text-sm flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={18} />
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
