
import React, { useState } from 'react';
import { X, Copy, Tag, AlignLeft, BarChart2, CheckCircle2 } from 'lucide-react';
import { TaskTemplate, TaskPriority, TaskType } from '../types';

interface TaskTemplateFormProps {
  onClose: () => void;
  onSubmit: (template: TaskTemplate) => void;
  initialData?: TaskTemplate;
}

const TaskTemplateForm: React.FC<TaskTemplateFormProps> = ({ onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<Omit<TaskTemplate, 'id'>>({
    name: initialData?.name || '',
    title: initialData?.title || '',
    description: initialData?.description || '',
    type: initialData?.type || TaskType.CLEANING,
    priority: initialData?.priority || TaskPriority.MEDIUM,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: initialData?.id || `tpl-${Math.random().toString(36).substr(2, 9)}`,
      ...formData
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Copy size={20} />
            {initialData ? 'Edit Template' : 'Create Task Template'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Tag size={14} /> Template Name
            </label>
            <input
              required
              type="text"
              placeholder="e.g. Standard Room Reset"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-sm font-medium"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
            <p className="text-[10px] text-slate-400 font-medium italic">This is for internal organization only.</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Default Task Title</label>
            <input
              required
              type="text"
              placeholder="e.g. Deep Clean Room"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-sm font-medium"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <AlignLeft size={14} /> Default Description
            </label>
            <textarea
              required
              rows={4}
              placeholder="Detailed instructions for the staff..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-sm font-medium resize-none"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Type</label>
              <select
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-sm font-medium"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as TaskType })}
              >
                {Object.values(TaskType).map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <BarChart2 size={14} /> Default Priority
              </label>
              <select
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-sm font-medium"
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
              >
                {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
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
              {initialData ? 'Update Template' : 'Save Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskTemplateForm;
