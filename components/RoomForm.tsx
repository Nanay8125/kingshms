import React, { useState } from 'react';
<<<<<<< HEAD
import { X, Plus, BedDouble } from 'lucide-react';
import { Room, RoomStatus, RoomCategory } from '../types';
=======
import { RoomCategory } from '../types';
import { X, Plus } from 'lucide-react';
import { sanitizeString, validateNumber } from '../services/security';
>>>>>>> gh-pages-local

interface RoomFormProps {
  categories: RoomCategory[];
  onClose: () => void;
  onSubmit: (room: Omit<Room, 'id'>) => void;
<<<<<<< HEAD
  existingRoom?: Room;
}

const RoomForm: React.FC<RoomFormProps> = ({ categories, onClose, onSubmit, existingRoom }) => {
  const [formData, setFormData] = useState({
    number: existingRoom?.number || '',
    categoryId: existingRoom?.categoryId || '',
    status: existingRoom?.status || RoomStatus.AVAILABLE,
    floor: existingRoom?.floor || 1,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
=======
}

interface Room {
  number: string;
  floor: number;
  categoryId: string;
  status: string;
}

const RoomForm: React.FC<RoomFormProps> = ({ categories, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    number: '',
    floor: '',
    categoryId: '',
    status: 'available'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
>>>>>>> gh-pages-local

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

<<<<<<< HEAD
    const newErrors: { [key: string]: string } = {};

    if (!formData.number.trim()) {
      newErrors.number = 'Room number is required';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Room category is required';
    }

    if (formData.floor < 1) {
      newErrors.floor = 'Floor must be at least 1';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit({
        number: formData.number.trim(),
        categoryId: formData.categoryId,
        status: formData.status,
        floor: formData.floor,
        maintenanceHistory: existingRoom?.maintenanceHistory || []
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-indigo-600 px-8 py-6 flex items-center justify-between text-white">
          <h2 className="text-xl font-black flex items-center gap-3">
            <BedDouble size={24} />
            {existingRoom ? 'Edit Room' : 'Add New Room'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors" aria-label="Close room form">
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Room Number</label>
            <input
              type="text"
              required
              className={`w-full px-4 py-3.5 bg-slate-50 border rounded-2xl focus:ring-2 focus:outline-none text-sm font-bold text-slate-900 transition-all ${
                errors.number ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-indigo-500/20'
              }`}
              placeholder="e.g., 101, 205, etc."
              value={formData.number}
              onChange={e => setFormData({ ...formData, number: e.target.value })}
              aria-label="Room number"
            />
            {errors.number && (
              <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest mt-1 ml-1">{errors.number}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Room Category</label>
            <select
              required
              className={`w-full px-4 py-3.5 bg-slate-50 border rounded-2xl focus:ring-2 focus:outline-none text-sm font-bold text-slate-900 transition-all appearance-none cursor-pointer ${
                errors.categoryId ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-indigo-500/20'
              }`}
              value={formData.categoryId}
              onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
              aria-label="Room category"
            >
              <option value="" className="text-slate-400">Select a category...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id} className="text-slate-900">
                  {cat.name} - ${cat.basePrice}/night ({cat.capacity} guests)
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest mt-1 ml-1">{errors.categoryId}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Floor</label>
              <input
                type="number"
                min="1"
                required
                className={`w-full px-4 py-3.5 bg-slate-50 border rounded-2xl focus:ring-2 focus:outline-none text-sm font-bold text-slate-900 transition-all ${
                  errors.floor ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-indigo-500/20'
                }`}
                value={formData.floor}
                onChange={e => setFormData({ ...formData, floor: parseInt(e.target.value) || 1 })}
                aria-label="Floor number"
              />
              {errors.floor && (
                <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest mt-1 ml-1">{errors.floor}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial Status</label>
              <select
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-sm font-bold text-slate-900 transition-all appearance-none cursor-pointer"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as RoomStatus })}
                aria-label="Room status"
              >
                <option value={RoomStatus.AVAILABLE}>Available</option>
                <option value={RoomStatus.OCCUPIED}>Occupied</option>
                <option value={RoomStatus.CLEANING}>Cleaning</option>
                <option value={RoomStatus.MAINTENANCE}>Maintenance</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 rounded-2xl transition-all"
=======
    const newErrors: Record<string, string> = {};

    // Validate room number
    if (!sanitizeString(formData.number).trim()) {
      newErrors.number = 'Room number is required';
    }

    // Validate floor
    if (!validateNumber(formData.floor)) {
      newErrors.floor = 'Valid floor number is required';
    }

    // Validate category
    if (!formData.categoryId) {
      newErrors.categoryId = 'Please select a room category';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const roomData = {
      number: sanitizeString(formData.number).trim(),
      floor: parseInt(formData.floor),
      categoryId: formData.categoryId,
      status: formData.status as any,
      companyId: 'company-1', // TODO: Get from current user/company context
      maintenanceHistory: []
    };

    onSubmit(roomData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-slate-900">Add New Room</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Close form"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Room Number
            </label>
            <input
              type="text"
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              placeholder="e.g. 101"
            />
            {errors.number && <p className="text-rose-500 text-xs mt-1">{errors.number}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Floor
            </label>
            <input
              type="number"
              value={formData.floor}
              onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              placeholder="e.g. 1"
              min="1"
            />
            {errors.floor && <p className="text-rose-500 text-xs mt-1">{errors.floor}</p>}
          </div>

          <div>
            <label htmlFor="room-category" className="block text-sm font-bold text-slate-700 mb-2">
              Room Category
            </label>
            <select
              id="room-category"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} - ${category.basePrice}/night
                </option>
              ))}
            </select>
            {errors.categoryId && <p className="text-rose-500 text-xs mt-1">{errors.categoryId}</p>}
          </div>

          <div>
            <label htmlFor="room-status" className="block text-sm font-bold text-slate-700 mb-2">
              Initial Status
            </label>
            <select
              id="room-status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
            >
              <option value="available">Available</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all"
>>>>>>> gh-pages-local
            >
              Cancel
            </button>
            <button
              type="submit"
<<<<<<< HEAD
              className="flex-[2] px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-900/20"
            >
              <Plus size={20} />
              {existingRoom ? 'Update Room' : 'Add Room'}
=======
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20"
            >
              Add Room
>>>>>>> gh-pages-local
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomForm;
