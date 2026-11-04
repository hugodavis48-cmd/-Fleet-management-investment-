import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Wrench,
  Wallet,
  Shield,
  Car,
  TrendingUp,
  Plus,
  BatteryCharging,
  Gauge,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Lock,
  Smartphone,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Zap,
  Users,
  Gift,
} from 'lucide-react';
import { TeslaVehicle } from '../types';
import { ReferralHub } from './ReferralHub';

interface DashboardProps {
  onOpenDeposit: () => void;
  onNavigateToServices: () => void;
  onOpenAuth: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenDeposit,
  onNavigateToServices,
  onOpenAuth,
}) => {
  const {
    currentUser,
    balances,
    vehicles,
    serviceBookings,
    transactions,
    addVehicle,
    toggle2FA,
    updatePin,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'garage' | 'services' | 'wallet' | 'security' | 'referrals'>('garage');
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    model: 'Model 3' as TeslaVehicle['model'],
    trim: 'Long Range AWD',
    year: 2024,
    vin: '5YJ3E1EB4PF' + Math.floor(100000 + Math.random() * 900000),
    licensePlate: 'TSLA-' + Math.floor(10 + Math.random() * 90),
    color: 'Midnight Silver Metallic',
    batterySoc: 90,
    odometer: 11200,
    estimatedRange: 335,
    serviceStatus: 'optimal' as TeslaVehicle['serviceStatus'],
    lastServiceDate: '2026-10-18',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80',
  });

  const [newPinInput, setNewPinInput] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);

  if (!currentUser) {
    return (
      <div className="py-20 px-4 text-center max-w-lg mx-auto space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="font-heading font-black text-3xl text-white">PERSONALIZED DASHBOARD</h2>
        <p className="text-zinc-400 text-sm">
          Sign up or log in to access your digital Tesla garage, live service bay telematics, crypto payment wallet, and fleet investment rewards.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-xl shadow-red-950/50 transition"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    addVehicle(newVehicle);
    setShowAddVehicleModal(false);
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput.length !== 4) {
      showToast('PIN must be exactly 4 digits.', 'error');
      return;
    }
    updatePin(newPinInput);
    setShowPinModal(false);
    setNewPinInput('');
  };

  // Helper for tracking stages
  const getStageIndex = (status: string) => {
    const stages = [
      'Scheduled',
      'Received & Queued',
      'Diagnostics',
      'Technician Working',
      'Quality Inspection',
      'Ready for Pickup / Complete',
    ];
    const idx = stages.indexOf(status);
    return idx >= 0 ? idx : 1;
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* User Header Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-red-500/50 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-black text-2xl text-white">{currentUser.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] font-mono uppercase font-bold">
                {currentUser.tier}
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">{currentUser.email}</p>
            <div className="flex items-center gap-3 text-[11px] text-zinc-500 mt-2 font-mono">
              <span>Member since: {currentUser.memberSince}</span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                2FA {currentUser.twoFactorEnabled ? 'Active' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Deposit & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-right pr-4">
            <span className="text-[10px] text-zinc-400 block font-mono">Total Vault Assets</span>
            <span className="font-heading font-black text-xl text-emerald-400">
              ${balances.usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <button
            onClick={onOpenDeposit}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-heading font-bold text-xs shadow-lg shadow-red-950/40 flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Deposit Crypto</span>
          </button>
        </div>
      </div>

      {/* Dashboard Subtabs Navigation */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
        {[
          { id: 'garage', label: 'My Digital Garage', count: vehicles.length, icon: Car },
          { id: 'services', label: 'Real-time Service Tracker', count: serviceBookings.length, icon: Wrench },
          { id: 'wallet', label: 'Crypto & Fiat Vault', count: transactions.length, icon: Wallet },
          { id: 'referrals', label: 'Invite & Earn', count: currentUser.referralCount || 0, icon: Users, badge: '+$100' },
          { id: 'security', label: 'Wallet Protection & 2FA', icon: Shield },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition shrink-0 ${
                active
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-emerald-500 text-black">
                  {tab.badge}
                </span>
              )}
              {tab.count !== undefined && !tab.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    active ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Digital Garage */}
      {activeTab === 'garage' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-heading font-bold text-xl text-white">Registered Tesla Fleet</h3>
              <p className="text-xs text-zinc-400">Live telematics, battery state-of-charge, and maintenance logs</p>
            </div>
            <button
              onClick={() => setShowAddVehicleModal(true)}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Tesla to Garage</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vehicles.map((v) => (
              <div
                key={v.id}
                className="rounded-3xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-xl"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-black">
                  <img src={v.image} alt={v.model} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />

                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-zinc-700 text-xs font-bold text-white">
                    {v.licensePlate}
                  </div>

                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-emerald-600/80 backdrop-blur-md text-[11px] font-mono font-bold text-white">
                    {v.batterySoc}% Charged
                  </div>

                  <div className="absolute bottom-3 left-4">
                    <span className="text-[10px] uppercase font-mono text-zinc-400 font-bold block">
                      {v.year} {v.model}
                    </span>
                    <h4 className="font-heading font-bold text-xl text-white">{v.trim}</h4>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* Telematics Bar */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-500 block">EST. RANGE</span>
                      <span className="text-white font-bold">{v.estimatedRange} mi</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block">ODOMETER</span>
                      <span className="text-white font-bold">{v.odometer.toLocaleString()} mi</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block">COLOR / WRAP</span>
                      <span className="text-red-400 font-semibold truncate block">{v.color.split(' ')[0]}</span>
                    </div>
                  </div>

                  {v.wrapType && (
                    <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 text-xs text-zinc-300">
                      <span className="text-[10px] text-zinc-500 font-mono block">INSTALLED WRAP SPEC</span>
                      <span className="font-medium text-white">{v.wrapType}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          v.serviceStatus === 'optimal'
                            ? 'bg-emerald-400'
                            : v.serviceStatus === 'in_service'
                            ? 'bg-yellow-400 animate-pulse'
                            : 'bg-red-400'
                        }`}
                      />
                      <span className="text-zinc-300 capitalize font-medium">
                        Status: {v.serviceStatus.replace('_', ' ')}
                      </span>
                    </div>

                    <button
                      onClick={onNavigateToServices}
                      className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition flex items-center gap-1"
                    >
                      <Wrench className="w-3.5 h-3.5 text-red-400" />
                      <span>Book Service</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Real-time Service Tracker */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-heading font-bold text-xl text-white">Live Service & Repair Progress</h3>
              <p className="text-xs text-zinc-400">Step-by-step telemetry, technician notes & GPS Ranger tracking</p>
            </div>
            <button
              onClick={onNavigateToServices}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition"
            >
              + Schedule New Repair
            </button>
          </div>

          {serviceBookings.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-zinc-950 border border-zinc-800 space-y-3">
              <Wrench className="w-12 h-12 text-zinc-600 mx-auto" />
              <p className="text-zinc-300 font-bold">No active service appointments found.</p>
              <p className="text-xs text-zinc-500">Need scheduled maintenance, diagnostics, or a custom wrap? Book in seconds!</p>
              <button
                onClick={onNavigateToServices}
                className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs"
              >
                Schedule Appointment
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {serviceBookings.map((booking) => {
                const currentStageIdx = getStageIndex(booking.status);
                const stages = [
                  'Scheduled',
                  'Received & Queued',
                  'Diagnostics',
                  'Technician Working',
                  'Quality Inspection',
                  'Ready for Pickup',
                ];

                return (
                  <div
                    key={booking.id}
                    className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-xl space-y-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-red-400 uppercase">
                            #{booking.id}
                          </span>
                          <span className="text-zinc-600">•</span>
                          <span className="text-xs font-semibold text-zinc-300">{booking.vehicleName}</span>
                        </div>
                        <h4 className="font-heading font-black text-xl text-white mt-1">
                          {booking.serviceType}
                        </h4>
                        <p className="text-xs text-zinc-400">{booking.location}</p>
                      </div>

                      <div className="text-right">
                        <span className="px-3 py-1 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-bold inline-block">
                          {booking.status}
                        </span>
                        <span className="text-xs text-zinc-400 block mt-1 font-mono">
                          {booking.scheduledDate} @ {booking.timeSlot}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar 5-Stage Stepper */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs text-zinc-400">
                        <span>Workflow Phase: {booking.status}</span>
                        <span className="font-mono text-emerald-400 font-bold">{booking.progressPercentage}% Completed</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-zinc-900 overflow-hidden p-0.5 border border-zinc-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-emerald-400 transition-all duration-500"
                          style={{ width: `${booking.progressPercentage}%` }}
                        />
                      </div>

                      {/* Stage steps indicator */}
                      <div className="grid grid-cols-6 gap-1 pt-2">
                        {stages.map((stg, i) => {
                          const isDone = i <= currentStageIdx;
                          const isCurrent = i === currentStageIdx;
                          return (
                            <div key={stg} className="text-center space-y-1">
                              <div
                                className={`w-5 h-5 mx-auto rounded-full flex items-center justify-center text-[10px] font-bold ${
                                  isDone
                                    ? 'bg-red-600 text-white shadow-sm shadow-red-950'
                                    : 'bg-zinc-800 text-zinc-500'
                                } ${isCurrent ? 'ring-2 ring-yellow-400' : ''}`}
                              >
                                {isDone ? '✓' : i + 1}
                              </div>
                              <span className="text-[9px] text-zinc-400 hidden sm:block truncate leading-tight">
                                {stg}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Technician Notes */}
                    {booking.technicianNotes && (
                      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 text-red-400 font-semibold font-mono">
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Active Bay Telemetry & Master Technician Notes</span>
                        </div>
                        <p className="text-zinc-300 leading-relaxed">{booking.technicianNotes}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Crypto & Fiat Vault */}
      {activeTab === 'wallet' && (
        <div className="space-y-6">
          {/* Balances Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: 'Apex USD Vault', symbol: 'USD', val: balances.usd.toFixed(2), isFiat: true },
              { label: 'Tether USD', symbol: 'USDT', val: balances.usdt.toFixed(2) },
              { label: 'Bitcoin', symbol: 'BTC', val: balances.btc.toFixed(4) },
              { label: 'Ripple XRP', symbol: 'XRP', val: balances.xrp.toFixed(2) },
              { label: 'BNB Chain', symbol: 'BNB', val: balances.bnb.toFixed(3) },
            ].map((coin) => (
              <div
                key={coin.symbol}
                className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2"
              >
                <div className="flex justify-between items-center text-xs text-zinc-400">
                  <span>{coin.symbol}</span>
                  <span className="text-[10px] font-mono bg-zinc-900 px-1.5 py-0.5 rounded">
                    {coin.isFiat ? 'FIAT' : 'ON-CHAIN'}
                  </span>
                </div>
                <div className="font-heading font-black text-xl text-white">
                  {coin.val}
                </div>
                <span className="text-[10px] text-zinc-500 block truncate">{coin.label}</span>
              </div>
            ))}
          </div>

          {/* Deposit Trigger Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-red-950/40 via-zinc-900 to-zinc-950 border border-red-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-heading font-bold text-lg text-white">Make a Direct Deposit</h4>
              <p className="text-xs text-zinc-400">Instant funding via XRP, USDT (TRC/ERC), BNB, and BTC with 0% platform fee.</p>
            </div>
            <button
              onClick={onOpenDeposit}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-heading font-bold text-xs shadow-lg shadow-red-950/50 flex items-center gap-2 shrink-0 transition"
            >
              <Zap className="w-4 h-4" />
              <span>Launch Deposit Gateway</span>
            </button>
          </div>

          {/* Transaction Ledger Table */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 space-y-4">
            <h4 className="font-heading font-bold text-lg text-white">On-Chain Transaction Audit Ledger</h4>

            <div className="divide-y divide-zinc-800/80">
              {transactions.map((tx) => (
                <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl ${
                        tx.type === 'deposit' || tx.type === 'promotion_win' || tx.type === 'dividend_claim'
                          ? 'bg-emerald-600/20 text-emerald-400'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {tx.type === 'deposit' || tx.type === 'promotion_win' || tx.type === 'dividend_claim' ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-white truncate">{tx.description}</p>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {tx.timestamp} • TX: {tx.txHash}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-mono font-bold text-sm ${
                        tx.type === 'deposit' || tx.type === 'promotion_win' || tx.type === 'dividend_claim'
                          ? 'text-emerald-400'
                          : 'text-zinc-200'
                      }`}
                    >
                      {tx.type === 'deposit' || tx.type === 'promotion_win' || tx.type === 'dividend_claim' ? '+' : '-'}
                      ${tx.usdEquivalent.toLocaleString()} USD
                    </span>
                    <span className="text-[10px] text-zinc-500 block capitalize">{tx.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Security Measures */}
      {activeTab === 'security' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-6">
          <div>
            <h3 className="font-heading font-bold text-xl text-white">Wallet & Account Protection</h3>
            <p className="text-xs text-zinc-400">Institutional grade security, hardware HSM vault isolation, and 2FA</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 2FA Card */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-heading font-bold text-base text-white">Two-Factor Authentication (2FA)</h4>
                  <p className="text-xs text-zinc-400 mt-1">Requires biometric or authenticator passkey for high-value service payouts and crypto withdrawals.</p>
                </div>
                <Smartphone className="w-6 h-6 text-red-500 shrink-0" />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className={`text-xs font-bold ${currentUser.twoFactorEnabled ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  Status: {currentUser.twoFactorEnabled ? 'ENABLED' : 'DISABLED'}
                </span>
                <button
                  onClick={toggle2FA}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    currentUser.twoFactorEnabled
                      ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {currentUser.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA Protection'}
                </button>
              </div>
            </div>

            {/* PIN Card */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-heading font-bold text-base text-white">Transaction Security PIN</h4>
                  <p className="text-xs text-zinc-400 mt-1">4-digit PIN required prior to confirming crypto balance withdrawals or vehicle investment redemptions.</p>
                </div>
                <Lock className="w-6 h-6 text-yellow-500 shrink-0" />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-zinc-300">
                  {currentUser.pinSet ? 'PIN Set (••••)' : 'No PIN Configured'}
                </span>
                <button
                  onClick={() => setShowPinModal(true)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition"
                >
                  {currentUser.pinSet ? 'Update PIN' : 'Set Security PIN'}
                </button>
              </div>
            </div>
          </div>

          {/* Cold storage hardware vault info */}
          <div className="p-5 rounded-2xl bg-black/60 border border-emerald-500/30 flex items-start gap-3 text-xs text-zinc-300">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block text-sm">Level 4 Multi-Signature Cold Storage Protection</strong>
              <p className="text-zinc-400 mt-0.5 leading-relaxed">
                98% of customer crypto reserves (BTC, USDT, XRP, BNB) are stored in air-gapped hardware security modules (HSM) with geographic threshold distribution. Real-time proof-of-reserves audits are continuously performed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Referrals & Invites */}
      {activeTab === 'referrals' && (
        <ReferralHub onOpenDeposit={onOpenDeposit} onOpenAuth={onOpenAuth} />
      )}

      {/* Add Vehicle Modal */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4 text-zinc-100">
            <h3 className="font-heading font-bold text-lg text-white">Add Tesla Vehicle to Garage</h3>
            <form onSubmit={handleCreateVehicle} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Tesla Model</label>
                <select
                  value={newVehicle.model}
                  onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value as TeslaVehicle['model'] })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Model S">Model S</option>
                  <option value="Model 3">Model 3</option>
                  <option value="Model X">Model X</option>
                  <option value="Model Y">Model Y</option>
                  <option value="Cybertruck">Cybertruck</option>
                  <option value="Roadster">Roadster</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Trim / Specification</label>
                <input
                  type="text"
                  required
                  value={newVehicle.trim}
                  onChange={(e) => setNewVehicle({ ...newVehicle, trim: e.target.value })}
                  placeholder="e.g. Plaid Tri-Motor"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-400 block mb-1">Year</label>
                  <input
                    type="number"
                    value={newVehicle.year}
                    onChange={(e) => setNewVehicle({ ...newVehicle, year: Number(e.target.value) })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">License Plate</label>
                  <input
                    type="text"
                    value={newVehicle.licensePlate}
                    onChange={(e) => setNewVehicle({ ...newVehicle, licensePlate: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddVehicleModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Security PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4 text-zinc-100">
            <h3 className="font-heading font-bold text-lg text-white">Set 4-Digit Security PIN</h3>
            <p className="text-xs text-zinc-400">Used to authorize cryptocurrency withdrawals and high-value orders.</p>
            <form onSubmit={handleSavePin} className="space-y-4">
              <input
                type="password"
                maxLength={4}
                required
                value={newPinInput}
                onChange={(e) => setNewPinInput(e.target.value)}
                placeholder="4-digit PIN"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-center text-2xl font-mono tracking-widest text-white"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs"
                >
                  Save PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
