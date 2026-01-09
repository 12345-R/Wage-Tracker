
import React, { useState } from 'react';
import { supabase, isConfigMissing } from '../supabase';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(
    isConfigMissing 
      ? { type: 'warning', text: 'Database configuration is missing. Please check your environment variables.' } 
      : null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isConfigMissing) {
      setMessage({ type: 'error', text: 'Cannot connect: Supabase URL/Key missing.' });
      return;
    }
    setLoading(true);
    setMessage(null);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Success! Check your email for a confirmation link.' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Authentication failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-indigo-600 mb-2">WageCalc CA</h1>
          <p className="text-slate-500">
            {mode === 'login' ? 'Employer Login' : 'Create Admin Account'}
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg text-sm ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 
            message.type === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
            'bg-red-50 text-red-700 border border-red-100'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="employer@example.ca"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-indigo-600 font-semibold hover:underline"
          >
            {mode === 'login' ? "New here? Create an account" : 'Back to login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
