import React, { useState } from 'react';
import axios from 'axios';
import useDarkMode from '../hooks/useDarkMode';
import { User, Lock, Mail, Sun, Moon, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const API_BASE = 'http://localhost:8001';

const Settings = ({ user, onUserUpdate }) => {
  const [isDark, toggleTheme] = useDarkMode();
  const [name, setName] = useState(user?.name || '');
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [profileMsg, setProfileMsg] = useState(null);
  const [passMsg, setPassMsg] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    setProfileLoading(true);
    try {
      const res = await axios.put(`${API_BASE}/auth/me`, { name }, { headers });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      onUserUpdate({ name: res.data.name, email: res.data.email });
      localStorage.setItem('user', JSON.stringify({ name: res.data.name, email: res.data.email }));
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.detail || 'Update failed.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPassMsg(null);
    if (passwords.newPass !== passwords.confirm) {
      setPassMsg({ type: 'error', text: "New passwords don't match." });
      return;
    }
    if (passwords.newPass.length < 8) {
      setPassMsg({ type: 'error', text: 'Password must be at least 8 characters.' });
      return;
    }
    setPassLoading(true);
    try {
      await axios.put(`${API_BASE}/auth/change-password`, {
        current_password: passwords.current,
        new_password: passwords.newPass
      }, { headers });
      setPassMsg({ type: 'success', text: 'Password changed successfully!' });
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      setPassMsg({ type: 'error', text: err.response?.data?.detail || 'Password change failed.' });
    } finally {
      setPassLoading(false);
    }
  };

  const initials = (user?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="text-center md:text-left transition-all italic">
        <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter uppercase">Profile</h2>
        <p className="text-blue-500 dark:text-cyan-400 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Manage your account details.</p>
      </div>

      {/* Profile Card */}
      <div className="glass-card overflow-hidden transition-all duration-500 border border-white/10 shadow-2xl">
        <div className="flex items-center space-x-6 p-6 md:p-8 bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-200/50 dark:border-slate-800/50 mt-2">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-blue-500/40 transform -rotate-3 hover:rotate-0 transition-transform duration-500 border-2 border-white/20">
            {initials}
          </div>
          <div>
            <p className="font-black text-2xl text-slate-800 dark:text-white tracking-tight">{user?.name}</p>
            <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">
              <Mail className="w-4 h-4 text-blue-500" />
              <span>{user?.email}</span>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
            <form onSubmit={saveProfile} className="space-y-6">
              <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">
                  <User className="w-4 h-4 text-blue-500" />
                  <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Identity Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Display Name</label>
                    <input
                      type="text"
                      className="w-full px-5 py-3.5 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 rounded-2xl text-slate-800 dark:text-white font-bold text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none shadow-inner"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1 text-opacity-50">Email Identifier</label>
                    <input
                      type="email"
                      className="w-full px-5 py-3.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 dark:text-slate-600 text-sm cursor-not-allowed font-medium"
                      value={user?.email || ''}
                      readOnly
                    />
                  </div>
              </div>

              {profileMsg && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className={`flex items-center space-x-3 text-xs font-bold p-4 rounded-2xl ${profileMsg.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800/50'}`}>
                  {profileMsg.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{profileMsg.text}</span>
                </motion.div>
              )}
              
              <button type="submit" disabled={profileLoading} className="py-3.5 px-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-slate-900/10 dark:shadow-white/5">
                {profileLoading && <Loader2 className="w-4 h-4 animate-spin" />} Save Settings
              </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
