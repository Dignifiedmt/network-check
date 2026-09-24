import React, { useState } from 'react';
import { Lock, Mail, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { adminLogin, setAdminToken } from '../services/apiClient';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@networkcheck.ng');
  const [password, setPassword] = useState('admin_secure_password_2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await adminLogin(email, password);
      if (res.success && res.token) {
        setAdminToken(res.token);
        onLoginSuccess();
      } else {
        setError(res.error || 'Invalid administrator credentials');
      }
    } catch (err: any) {
      setError('Connection failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemoCreds = () => {
    setEmail('admin@networkcheck.ng');
    setPassword('admin_secure_password_2026');
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 sm:px-6">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Administrator Access
          </h2>
          <p className="text-xs text-slate-500">
            Sign in to manage baseline datasets, validate CSV imports, and audit logs.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-300 rounded-xl text-xs text-red-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-emerald-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-emerald-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In as Administrator'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Pre-Configured Administrator Credentials Callout */}
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-emerald-900 font-bold">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Default Admin Credentials (Render / Production)
            </span>
            <span className="text-[10px] bg-emerald-200/80 px-2 py-0.5 rounded-full font-mono">
              Ready
            </span>
          </div>
          <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-200/80 font-mono text-xs space-y-1 text-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Email:</span>
              <span className="font-bold text-emerald-950">admin@networkcheck.ng</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Password:</span>
              <span className="font-bold text-emerald-950">admin_secure_password_2026</span>
            </div>
          </div>
          <button
            onClick={handleUseDemoCreds}
            type="button"
            className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Fill Credentials</span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Protected with bcrypt &amp; signed Bearer JWT</span>
        </div>
      </div>
    </div>
  );
};
