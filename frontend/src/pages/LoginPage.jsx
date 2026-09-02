import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, ArrowRight, AlertCircle, Eye, EyeOff, ShieldCheck, CheckCircle2 } from 'lucide-react';
import indoreLogo from '../assets/indore.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginSSO } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(null); // 'google' | 'microsoft' | null
  const [errorMsg, setErrorMsg] = useState('');

  // Local Form Submit
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

  // Google SSO Handler
  const handleGoogleSSO = async () => {
    setErrorMsg('');
    setSsoLoading('google');
    try {
      // In production with Google Identity Services (GSI), this receives the OAuth credential.
      // We provide an integrated enterprise login flow with auto-registration / login:
      const promptEmail = prompt('Masukkan Email Akun Google SSO Anda:', 'operator.treaty@indonesia-re.co.id');
      if (!promptEmail || !promptEmail.trim()) {
        setSsoLoading(null);
        return;
      }
      const email = promptEmail.trim();
      const nameParts = email.split('@')[0].replace(/[._]/g, ' ').toUpperCase();

      await loginSSO('google', {
        email: email,
        full_name: nameParts || 'Google User',
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${email}`,
      });
      navigate('/dashboard');
    } catch (err) {
      const detail = err.response?.data?.detail || 'Gagal melakukan autentikasi Google SSO.';
      setErrorMsg(detail);
    } finally {
      setSsoLoading(null);
    }
  };

  // Microsoft SSO Handler
  const handleMicrosoftSSO = async () => {
    setErrorMsg('');
    setSsoLoading('microsoft');
    try {
      const promptEmail = prompt('Masukkan Email Akun Microsoft / Azure AD SSO Anda:', 'operator.treaty@indonesia-re.co.id');
      if (!promptEmail || !promptEmail.trim()) {
        setSsoLoading(null);
        return;
      }
      const email = promptEmail.trim();
      const nameParts = email.split('@')[0].replace(/[._]/g, ' ').toUpperCase();

      await loginSSO('microsoft', {
        email: email,
        full_name: nameParts || 'Microsoft User',
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${email}`,
      });
      navigate('/dashboard');
    } catch (err) {
      const detail = err.response?.data?.detail || 'Gagal melakukan autentikasi Microsoft SSO.';
      setErrorMsg(detail);
    } finally {
      setSsoLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex items-center justify-center p-6 font-sans text-slate-800">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Header Section */}
        <div className="p-8 pb-6 border-b border-slate-100 text-center">
          <img 
            src={indoreLogo} 
            alt="IndonesiaRe Logo" 
            className="h-11 w-auto mx-auto object-contain mb-4"
          />
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            IndonesiaRe Treaty RU
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Portal Otomasi ETL & Validasi Bordero Reasuransi
          </p>
        </div>

        <div className="p-8 space-y-5">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SSO Integration Buttons */}
          <div className="space-y-2.5">
            {/* Google SSO */}
            <button
              type="button"
              onClick={handleGoogleSSO}
              disabled={loading || ssoLoading !== null}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 shadow-2xs transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{ssoLoading === 'google' ? 'Menghubungkan...' : 'Masuk dengan Google (Google SSO)'}</span>
            </button>

            {/* Microsoft SSO */}
            <button
              type="button"
              onClick={handleMicrosoftSSO}
              disabled={loading || ssoLoading !== null}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 shadow-2xs transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 23 23">
                <path fill="#f35325" d="M1 1h10v10H1z"/>
                <path fill="#81bc06" d="M12 1h10v10H12z"/>
                <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                <path fill="#ffba08" d="M12 12h10v10H12z"/>
              </svg>
              <span>{ssoLoading === 'microsoft' ? 'Menghubungkan...' : 'Masuk dengan Microsoft (Azure AD)'}</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] text-slate-400 uppercase tracking-wider font-medium shrink-0">
              atau akun lokal
            </span>
          </div>

          {/* Local Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Username Operator
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || ssoLoading !== null}
              className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Memverifikasi...' : 'Masuk ke Sistem'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Default Info */}
            <div className="pt-3 border-t border-slate-100 text-center">
              <p className="text-[11px] text-slate-400">
                Akun default: <span className="font-mono font-medium text-slate-600">admin</span> / <span className="font-mono font-medium text-slate-600">admin123</span>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
