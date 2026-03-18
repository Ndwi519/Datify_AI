import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Sparkles, Eye, EyeOff, Loader2 } from 'lucide-react';

const API_BASE = 'http://localhost:8001';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('username', form.email);
      params.append('password', form.password);
      const res = await axios.post(`${API_BASE}/auth/login`, params);
      const { access_token, name, email } = res.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify({ name, email }));
      onLogin({ name, email });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-purple-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-2xl shadow-xl shadow-blue-500/30 mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Datify AI</h1>
          <p className="text-slate-400 mt-2 text-[10px] font-black uppercase tracking-[0.2em]">Sign In to Your Account</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-5 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
                <button type="button" tabIndex={-1} onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 disabled:opacity-60 flex items-center justify-center space-x-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Login</span>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400 font-bold uppercase tracking-widest">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-400 font-black hover:text-blue-300 transition-colors">Create One</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
