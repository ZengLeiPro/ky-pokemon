import React from 'react';
import type { Weather } from '@shared/types';

interface BattleWeatherProps {
  weather: Weather;
}

const RAIN_PATTERN = `url("data:image/svg+xml,%3Csvg width='20' height='30' viewBox='0 0 20 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cline x1='10' y1='0' x2='8' y2='14' stroke='%2390caf9' stroke-width='1.5' stroke-opacity='0.5'/%3E%3C/svg%3E")`;

const HAIL_PATTERN = `radial-gradient(circle 2px, rgba(255,255,255,0.7) 0%, transparent 100%)`;

const BattleWeather: React.FC<BattleWeatherProps> = ({ weather }) => {
  if (weather === 'None') return null;

  switch (weather) {
    case 'Rain':
      return (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          {/* 蓝色滤镜 */}
          <div className="absolute inset-0 bg-blue-900/15" />
          {/* 雨滴 */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: RAIN_PATTERN,
              backgroundSize: '20px 30px',
              animation: 'battle-rain 0.4s linear infinite',
            }}
          />
          {/* 第二层雨滴（更密、更淡） */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: RAIN_PATTERN,
              backgroundSize: '15px 25px',
              animation: 'battle-rain 0.3s linear infinite',
              backgroundPosition: '7px 12px',
            }}
          />
        </div>
      );

    case 'Sunny':
      return (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          {/* 暖色调覆盖 */}
          <div
            className="absolute inset-0 mix-blend-overlay"
            style={{
              background: 'linear-gradient(135deg, rgba(255,235,59,0.15) 0%, rgba(255,152,0,0.1) 50%, transparent 100%)',
              animation: 'sun-pulse 3s ease-in-out infinite',
            }}
          />
          {/* 太阳光芒 */}
          <div
            className="absolute -top-8 -right-8 w-32 h-32 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,235,59,0.25) 0%, rgba(255,152,0,0.1) 40%, transparent 70%)',
              animation: 'sun-pulse 2s ease-in-out infinite',
            }}
          />
        </div>
      );

    case 'Sandstorm':
      return (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          {/* 沙色滤镜 */}
          <div className="absolute inset-0 bg-yellow-800/10" style={{ filter: 'sepia(0.2)' }} />
          {/* 沙粒层 */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle 1.5px, rgba(194,154,80,0.4) 0%, transparent 100%)`,
              backgroundSize: '25px 20px',
              animation: 'sandstorm-drift 1.5s linear infinite',
            }}
          />
          {/* 第二层沙粒 */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle 1px, rgba(160,120,60,0.3) 0%, transparent 100%)`,
              backgroundSize: '18px 15px',
              animation: 'sandstorm-drift 1s linear infinite reverse',
              backgroundPosition: '10px 8px',
            }}
          />
        </div>
      );

    case 'Hail':
      return (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          {/* 冷色滤镜 */}
          <div className="absolute inset-0 bg-blue-200/8" />
          {/* 冰雹 */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: HAIL_PATTERN,
              backgroundSize: '30px 30px',
              animation: 'battle-hail 0.6s linear infinite',
            }}
          />
          {/* 第二层冰雹 */}
          <div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage: HAIL_PATTERN,
              backgroundSize: '22px 22px',
              animation: 'battle-hail 0.45s linear infinite',
              backgroundPosition: '11px 8px',
            }}
          />
        </div>
      );

    default:
      return null;
  }
};

export default BattleWeather;
