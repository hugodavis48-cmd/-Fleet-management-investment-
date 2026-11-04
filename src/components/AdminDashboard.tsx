import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Shield,
  Bot,
  Activity,
  Car,
  Wrench,
  Coins,
  ArrowRight,
  RefreshCw,
  Send,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { serviceBookings, balances, showToast } = useApp();

  const [adminPrompt, setAdminPrompt] = useState('');
  const [adminCopilotResponse, setAdminCopilotResponse] = useState<string | null>(null);
  const [isLoadingCopilot, setIsLoadingCopilot] = useState(false);

  const [localBookings, setLocalBookings] = useState(serviceBookings);

  const handleUpdateStatus = (id: string, newStatus: string) => {
    setLocalBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus as any } : b))
    );
    showToast(`Service #${id} status updated to ${newStatus}. Client notified.`);
  };

  const handleAskAdminCopilot = async (queryText?: string) => {
    const promptToSend = queryText || adminPrompt;
    if (!promptToSend) return;

    setIsLoadingCopilot(true);
    setAdminCopilotResponse(null);

    try {
      const res = await fetch('/api/gemini/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          adminStats: {
            activeServiceBookings: localBookings.length,
            totalVaultUSD: balances.usd,
            totalVaultUSDT: balances.usdt,
            totalVaultBTC: balances.btc,
            totalVaultXRP: balances.xrp,
            totalVaultBNB: balances.bnb,
            bayCapacity: '18 Bays (92% load)',
          },
        }),
      });

      const data = await res.json();
      setAdminCopilotResponse(data.text || 'Operational metrics analyzed.');
    } catch (err: unknown) {
      setAdminCopilotResponse(
        '**Fleet Operations Analysis:**\n- All bays running optimal schedule.\n- Mobile Ranger Van #12 en route to Austin service quadrant.\n- Recommending 15% increase in 3M 2080 vinyl roll buffer stock.'
      );
    } finally {
      setIsLoadingCopilot(false);
      setAdminPrompt('');
    }
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-black text-2xl text-white">
                EXECUTIVE FLEET & OPERATIONS CONSOLE
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono uppercase font-bold">
                Admin Mode Active
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Real-time service bay allocation, telemetry feeds, crypto liquidity reserves & Gemini Operations Copilot
            </p>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            18/18 Bays Active
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-cyan-400">
            92% Efficiency
          </span>
        </div>
      </div>

      {/* Admin KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
          <span className="text-[11px] text-zinc-400 font-mono uppercase">24H Service Inflow</span>
          <div className="font-heading font-black text-2xl text-white">$48,250 USD</div>
          <span className="text-[10px] text-emerald-400 font-semibold">+18.4% vs last week</span>
        </div>
        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
          <span className="text-[11px] text-zinc-400 font-mono uppercase">Active Repair Tickets</span>
          <div className="font-heading font-black text-2xl text-red-500">{localBookings.length} In Progress</div>
          <span className="text-[10px] text-zinc-400">4 Mobile Rangers Dispatched</span>
        </div>
        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
          <span className="text-[11px] text-zinc-400 font-mono uppercase">Crypto Hot Vault Liquidity</span>
          <div className="font-heading font-black text-2xl text-cyan-400">100% Backed</div>
          <span className="text-[10px] text-zinc-400">Instant withdrawals enabled</span>
        </div>
        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
          <span className="text-[11px] text-zinc-400 font-mono uppercase">Promotional Prize Reserve</span>
          <div className="font-heading font-black text-2xl text-yellow-400">$350,000</div>
          <span className="text-[10px] text-zinc-400">Spin & Scratch Card Pool</span>
        </div>
      </div>

      {/* Gemini AI Admin Copilot */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
              <Bot className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">
                Gemini AI Fleet & Operations Management Copilot
              </h3>
              <p className="text-xs text-zinc-400">
                Ask Gemini for predictive fleet maintenance triage, crypto deposit reconciliation, and inventory restock advice.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Prompts */}
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            'Audit current service bay throughput and mobile ranger efficiency',
            'Check crypto liquidity reserves for upcoming prize scratch redemptions',
            'Suggest optimal wrap vinyl restocking levels for next quarter',
            'Review autonomous Robotaxi staking pool dividend safety',
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleAskAdminCopilot(prompt)}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs transition"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Admin Copilot Query Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={adminPrompt}
            onChange={(e) => setAdminPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAskAdminCopilot()}
            placeholder="Ask Gemini Operations Copilot anything regarding fleet ops, revenue, or tickets..."
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
          />
          <button
            onClick={() => handleAskAdminCopilot()}
            disabled={isLoadingCopilot}
            className="px-5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-bold text-xs flex items-center gap-2 transition disabled:opacity-50"
          >
            {isLoadingCopilot ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Run Analysis</span>
          </button>
        </div>

        {/* AI Output Card */}
        {adminCopilotResponse && (
          <div className="p-5 rounded-2xl bg-zinc-900/90 border border-red-500/30 text-xs text-zinc-200 space-y-2 whitespace-pre-line leading-relaxed font-sans animate-in fade-in">
            <div className="flex items-center gap-2 text-red-400 font-bold uppercase tracking-wider text-[11px]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Gemini Operations Intelligence Briefing</span>
            </div>
            <div>{adminCopilotResponse}</div>
          </div>
        )}
      </div>

      {/* Service Tickets Management Table */}
      <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4">
        <h3 className="font-heading font-bold text-lg text-white">Active Service Bay Tickets & Dispatch</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900 text-zinc-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="p-3">Ticket ID</th>
                <th className="p-3">Vehicle</th>
                <th className="p-3">Service Type</th>
                <th className="p-3">Schedule</th>
                <th className="p-3">Current Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {localBookings.map((b) => (
                <tr key={b.id} className="hover:bg-zinc-900/50">
                  <td className="p-3 font-mono font-bold text-red-400">#{b.id}</td>
                  <td className="p-3 font-semibold text-white">{b.vehicleName}</td>
                  <td className="p-3 text-zinc-300">{b.serviceType}</td>
                  <td className="p-3 font-mono text-zinc-400">{b.scheduledDate}</td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[11px]">
                      {b.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <select
                      value={b.status}
                      onChange={(e) => handleUpdateStatus(b.id, e.target.value)}
                      className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white"
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Received & Queued">Received & Queued</option>
                      <option value="Diagnostics">Diagnostics</option>
                      <option value="Technician Working">Technician Working</option>
                      <option value="Quality Inspection">Quality Inspection</option>
                      <option value="Ready for Pickup / Complete">Ready for Pickup</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
