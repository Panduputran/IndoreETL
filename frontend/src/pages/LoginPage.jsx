import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import indoreLogo from '../assets/indore.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Silakan masukkan username dan password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      await login(username.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      const detail = err.response?.data?.detail || 'Username atau password tidak valid.';
      setErrorMsg(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-lg overflow-hidden">
        
        {/* Header Section */}
        <div className="p-8 pb-6 border-b border-slate-100 text-center">
          <img 
            src={indoreLogo} 
            alt="IndonesiaRe Logo" 
            className="h-10 w-auto mx-auto object-contain mb-4"
          />
          <h1 className="text-xl font-semibold text-slate-800 tracking-tight">
            Indore Treaty RU
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Masuk ke portal pengelolaan dan validasi bordero
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-700 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Input Username */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                autoComplete="username"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Input Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                autoComplete="current-password"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Tombol Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Memverifikasi...' : 'Masuk ke Sistem'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Helper Default */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              Akun default: <span className="font-mono text-slate-600">admin</span> / <span className="font-mono text-slate-600">admin123</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
