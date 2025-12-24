
import React, { useState } from 'react';

interface LoginViewProps {
  onLogin: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      onLogin();
    } else {
      setError('Username atau password salah!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md space-y-8 animate-slideDown">
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-xl mb-4 rotate-3">
             <img 
              src="https://i.ibb.co.com/c9Y905N/Logo-SMPN-3-PACET.png" 
              alt="Logo" 
              className="w-14 h-14 object-contain -rotate-3"
            />
          </div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Supervisi Pro</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Portal Manajemen Akademik</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold text-center animate-shake">
              {error}
            </div>
          )}
          
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)}
              className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-slate-700" 
              placeholder="admin"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-slate-700" 
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
          >
            Masuk Sekarang
          </button>
        </form>

        <div className="text-center pt-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">© 2025 SMPN 3 PACET • DEVELOPED BY ERHA</p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
