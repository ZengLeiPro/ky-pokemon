import React, { useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { useAuthStore } from '../../stores/authStore';
import { User, Clock, Award, Star, LogOut, Pencil, Key } from 'lucide-react';
import { WORLD_MAP } from '../../constants';

const ProfileView: React.FC = () => {
  const { playerMoney, logs, setView, badges } = useGameStore();
  const { currentUser, logout, updateUsername, updatePassword } = useAuthStore();
  const startTime = logs.find(l => l.id === 'init')?.timestamp || Date.now();
  const playTimeMinutes = Math.floor((Date.now() - startTime) / 60000);
  
  const allGyms = Object.values(WORLD_MAP).filter(l => l.gym).map(l => l.gym!);

    const handleRename = () => {
        const newName = prompt("请输入新的昵称：", currentUser?.username);
        if (newName && newName.trim()) {
            if (updateUsername(newName.trim())) {
                alert("昵称修改成功！");
            } else {
                alert("修改失败，可能是用户名已存在。");
            }
        }
    };

    const handleChangePassword = () => {
        const oldPass = prompt("请输入旧密码：");
        if (!oldPass) return;
        
        const newPass = prompt("请输入新密码：");
        if (!newPass) return;

        const confirmPass = prompt("请再次输入新密码：");
        if (newPass !== confirmPass) {
            alert("两次输入的密码不一致！");
            return;
        }

        if (updatePassword(oldPass, newPass)) {
            alert("密码修改成功！");
        } else {
            alert("修改失败，旧密码错误。");
        }
    };

    return (
    <div className="h-full bg-slate-950 flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 pb-12 rounded-b-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            
            <div className="flex flex-col items-center mt-4">
                <div className="w-24 h-24 bg-slate-800 rounded-full border-4 border-slate-700 flex items-center justify-center shadow-xl mb-4">
                    <User size={48} className="text-slate-500" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-white tracking-wide">训练家 {currentUser?.username || '小赤'}</h1>
                    <button 
                        onClick={handleRename}
                        className="p-1.5 bg-slate-800 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    >
                        <Pencil size={14} />
                    </button>
                </div>
                <p className="text-indigo-200 text-sm">ID: {currentUser?.id.slice(0, 8) || '00000000'}</p>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="px-6 -mt-8 relative z-10 space-y-6 pb-8">
            <div className="bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-700 space-y-6">
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 p-4 rounded-xl">
                        <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                            <Clock size={12} /> 游戏时间
                        </div>
                        <div className="text-xl font-mono text-white">{playTimeMinutes} <span className="text-sm text-slate-500">分</span></div>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-xl">
                        <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                            <Star size={12} /> 图鉴收集
                        </div>
                        <div className="text-xl font-mono text-white">5 <span className="text-sm text-slate-500">只</span></div>
                    </div>
                </div>

                <div>
                    <div className="flex items-center gap-2 text-slate-300 font-bold mb-3 text-sm">
                        <Award size={16} className="text-amber-400" /> 
                        获得徽章 ({badges.length})
                    </div>
                    {badges.length === 0 ? (
                        <div className="bg-slate-900/80 rounded-xl p-4 h-24 flex items-center justify-center text-slate-600 text-xs italic border border-slate-800 border-dashed">
                            尚未获得任何徽章
                        </div>
                    ) : (
                        <div className="bg-slate-900/80 rounded-xl p-4 flex flex-wrap gap-2 border border-slate-800">
                            {allGyms.map(gym => {
                                const hasBadge = badges.includes(gym.badgeId);
                                return (
                                    <div key={gym.badgeId} className={`flex flex-col items-center gap-1 w-16 ${hasBadge ? 'opacity-100' : 'opacity-30 grayscale'}`}>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${hasBadge ? 'border-amber-400 bg-amber-400/20 text-amber-300' : 'border-slate-700 bg-slate-800 text-slate-600'}`}>
                                            <Award size={20} />
                                        </div>
                                        <span className="text-[10px] text-slate-400 text-center leading-tight">{gym.badgeName}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                
                <div className="pt-4 border-t border-slate-700">
                     <div className="flex justify-between items-center text-sm">
                         <span className="text-slate-400">持有金钱</span>
                         <span className="font-mono font-bold text-emerald-400">¥ {playerMoney}</span>
                     </div>
                </div>

            </div>

              <div className="text-center space-y-3">
                  <button className="text-xs text-slate-500 hover:text-slate-300 underline">
                      游戏设置
                  </button>
                  <div className="flex justify-center gap-4">
                     <button
                        onClick={handleChangePassword}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 text-sm font-medium transition-all"
                    >
                        <Key size={16} />
                        修改密码
                    </button>
                    <button
                        onClick={() => {
                            logout();
                            setView('LOGIN');
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:text-red-300 text-sm font-medium transition-all"
                    >
                        <LogOut size={16} />
                        退出登录
                    </button>
                  </div>
             </div>
        </div>
    </div>
  );
};

export default ProfileView;