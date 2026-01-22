
import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  MoreVertical,
  Plus,
  Search,
  Filter,
  Hammer,
  Sparkles,
  ConciergeBell,
  Monitor,
  ChevronDown,
  ArrowUpCircle,
  AlertCircle,
  Copy,
  Layers,
  Trash2,
  Edit2,
  GripVertical,
  Circle
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority, TaskType, Room, StaffMember, TaskTemplate, StaffStatus } from '../types';
import { sanitizeSearchQuery } from '../services/security';

interface TaskBoardProps {
  tasks: Task[];
  rooms: Room[];
  staff: StaffMember[];
  templates: TaskTemplate[];
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
  onUpdatePriority: (taskId: string, priority: TaskPriority) => void;
  onUpdateAssignedStaff: (taskId: string, staffId: string) => void;
  onReorderTask: (taskId: string, newStatus: TaskStatus, targetTaskId?: string) => void;
  onAddTask: () => void;
  onAddTemplate: () => void;
  onDeleteTemplate: (id: string) => void;
  onEditTemplate: (template: TaskTemplate) => void;
  onUseTemplate: (template: TaskTemplate) => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  rooms,
  staff,
  templates,
  onUpdateStatus,
  onUpdatePriority,
  onUpdateAssignedStaff,
  onReorderTask,
  onAddTask,
  onAddTemplate,
  onDeleteTemplate,
  onEditTemplate,
  onUseTemplate
}) => {
  const [view, setView] = useState<'board' | 'templates'>('board');
  const [staffFilter, setStaffFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // DnD State
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH: return 'text-rose-600 bg-rose-50 border-rose-200';
      case TaskPriority.MEDIUM: return 'text-amber-600 bg-amber-50 border-amber-200';
      case TaskPriority.LOW: return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    }
  };

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

  const getTypeIcon = (type: TaskType) => {
    switch (type) {
      case TaskType.CLEANING: return <Sparkles size={16} className="text-blue-500" />;
      case TaskType.MAINTENANCE: return <Hammer size={16} className="text-orange-500" />;
      case TaskType.SERVICE: return <ConciergeBell size={16} className="text-indigo-500" />;
      case TaskType.FRONT_DESK: return <Monitor size={16} className="text-slate-500" />;
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Sanitize search query to prevent injection
      const sanitizedQuery = sanitizeSearchQuery(searchQuery);
      const matchesStaff = staffFilter === 'all' || task.assignedStaffId === staffFilter;
      const matchesSearch = task.title.toLowerCase().includes(sanitizedQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(sanitizedQuery.toLowerCase());
      return matchesStaff && matchesSearch;
    });
    // No explicit sort here to preserve the manual order from the App state array
  }, [tasks, staffFilter, searchQuery]);

  const filteredTemplates = useMemo(() => {
    // Sanitize search query to prevent injection
    const sanitizedQuery = sanitizeSearchQuery(searchQuery);
    return templates.filter(tpl =>
      tpl.name.toLowerCase().includes(sanitizedQuery.toLowerCase()) ||
      tpl.title.toLowerCase().includes(sanitizedQuery.toLowerCase())
    );
  }, [templates, searchQuery]);

  const columns = [
    { id: TaskStatus.PENDING, title: 'Pending', icon: Clock, color: 'text-slate-500 bg-slate-100' },
    { id: TaskStatus.IN_PROGRESS, title: 'In Progress', icon: AlertTriangle, color: 'text-amber-500 bg-amber-100' },
    { id: TaskStatus.COMPLETED, title: 'Completed', icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-100' },
  ];

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';

    // Create a slight ghosting effect immediately
    const target = e.currentTarget as HTMLElement;
    setTimeout(() => {
      target.classList.add('opacity-40');
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedTaskId(null);
    setDragOverStatus(null);
    setDragOverTaskId(null);
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('opacity-40');
  };

  const handleDragOverColumn = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setDragOverStatus(status);
  };

  const handleDragOverCard = (e: React.DragEvent, taskId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (taskId !== draggedTaskId) {
      setDragOverTaskId(taskId);
    }
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus, targetTaskId?: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      onReorderTask(taskId, status, targetTaskId);
    }
    setDragOverStatus(null);
    setDragOverTaskId(null);
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm w-full md:w-auto">
          <button
            onClick={() => setView('board')}
            className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${view === 'board' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/10' : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            <Layers size={18} />
            Task Board
          </button>
          <button
            onClick={() => setView('templates')}
            className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${view === 'templates' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/10' : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            <Copy size={18} />
            Templates
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder={view === 'board' ? "Search tasks..." : "Search templates..."}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {view === 'board' ? (
            <>
              <div className="relative hidden md:block">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select
                  className="pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none appearance-none cursor-pointer"
                  value={staffFilter}
                  onChange={(e) => setStaffFilter(e.target.value)}
                >
                  <option value="all">All Staff</option>
                  {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <button
                onClick={onAddTask}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-900/10"
              >
                <Plus size={18} />
                New Task
              </button>
            </>
          ) : (
            <button
              onClick={onAddTemplate}
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-900/10"
            >
              <Plus size={18} />
              New Template
            </button>
          )}
        </div>
      </div>

      {view === 'board' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {columns.map(column => (
            <div
              key={column.id}
              className={`flex flex-col h-full min-h-[600px] rounded-3xl transition-colors duration-300 ${dragOverStatus === column.id ? 'bg-indigo-50/50 ring-2 ring-indigo-200 ring-inset' : 'bg-transparent'}`}
              onDragOver={(e) => handleDragOverColumn(e, column.id)}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${column.color}`}>
                    <column.icon size={16} />
                  </div>
                  <h3 className="font-black text-slate-700 uppercase tracking-widest text-[10px]">{column.title}</h3>
                  <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-black">
                    {filteredTasks.filter(t => t.status === column.id).length}
                  </span>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                {filteredTasks.filter(t => t.status === column.id).map(task => {
                  const room = rooms.find(r => r.id === task.roomId);
                  const assignedStaff = staff.find(s => s.id === task.assignedStaffId);
                  const isBeingDragged = draggedTaskId === task.id;
                  const isDragTarget = dragOverTaskId === task.id;

                  return (
                    <div
                      key={task.id}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOverCard(e, task.id)}
                      onDrop={(e) => handleDrop(e, column.id, task.id)}
                      className={`bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group border-l-4 relative overflow-hidden cursor-grab active:cursor-grabbing ${isDragTarget ? 'ring-2 ring-indigo-500 translate-y-1' : ''} ${isBeingDragged ? 'shadow-none' : ''}`}
                      style={{ borderLeftColor: task.priority === TaskPriority.HIGH ? '#ef4444' : task.priority === TaskPriority.MEDIUM ? '#f59e0b' : '#10b981' }}
                    >
                      {/* Drag Handle Overlay for touch and better UX */}
                      <div className="absolute left-0 top-0 bottom-0 w-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50/50">
                        <GripVertical size={12} className="text-slate-300" />
                      </div>

                      {task.priority === TaskPriority.HIGH && (
                        <div className="absolute top-0 right-0 pointer-events-none">
                          <div className="bg-rose-500 text-white text-[8px] font-black py-0.5 px-3 rotate-45 translate-x-3 translate-y-2 uppercase shadow-sm">
                            Urgent
                          </div>
                        </div>
                      )}

                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(task.type)}
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{task.type}</span>
                        </div>

                        <select
                          value={task.priority}
                          onChange={(e) => onUpdatePriority(task.id, e.target.value as TaskPriority)}
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border cursor-pointer focus:outline-none appearance-none transition-colors ${getPriorityColor(task.priority)}`}
                        >
                          <option value={TaskPriority.LOW}>Low</option>
                          <option value={TaskPriority.MEDIUM}>Medium</option>
                          <option value={TaskPriority.HIGH}>High</option>
                        </select>
                      </div>

                      <h4 className="font-bold text-slate-800 text-sm mb-2 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                        <Circle
                          size={10}
                          fill={task.priority === TaskPriority.HIGH ? '#ef4444' : task.priority === TaskPriority.MEDIUM ? '#f59e0b' : '#10b981'}
                          className={task.priority === TaskPriority.HIGH ? 'text-rose-500 animate-pulse' : task.priority === TaskPriority.MEDIUM ? 'text-amber-500' : 'text-emerald-500'}
                        />
                        {task.title}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">{task.description}</p>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-2">
                          {room ? (
                            <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded uppercase">Room {room.number}</span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-300 italic">General</span>
                          )}
                          <div className="flex items-center gap-1.5 ml-1">
                            {assignedStaff && (
                              <img src={assignedStaff.avatar} className="w-5 h-5 rounded-full border border-slate-200 shrink-0" alt={assignedStaff.name} />
                            )}
                            <div className="relative group/staff">
                              <select
                                value={task.assignedStaffId || ''}
                                onChange={(e) => onUpdateAssignedStaff(task.id, e.target.value)}
                                className="text-[10px] font-bold text-slate-500 hover:text-indigo-600 bg-transparent focus:outline-none cursor-pointer border-none p-0 max-w-[100px] appearance-none"
                              >
                                <option value="">Unassigned</option>
                                {sortedStaff.map(s => (
                                  <option key={s.id} value={s.id}>
                                    {getStatusIcon(s.status)} {s.name.split(' ')[0]} — {s.status.replace('-', ' ').toUpperCase()}
                                  </option>
                                ))}
                              </select>
                              <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 opacity-0 group-hover/staff:opacity-100 transition-opacity pointer-events-none">
                                <ChevronDown size={8} />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {task.status !== TaskStatus.COMPLETED && (
                            <button
                              onClick={() => onUpdateStatus(task.id, task.status === TaskStatus.PENDING ? TaskStatus.IN_PROGRESS : TaskStatus.COMPLETED)}
                              className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1"
                            >
                              <span className="text-[10px] font-black uppercase">Next</span>
                              <ArrowUpCircle size={14} className="rotate-90" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(tpl => (
            <div key={tpl.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm group hover:border-indigo-200 transition-all flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getTypeIcon(tpl.type)}
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tpl.type}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditTemplate(tpl)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => onDeleteTemplate(tpl.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="text-base font-black text-slate-800 mb-1">{tpl.name}</h3>
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-4">Action: {tpl.title}</p>

              <p className="text-xs text-slate-500 leading-relaxed mb-6 line-clamp-3 italic">"{tpl.description}"</p>

              <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${getPriorityColor(tpl.priority)}`}>
                  {tpl.priority}
                </span>
                <button
                  onClick={() => onUseTemplate(tpl)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black hover:bg-indigo-600 hover:text-white transition-all"
                >
                  <Plus size={14} />
                  Use Template
                </button>
              </div>
            </div>
          ))}

          {filteredTemplates.length === 0 && (
            <div className="col-span-full py-20 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 text-center">
              <Copy size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-500 font-bold">No templates found.</p>
              <button
                onClick={onAddTemplate}
                className="mt-4 text-xs font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800"
              >
                Create your first template
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskBoard;
