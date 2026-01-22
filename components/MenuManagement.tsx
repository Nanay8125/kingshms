import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  Search,
  Filter,
  CheckCircle2,
  X,
  Image as ImageIcon,
  DollarSign,
  FileText,
  Eye,
  EyeOff
} from 'lucide-react';
import { MenuItem } from '../types';
import { dbService } from '../services/dbService';
import { sanitizeSearchQuery, validateNumber, sanitizeUrl } from '../services/security';

interface MenuManagementProps {
  menu: MenuItem[];
  onUpdateMenu: (menu: MenuItem[]) => void;
}

const MenuManagement: React.FC<MenuManagementProps> = ({ menu, onUpdateMenu }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'Breakfast' as MenuItem['category'],
    image: '',
    available: true
  });

  const categories: MenuItem['category'][] = ['Breakfast', 'Main Course', 'Drinks', 'Desserts', 'Snacks'];

  const filteredMenu = menu.filter(item => {
    // Sanitize search query to prevent injection
    const sanitizedQuery = sanitizeSearchQuery(searchQuery);
    const matchesSearch = item.name.toLowerCase().includes(sanitizedQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(sanitizedQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: 'Breakfast',
      image: '',
      available: true
    });
    setEditingItem(null);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image,
      available: item.available
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate price
    let validatedPrice: number;
    try {
      validatedPrice = validateNumber(formData.price, { min: 0, max: 10000 });
    } catch (error) {
      alert('Invalid price. Please enter a valid price between $0 and $10,000.');
      return;
    }

    // Validate and sanitize image URL
    const sanitizedImageUrl = sanitizeUrl(formData.image);
    if (formData.image && !sanitizedImageUrl) {
      alert('Invalid image URL. Please use a valid HTTP/HTTPS URL.');
      return;
    }

    try {
      if (editingItem) {
        // Update existing item
        const updates = {
          name: formData.name,
          description: formData.description,
          price: validatedPrice,
          category: formData.category,
          image: sanitizedImageUrl || 'https://picsum.photos/seed/default-menu/400/300',
          available: formData.available,
          companyId: 'luxestay'
        };

        const updatedItem = await dbService.update<MenuItem>('menu', editingItem.id, updates);

        if (updatedItem) {
          const updatedMenu = menu.map(item => item.id === editingItem.id ? updatedItem : item);
          onUpdateMenu(updatedMenu);
        }
      } else {
        // Create new item
        const newItemPayload = {
          name: formData.name,
          description: formData.description,
          price: validatedPrice,
          category: formData.category,
          image: sanitizedImageUrl || 'https://picsum.photos/seed/default-menu/400/300',
          available: formData.available,
          companyId: 'luxestay'
        };

        const createdItem = await dbService.create<MenuItem>('menu', newItemPayload);
        onUpdateMenu([createdItem, ...menu]);
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save menu item:', error);
      alert('Failed to save menu item. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        const success = await dbService.delete('menu', id);
        if (success) {
          const updatedMenu = menu.filter(item => item.id !== id);
          onUpdateMenu(updatedMenu);
        } else {
          alert('Failed to delete item.');
        }
      } catch (error) {
        console.error('Delete failed:', error);
        alert('An error occurred while deleting.');
      }
    }
  };

  const handleToggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      const updatedItem = await dbService.update<MenuItem>('menu', id, { available: !currentStatus });
      if (updatedItem) {
        const updatedMenu = menu.map(item =>
          item.id === id ? updatedItem : item
        );
        onUpdateMenu(updatedMenu);
      }
    } catch (error) {
      console.error('Failed to toggle availability:', error);
      alert('Failed to update availability.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Menu Management</h2>
          <p className="text-slate-500 font-medium">Upload and manage dining menu items for guest orders.</p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 text-sm shadow-lg shadow-indigo-900/20"
        >
          <Plus size={18} />
          Add Menu Item
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
          />
        </div>

        <div className="flex items-center gap-3">
          <Filter size={18} className="text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
            aria-label="Filter menu items by category"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMenu.map(item => (
          <div key={item.id} className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm group hover:shadow-2xl transition-all">
            <div className="relative h-48">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              {!item.available && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">Unavailable</span>
                </div>
              )}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => handleToggleAvailability(item.id, item.available)}
                  className={`p-2 rounded-xl transition-all ${item.available
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                    : 'bg-slate-500 text-white hover:bg-slate-600'
                    }`}
                  title={item.available ? 'Mark as unavailable' : 'Mark as available'}
                  aria-label={item.available ? 'Mark as unavailable' : 'Mark as available'}
                >
                  {item.available ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button
                  onClick={() => openEditModal(item)}
                  className="p-2 bg-white/90 backdrop-blur-md text-slate-700 rounded-xl hover:bg-white transition-all"
                  aria-label="Edit menu item"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all"
                  aria-label="Delete menu item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {item.category}
                </span>
                <span className="text-xl font-black text-indigo-600">${item.price}</span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2">{item.name}</h3>
              <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">{item.description}</p>

              <div className="mt-4 flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${item.available
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-red-100 text-red-700'
                  }`}>
                  {item.available ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMenu.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-slate-100 text-slate-400 rounded-[32px] flex items-center justify-center mx-auto mb-6">
            <FileText size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No menu items found</h3>
          <p className="text-slate-500 font-medium">Try adjusting your search or category filter.</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-900">
                  {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Item Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                    placeholder="e.g., Classic Eggs Benedict"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Description</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium resize-none"
                    rows={3}
                    placeholder="Describe the dish..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">Price ($)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as MenuItem['category'] })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                      aria-label="Select category"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Image URL</label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-slate-500 mt-1">Leave empty for default image</p>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="available"
                    checked={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 bg-slate-100 border-slate-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="available" className="text-sm font-bold text-slate-700">Available for ordering</label>
                </div>

                <div className="flex gap-3 pt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
                  >
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
