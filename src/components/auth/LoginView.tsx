import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useGameStore } from '../../stores/gameStore';
import { LogIn, User } from 'lucide-react';

const LoginView: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, clearError } = useAuthStore();
  const { setView, gameMode, setGameMode } = useGameStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!username || !password) {
      return;
    }

    const success = await login({ username, password });
    if (success) {
      setView('ROAM');
    }
  };

  const goToRegister = () => {
    clearError();
    setView('REGISTER');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500 rounded-full mb-4 shadow-2xl">
            <div className="w-12 h-12 bg-white rounded-full border-4 border-slate-900"></div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">关都传说</h1>
          <p className="text-slate-400">掌上对决</p>
        </div>

        {/* Login Form */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <LogIn className="text-cyan-400" size={24} />
              <h2 className="text-2xl font-bold text-white">登录</h2>
            </div>
            
            <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
              <button
                type="button"
                onClick={() => setGameMode('NORMAL')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  gameMode === 'NORMAL' 
                    ? 'bg-cyan-500 text-white shadow-lg' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                正常
              </button>
              <button
                type="button"
                onClick={() => setGameMode('CHEAT')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  gameMode === 'CHEAT' 
                    ? 'bg-purple-500 text-white shadow-lg' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                作弊
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Username Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                用户名
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                placeholder="请输入用户名"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                placeholder="请输入密码"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              登录
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm mb-2">还没有账号？</p>
            <button
              onClick={goToRegister}
              className="text-cyan-400 hover:text-cyan-300 font-medium text-sm flex items-center justify-center gap-2 mx-auto transition-colors"
            >
              <User size={16} />
              立即注册
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-slate-500 text-xs">
          <p>本地存储 · 数据仅保存在浏览器中</p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
