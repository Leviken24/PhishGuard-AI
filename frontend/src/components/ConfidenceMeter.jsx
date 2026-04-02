import React from 'react';

export default function ConfidenceMeter({ score, verdict }) {
  const percentage = Math.min(Math.max(score, 0), 100);
  const degrees = (percentage / 100) * 360;

  const isSafe = verdict === 'SAFE';
  const isSuspicious = verdict === 'SUSPICIOUS';
  const isPhishing = verdict === 'PHISHING';

  let gradientClass = 'conic-gradient-safe';
  if (isSuspicious) gradientClass = 'conic-gradient-suspicious';
  if (isPhishing) gradientClass = 'conic-gradient-phishing';

  return (
    <div className="relative w-32 h-32 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 shadow-inner">
      {/* Outer gradient circle */}
      <div 
        className={`absolute inset-0 rounded-full ${gradientClass}`}
        style={{ '--score-deg': `${degrees}deg` }}
      ></div>
      {/* Inner cutout */}
      <div className="absolute inset-2 rounded-full bg-white dark:bg-slate-900 flex flex-col items-center justify-center shadow-lg">
        <span className="text-3xl font-black">{percentage}%</span>
        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Confidence</span>
      </div>
    </div>
  );
}
