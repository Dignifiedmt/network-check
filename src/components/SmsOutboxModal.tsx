import React, { useState, useEffect } from 'react';
import { Mail, X, RefreshCw, Send, Smartphone, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { fetchSmsLogs } from '../services/apiClient';
import { SmsLogItem } from '../types';

interface SmsOutboxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmsOutboxModal: React.FC<SmsOutboxModalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<SmsLogItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const items = await fetchSmsLogs();
      setLogs(items);
    } catch (e) {
      console.error('Failed to load SMS logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadLogs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <h3 className="font-semibold text-sm sm:text-base">Africa's Talking SMS Gateway Console</h3>
              <p className="text-[10px] sm:text-xs text-slate-400">Two-way SMS delivery queue &amp; inbound citizen messages</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={loadLogs}
              disabled={loading}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title="Refresh SMS logs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 bg-slate-50">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
            <Smartphone className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold">Privacy-Preserving Telecom Dispatch (NDPR Compliant): </span>
              Citizen mobile numbers are securely masked (<code className="bg-blue-100 px-1 py-0.5 rounded font-mono">+234 803 *** 1492</code>). Connected directly with Africa's Talking SMS API and Web Simulator.
            </div>
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-medium text-slate-700">No SMS logged yet.</p>
              <p className="text-xs mt-1">Dial *384*20220# or send an SMS to 22220 to view transactions.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map(log => {
                const isIncoming = log.direction === 'incoming';
                return (
                  <div
                    key={log.id}
                    className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-xs hover:border-slate-300 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 mb-2 border-b border-slate-100 gap-1.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {isIncoming ? (
                          <div className="flex items-center gap-1 text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full text-[11px] font-bold">
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                            <span>Incoming from: {log.phone_masked}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px] font-bold">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            <span>Outgoing to: {log.phone_masked}</span>
                          </div>
                        )}
                        {log.reference && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
                            Ref: {log.reference}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            log.status === 'delivered' || log.status === 'sent'
                              ? 'bg-emerald-100 text-emerald-800'
                              : log.status === 'simulated'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {log.status === 'simulated'
                            ? 'Simulated (Demo)'
                            : log.status === 'delivered'
                            ? 'Delivered'
                            : log.status}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(log.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed border border-slate-100">
                      {log.message}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span>
                        Channel: <strong className="text-slate-600 font-sans">Africa's Talking Gateway</strong>
                      </span>
                      <span>{log.message.length} chars</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Total Logged: <strong>{logs.length}</strong> SMS messages
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
