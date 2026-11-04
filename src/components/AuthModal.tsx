import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Lock, Mail, User as UserIcon, Phone, ShieldCheck, ArrowRight, Gift, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { login, register } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('ref') || '';
    }
    return '';
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      if (!email) return;
      login(email);
    } else {
      if (!name || !email) return;
      register(name, email, phone, referralCode);
    }
    onClose();
  };

  const handleDemoAccount = (role: 'customer' | 'admin') => {
    if (role === 'admin') {
      login('admin.ops@apex-tesla.io');
    } else {
      login('alex.vance@apex-tesla.io');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-950 border border-red-500/30 rounded-3xl shadow-2xl overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-red-950/70 via-zinc-900 to-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 font-bold text-sm">
              T
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">
                {mode === 'login' ? 'Tesla Customer Sign In' : 'Create Apex Tesla Account'}
              </h3>
              <p className="text-xs text-zinc-400">Personalized dashboard, service history & crypto wallet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-2 p-1.5 m-6 mb-2 bg-zinc-900 rounded-xl border border-zinc-800">
          <button
            onClick={() => setMode('login')}
            className={`py-2 text-xs font-semibold rounded-lg transition ${
              mode === 'login'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => setMode('register')}
            className={`py-2 text-xs font-semibold rounded-lg transition ${
              mode === 'register'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4">
          {mode === 'register' && (
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">Full Legal Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Vance"
                  className="w-full bg-zinc-900/90 border border-zinc-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full bg-zinc-900/90 border border-zinc-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">Phone Number (SMS Alert)</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-zinc-900/90 border border-zinc-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-zinc-900/90 border border-zinc-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label className="font-medium text-zinc-300">Invite / Referral Code (Optional)</label>
                <span className="text-emerald-400 font-semibold text-[11px]">+$25 Credit & 5 Spins</span>
              </div>
              <div className="relative">
                <Gift className="w-4 h-4 absolute left-3 top-3 text-emerald-400" />
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="e.g. APEX-ALEX-99"
                  className="w-full bg-zinc-900/90 border border-emerald-500/40 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              {referralCode && (
                <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Referral bonus active: $25 welcome service credit applied!</span>
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-heading font-bold text-sm shadow-lg shadow-red-900/40 flex items-center justify-center gap-2 transition mt-2"
          >
            <span>{mode === 'login' ? 'Access Personal Dashboard' : (referralCode ? 'Create Account & Claim $25 Bonus' : 'Create & Claim Free Spins')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-2 border-t border-zinc-800 text-center">
            <p className="text-[11px] text-zinc-500 mb-2">Or test directly with one-click demo credentials:</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleDemoAccount('customer')}
                className="flex-1 py-1.5 px-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-xs transition"
              >
                Customer Demo (Alex)
              </button>
              <button
                type="button"
                onClick={() => handleDemoAccount('admin')}
                className="flex-1 py-1.5 px-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-xs transition"
              >
                Admin Fleet Ops
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted Session with Cold-Storage Vault Security</span>
          </div>
        </form>
      </div>
    </div>
  );
};
