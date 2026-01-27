
import React, { useState, useRef } from 'react';
<<<<<<< HEAD
import { X, UserPlus, Briefcase, Phone, CheckCircle2, ShieldCheck, Mail, Shield, Smartphone, User, Camera, Trash2 } from 'lucide-react';
import { StaffMember, StaffStatus, UserRole, AccessKey } from '../types';
=======
import { X, UserPlus, Briefcase, Phone, CheckCircle2, ShieldCheck, Mail, Shield, Smartphone, User, Camera, Trash2, Key, Globe, Plus, Minus } from 'lucide-react';
import { StaffMember, StaffStatus, UserRole, AccessKey, RESTCredential, APIService } from '../types';
import { authService } from '../services/authService';
>>>>>>> gh-pages-local

interface StaffFormProps {
  onClose: () => void;
  onSubmit: (staff: StaffMember) => void;
}

const StaffForm: React.FC<StaffFormProps> = ({ onClose, onSubmit }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
<<<<<<< HEAD
=======
  const [restCredentials, setRestCredentials] = useState<RESTCredential[]>([]);
>>>>>>> gh-pages-local
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: 'Front Desk' as StaffMember['department'],
    permissionRole: UserRole.FRONT_DESK,
    phone: '',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const generateAccessKey = (): AccessKey => {
    const key = `${formData.department.toLowerCase().substring(0, 2)}_${Math.random().toString(36).substring(2, 15)}`;
    return {
      id: `ak${Math.random().toString(36).substr(2, 5)}`,
      key,
      createdAt: new Date().toISOString(),
      description: `${formData.role} Access Key`,
      active: true
    };
  };

<<<<<<< HEAD
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newStaff: StaffMember = {
      id: `s${Math.random().toString(36).substr(2, 5)}`,
=======
  const addRestCredential = () => {
    const newCredential: RESTCredential = {
      id: `rc${Math.random().toString(36).substr(2, 5)}`,
      service: APIService.FIREBASE,
      createdAt: new Date().toISOString(),
      description: '',
      active: true,
      encrypted: false
    };
    setRestCredentials([...restCredentials, newCredential]);
  };

  const updateRestCredential = (id: string, updates: Partial<RESTCredential>) => {
    setRestCredentials(creds =>
      creds.map(cred =>
        cred.id === id ? { ...cred, ...updates } : cred
      )
    );
  };

  const removeRestCredential = (id: string) => {
    setRestCredentials(creds => creds.filter(cred => cred.id !== id));
  };

  const encryptCredential = async (credential: RESTCredential): Promise<RESTCredential> => {
    try {
      const encrypted = await authService.encryptRESTCredential(credential);
      return encrypted;
    } catch (error) {
      console.error('Failed to encrypt credential:', error);
      return credential;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Encrypt any unencrypted credentials before submission
    const encryptedCredentials = await Promise.all(
      restCredentials.map(async (cred) => {
        if (!cred.encrypted && (cred.apiKey || cred.secretKey)) {
          return await encryptCredential(cred);
        }
        return cred;
      })
    );

    const newStaff: StaffMember = {
      id: `s${Math.random().toString(36).substr(2, 5)}`,
      companyId: 'company-1', // TODO: Get from current user/company context
>>>>>>> gh-pages-local
      name: formData.name,
      email: formData.email,
      role: formData.role,
      department: formData.department,
      permissionRole: formData.permissionRole,
      phone: formData.phone,
      status: StaffStatus.AVAILABLE,
      avatar: avatarPreview || `https://picsum.photos/seed/${formData.name.replace(/\s/g, '')}/100`,
      password: 'password123',
<<<<<<< HEAD
      accessKeys: [generateAccessKey()]
=======
      accessKeys: [generateAccessKey()],
      restCredentials: encryptedCredentials
>>>>>>> gh-pages-local
    };
    onSubmit(newStaff);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[70] p-4">
      <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-indigo-600 px-8 py-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl">
               <UserPlus size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Onboard New Team Member</h2>
              <p className="text-xs font-bold text-indigo-100 uppercase tracking-widest mt-0.5">Staff Credentials & Access</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Photo Upload Section */}
          <div className="flex flex-col items-center justify-center pb-2">
            <div 
              onClick={triggerFileInput}
              className="relative group cursor-pointer"
            >
              <div className="w-32 h-32 rounded-[40px] bg-slate-100 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden transition-all group-hover:border-indigo-100 group-hover:shadow-indigo-900/10">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-slate-400">
                    <User size={40} />
                    <span className="text-[8px] font-black uppercase tracking-widest mt-2">No Photo</span>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Camera size={32} className="text-white" />
                </div>
              </div>
              
              {avatarPreview && (
<<<<<<< HEAD
                <button 
                  type="button"
                  onClick={removeAvatar}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-rose-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-rose-600 transition-colors border-2 border-white"
                  title="Remove photo"
                >
=======
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-rose-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-rose-600 transition-colors border-2 border-white"
                  aria-label="Remove photo"
                >
                  <span className="sr-only">Remove photo</span>
>>>>>>> gh-pages-local
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">
              {avatarPreview ? 'Click to change image' : 'Click to upload profile photo'}
            </p>
<<<<<<< HEAD
            <input 
              type="file" 
=======
            <input
              type="file"
>>>>>>> gh-pages-local
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
<<<<<<< HEAD
=======
              aria-label="Upload profile photo"
>>>>>>> gh-pages-local
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  required
                  type="text"
                  placeholder="e.g. Robert Smith"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-sm font-bold text-slate-700"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  required
                  type="email"
                  placeholder="robert@luxestay.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-sm font-bold text-slate-700"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Professional Job Title</label>
            <div className="relative">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                required
                type="text"
                placeholder="e.g. Senior Concierge"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-sm font-bold text-slate-700"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
<<<<<<< HEAD
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department assignment</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select
=======
              <label htmlFor="department-select" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department assignment</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select
                  id="department-select"
>>>>>>> gh-pages-local
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-sm font-black text-slate-600 appearance-none cursor-pointer"
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value as any })}
                >
                  <option value="Front Desk">Front Desk Unit</option>
                  <option value="Housekeeping">Housekeeping Unit</option>
                  <option value="Maintenance">Maintenance Unit</option>
                  <option value="Concierge">Concierge Unit</option>
                  <option value="Management">Executive Mgmt</option>
                  <option value="Finance">Finance Dept</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
<<<<<<< HEAD
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">System Permission Role</label>
              <div className="relative">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select
=======
              <label htmlFor="permission-select" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">System Permission Role</label>
              <div className="relative">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select
                  id="permission-select"
>>>>>>> gh-pages-local
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-sm font-black text-slate-600 appearance-none cursor-pointer"
                  value={formData.permissionRole}
                  onChange={e => setFormData({ ...formData, permissionRole: e.target.value as UserRole })}
                >
                  <option value={UserRole.FRONT_DESK}>Front Desk Access</option>
                  <option value={UserRole.HOUSEKEEPING}>Service Access Only</option>
                  <option value={UserRole.MAINTENANCE}>Tech Access Only</option>
                  <option value={UserRole.MANAGEMENT}>Manager Level</option>
                  <option value={UserRole.ADMIN}>Full Terminal Admin</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Direct Contact Phone</label>
            <div className="relative">
              <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                required
                type="tel"
                placeholder="555-0000"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-sm font-bold text-slate-700"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

<<<<<<< HEAD
=======
          {/* REST API Credentials Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                  <Globe size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">REST API Credentials</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Configure external service access</p>
                </div>
              </div>
              <button
                type="button"
                onClick={addRestCredential}
                className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                title="Add REST Credential"
              >
                <Plus size={16} />
              </button>
            </div>

            {restCredentials.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-2xl">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Key size={24} className="text-slate-400" />
                </div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No REST credentials configured</p>
                <p className="text-[10px] text-slate-300 font-medium mt-1">Click + to add API access keys</p>
              </div>
            ) : (
              <div className="space-y-3">
                {restCredentials.map((cred, index) => (
                  <div key={cred.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Credential {index + 1}</span>
                        {cred.encrypted && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase tracking-widest rounded-full">Encrypted</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRestCredential(cred.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Remove Credential"
                      >
                        <Minus size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Service</label>
                        <select
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          value={cred.service}
                          onChange={e => updateRestCredential(cred.id, { service: e.target.value as APIService })}
                        >
                          <option value={APIService.FIREBASE}>Firebase</option>
                          <option value={APIService.GEMINI}>Google Gemini</option>
                          <option value={APIService.PAYMENT}>Payment Gateway</option>
                          <option value={APIService.EMAIL}>Email Service</option>
                          <option value={APIService.SMS}>SMS Service</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                        <input
                          type="text"
                          placeholder="e.g. Production API Key"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          value={cred.description || ''}
                          onChange={e => updateRestCredential(cred.id, { description: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">API Key</label>
                        <input
                          type="password"
                          placeholder="Enter API key"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          value={cred.apiKey || ''}
                          onChange={e => updateRestCredential(cred.id, { apiKey: e.target.value })}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Secret Key (Optional)</label>
                        <input
                          type="password"
                          placeholder="Enter secret key"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          value={cred.secretKey || ''}
                          onChange={e => updateRestCredential(cred.id, { secretKey: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={cred.active}
                          onChange={e => updateRestCredential(cred.id, { active: e.target.checked })}
                          className="w-3 h-3 text-indigo-600 bg-slate-100 border-slate-300 rounded focus:ring-indigo-500"
                        />
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Active</span>
                      </label>

                      <button
                        type="button"
                        onClick={async () => {
                          const encrypted = await encryptCredential(cred);
                          updateRestCredential(cred.id, encrypted);
                        }}
                        className="px-3 py-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-amber-600 transition-colors"
                        disabled={cred.encrypted}
                      >
                        {cred.encrypted ? 'Encrypted' : 'Encrypt'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

>>>>>>> gh-pages-local
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 rounded-2xl transition-all"
            >
              Discard
            </button>
            <button
              type="submit"
              className="flex-[2] px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/20 flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <CheckCircle2 size={20} />
              Verify & Add Staff
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffForm;
