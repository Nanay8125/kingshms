
import React, { useState } from 'react';
import { Hotel, Mail, Lock, LogIn, ShieldAlert, Sparkles, Loader2, Key } from 'lucide-react';
import { StaffMember } from '../types';
import { authService } from '../services/authService';

interface LoginFormProps {
  staffMembers: StaffMember[];
  onLogin: (user: StaffMember) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ staffMembers, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Simulate network delay
    await new Promise(r => setTimeout(r, 1200));

    const result = await authService.login(email, password, staffMembers);

    if (result.success && result.user) {
      onLogin(result.user);
    } else {
      setError(result.error || 'Invalid email or password. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);
    setResetMessage(null);

    const result = await authService.requestPasswordReset(resetEmail, staffMembers);

    if (result.success) {
      setResetMessage('Password reset requested. Check the console for the reset token.');
    } else {
      setResetMessage(result.error || 'Failed to request password reset.');
    }
    setIsResetting(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);
    setResetMessage(null);

    const result = await authService.resetPassword(resetEmail, resetToken, newPassword, staffMembers);

    if (result.success) {
      setResetMessage('Password reset successfully! You can now log in with your new password.');
      setShowResetForm(false);
      setResetEmail('');
      setResetToken('');
      setNewPassword('');
    } else {
      setResetMessage(result.error || 'Failed to reset password.');
    }
    setIsResetting(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />

      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-indigo-600 rounded-2xl shadow-2xl shadow-indigo-500/20 mb-6">
            <Hotel size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">StayOS HMS</h1>
          <p className="text-slate-400 text-sm font-medium">Internal Operations Management Portal</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[32px] shadow-2xl relative">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3 animate-in shake duration-300">
                <ShieldAlert className="text-rose-500 shrink-0 mt-0.5" size={18} />
                <p className="text-xs font-bold text-rose-200 leading-relaxed">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input
                  required
                  type="email"
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-600 shadow-inner"
                  placeholder="name@stayos.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input
                  required
                  type="password"
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-600 shadow-inner"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98] group"
            >
              {isSubmitting ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                  Sign In to Terminal
                </>
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowResetForm(!showResetForm)}
                className="text-slate-400 hover:text-indigo-400 text-xs font-medium transition-colors"
              >
                Forgot Password?
              </button>
            </div>
          </form>

          {showResetForm && (
            <div className="mt-6 pt-6 border-t border-white/5">
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reset Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input
                      required
                      type="email"
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-600 shadow-inner"
                      placeholder="name@stayos.com"
                      value={resetEmail}
                      onChange={e => setResetEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isResetting}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-600/20 transition-all active:scale-[0.98] group"
                >
                  {isResetting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <Key size={16} className="group-hover:scale-110 transition-transform" />
                      Request Reset
                    </>
                  )}
                </button>
              </form>

              {resetMessage && (
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                  <p className="text-xs font-bold text-amber-200 leading-relaxed">{resetMessage}</p>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="mt-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reset Token</label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-600 shadow-inner"
                    placeholder="Enter reset token"
                    value={resetToken}
                    onChange={e => setResetToken(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input
                      required
                      type="password"
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-600 shadow-inner"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isResetting}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/20 transition-all active:scale-[0.98] group"
                >
                  {isResetting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <Key size={16} className="group-hover:scale-110 transition-transform" />
                      Reset Password
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-white/5">
            <div className="flex items-center gap-2 mb-4">
               <Sparkles size={14} className="text-amber-500" />
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Demo Accounts (Password: SecurePass123!)</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-400">
               <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                 <p className="text-white">Admin</p>
                 <p className="opacity-60">agyirisakyi@stayos.com</p>
               </div>
               <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                 <p className="text-white">Housekeeper</p>
                 <p className="opacity-60">maria@stayos.com</p>
               </div>
               <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                 <p className="text-white">Front Desk</p>
                 <p className="opacity-60">sarah@stayos.com</p>
               </div>
               <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                 <p className="text-white">Maintenance</p>
                 <p className="opacity-60">dave@stayos.com</p>
               </div>
            </div>
          </div>
        </div>

        <p className="text-center mt-8 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
          Internal Access Only • StayOS Enterprise HMS v2.4
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
