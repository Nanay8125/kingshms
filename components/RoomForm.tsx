import React, { useState } from 'react';
import { RoomCategory } from '../types';
import { X, Plus } from 'lucide-react';
import { sanitizeString, validateNumber } from '../services/security';

interface RoomFormProps {
  categories: RoomCategory[];
  onClose: () => void;
  onSubmit: (room: Omit<Room, 'id'>) => void;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20"
            >
              Add Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomForm;
