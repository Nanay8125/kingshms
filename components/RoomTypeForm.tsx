
import React, { useState } from 'react';
import { X, Layout, CreditCard, Users, ListPlus, CheckCircle2 } from 'lucide-react';
import { RoomCategory } from '../types';

interface RoomTypeFormProps {
  onClose: () => void;
  onSubmit: (category: RoomCategory) => void;
}

const RoomTypeForm: React.FC<RoomTypeFormProps> = ({ onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [basePrice, setBasePrice] = useState<number>(0);
  const [capacity, setCapacity] = useState<number>(1);
  const [amenityInput, setAmenityInput] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);

  const handleAddAmenity = () => {
    if (amenityInput.trim()) {
      setAmenities([...amenities, amenityInput.trim()]);
      setAmenityInput('');
    }
  };

  const removeAmenity = (index: number) => {
    setAmenities(amenities.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: `cat-${Math.random().toString(36).substr(2, 9)}`,
      companyId: 'luxestay',
      name,
      basePrice,
      capacity,
      amenities
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-emerald-600 px-6 py-4 flex items-center justify-between text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Layout size={20} />
            Define New Room Type
          </h2>
          <button onClick={onClose} aria-label="Close" className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1">
            <label htmlFor="typeName" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Type Name</label>
            <input
              id="typeName"
              required
              type="text"
              placeholder="e.g. Deluxe Garden View"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:outline-none text-sm"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="basePrice" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <CreditCard size={14} /> Base Price
              </label>
              <input
                id="basePrice"
                required
                type="number"
                min="0"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:outline-none text-sm"
                value={basePrice}
                onChange={e => setBasePrice(parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="capacity" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Users size={14} /> Max Capacity
              </label>
              <input
                id="capacity"
                required
                type="number"
                min="1"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:outline-none text-sm"
                value={capacity}
                onChange={e => setCapacity(parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <ListPlus size={14} /> Amenities
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add amenity..."
                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:outline-none text-sm"
                value={amenityInput}
                onChange={e => setAmenityInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())}
              />
              <button
                type="button"
                onClick={handleAddAmenity}
                className="px-4 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors text-sm font-bold"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {amenities.map((item, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold">
                  {item}
                  <button type="button" onClick={() => removeAmenity(idx)} aria-label={`Remove ${item}`} className="hover:text-emerald-900">
                    <X size={12} />
                  </button>
                </span>
              ))}
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
              className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-900/20 text-sm flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={18} />
              Save Type
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomTypeForm;
