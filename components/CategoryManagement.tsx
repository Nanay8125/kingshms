import React, { useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Layers,
  DollarSign,
  Users,
  Star,
  Check
} from 'lucide-react';
import { RoomCategory } from '../types';
import { dbService } from '../services/dbService';
import { uploadCategoryImage, uploadCategoryGallery } from '../services/firebase';
import { sanitizeSearchQuery, validateNumber } from '../services/security';

interface CategoryManagementProps {
  categories: RoomCategory[];
  onUpdateCategories: (categories: RoomCategory[]) => void;
}

const CategoryManagement: React.FC<CategoryManagementProps> = ({ categories, onUpdateCategories }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<RoomCategory | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    basePrice: 0,
    capacity: 2,
    amenities: '',
    imageUrl: '',
    gallery: ''
  });
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [mainImagePreview, setMainImagePreview] = useState<string>('');

  const filteredCategories = categories.filter(cat => {
    const sanitizedQuery = sanitizeSearchQuery(searchQuery).toLowerCase();
    return cat.name.toLowerCase().includes(sanitizedQuery);
  });

  const resetForm = () => {
    setFormData({
      name: '',
      basePrice: 0,
      capacity: 2,
      amenities: '',
      imageUrl: '',
      gallery: ''
    });
    setEditingCategory(null);
    setMainImageFile(null);
    setGalleryFiles([]);
    setMainImagePreview('');
  };

  const openEditModal = (category: RoomCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      basePrice: category.basePrice,
      capacity: category.capacity,
      amenities: category.amenities.join(', '),
      imageUrl: category.imageUrl || '',
      gallery: (category.gallery || []).join(', ')
    });
    setMainImagePreview(category.imageUrl || '');
    setMainImageFile(null);
    setGalleryFiles([]);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    let validatedPrice: number;
    try {
      validatedPrice = validateNumber(formData.basePrice, { min: 0, max: 10000 });
    } catch (error) {
      alert('Invalid price. Please enter a valid price between $0 and $10,000.');
      return;
    }

    let validatedCapacity: number;
    try {
      validatedCapacity = validateNumber(formData.capacity, { min: 1, max: 20 });
    } catch (error) {
      alert('Invalid capacity. Please enter a valid capacity between 1 and 20.');
      return;
    }

    if (!formData.name.trim()) {
      alert('Category name is required.');
      return;
    }

    const amenitiesList = formData.amenities.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const galleryList = formData.gallery.split(',').map(s => s.trim()).filter(s => s.length > 0);

    try {
      const uploadKey = editingCategory?.id || `new-${Date.now()}`;
      let uploadedImageUrl = formData.imageUrl.trim() || undefined;
      let uploadedGalleryUrls: string[] = formData.gallery ? formData.gallery.split(',').map(s => s.trim()).filter(Boolean) : [];

      if (mainImageFile) {
        uploadedImageUrl = await uploadCategoryImage(uploadKey, mainImageFile);
      }
      if (galleryFiles.length > 0) {
        const urls = await uploadCategoryGallery(uploadKey, galleryFiles);
        uploadedGalleryUrls = urls;
      }

      if (editingCategory) {
        // Update existing category
        const updates = {
          name: formData.name,
          basePrice: validatedPrice,
          capacity: validatedCapacity,
          amenities: amenitiesList,
          imageUrl: uploadedImageUrl,
          gallery: uploadedGalleryUrls.length ? uploadedGalleryUrls : galleryList,
          companyId: 'luxestay'
        };

        const updatedCategory = await dbService.update<RoomCategory>('categories', editingCategory.id, updates);

        if (updatedCategory) {
          const updatedCategories = categories.map(cat => cat.id === editingCategory.id ? updatedCategory : cat);
          onUpdateCategories(updatedCategories);
        }
      } else {
        // Create new category
        const newCategoryPayload = {
          name: formData.name,
          basePrice: validatedPrice,
          capacity: validatedCapacity,
          amenities: amenitiesList,
          imageUrl: uploadedImageUrl,
          gallery: uploadedGalleryUrls.length ? uploadedGalleryUrls : galleryList,
          companyId: 'luxestay',
          demandFactor: 'medium' as const
        };

        const createdCategory = await dbService.create<RoomCategory>('categories', newCategoryPayload);

        if (createdCategory) {
          onUpdateCategories([...categories, createdCategory]);
        }
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      try {
        const success = await dbService.delete('categories', id);
        if (success) {
          onUpdateCategories(categories.filter(cat => cat.id !== id));
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-purple-600 text-white rounded-3xl shadow-xl shadow-purple-200/50">
            <Layers size={36} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">Room Categories</h2>
            <p className="text-sm font-medium text-slate-500">Manage room types, pricing, and amenities.</p>
          </div>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="w-full md:w-auto px-8 py-4 bg-purple-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-purple-700 transition-all shadow-xl shadow-purple-900/20 active:scale-95"
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search categories..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <div key={category.id} className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl transition-all group">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                  <Layers size={24} />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(category)}
                    className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-2">{category.name}</h3>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1 text-slate-500 text-sm font-medium">
                  <DollarSign size={16} />
                  <span>${category.basePrice}/night</span>
                </div>
                <div className="flex items-center gap-1 text-slate-500 text-sm font-medium">
                  <Users size={16} />
                  <span>Up to {category.capacity}</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {category.amenities.slice(0, 3).map((amenity, i) => (
                    <span key={i} className="px-2 py-1 bg-slate-50 text-slate-600 rounded-lg text-xs font-medium border border-slate-100">
                      {amenity}
                    </span>
                  ))}
                  {category.amenities.length > 3 && (
                    <span className="px-2 py-1 bg-slate-50 text-slate-400 rounded-lg text-xs font-medium border border-slate-100">
                      +{category.amenities.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
            {category.imageUrl && (
              <div className="h-40 bg-slate-100">
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-900">
                  {editingCategory ? 'Edit Category' : 'Add Category'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Category Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-medium"
                    placeholder="e.g. Deluxe Suite"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">Base Price ($)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1"
                      value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">Capacity</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="20"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Amenities (comma separated)</label>
                  <textarea
                    value={formData.amenities}
                    onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-medium resize-none"
                    rows={3}
                    placeholder="e.g. WiFi, Ocean View, King Bed"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Main Image URL</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-medium"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Gallery Image URLs (comma separated)</label>
                  <textarea
                    value={formData.gallery}
                    onChange={(e) => setFormData({ ...formData, gallery: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-medium resize-none"
                    rows={2}
                    placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Main Image Upload</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setMainImageFile(file);
                      setMainImagePreview(file ? URL.createObjectURL(file) : '');
                    }}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-medium"
                  />
                  {(mainImagePreview || formData.imageUrl) && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-slate-200">
                      <img
                        src={mainImagePreview || formData.imageUrl}
                        alt="Preview"
                        className="w-full h-40 object-cover"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Gallery Upload (multiple)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setGalleryFiles(files);
                    }}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-medium"
                  />
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">You can still provide URLs; uploaded images take priority.</p>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-4 bg-purple-600 text-white rounded-xl font-black text-sm hover:bg-purple-700 transition-all shadow-lg shadow-purple-900/20"
                  >
                    {editingCategory ? 'Update Category' : 'Create Category'}
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

export default CategoryManagement;
