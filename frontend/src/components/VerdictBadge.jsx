import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function VerdictBadge({ verdict, className }) {
  const cn = (...inputs) => twMerge(clsx(inputs));

  if (!verdict) return null;
  
  const isSafe = verdict === 'SAFE';
  const isSuspicious = verdict === 'SUSPICIOUS';
  const isPhishing = verdict === 'PHISHING';

  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-6 py-3 rounded-full text-lg font-bold shadow-lg uppercase tracking-wider animate-fade-in-scale",
      isSafe ? 'bg-green-100 text-green-700 border-2 border-green-500 dark:bg-green-900/30 dark:text-green-400' :
      isSuspicious ? 'bg-amber-100 text-amber-700 border-2 border-amber-500 dark:bg-amber-900/30 dark:text-amber-400' :
      isPhishing ? 'bg-red-100 text-red-700 border-2 border-red-500 dark:bg-red-900/30 dark:text-red-400' : 
      'bg-gray-200 text-gray-700',
      className
    )}>
      {isSafe && <ShieldCheck className="w-6 h-6" />}
      {isSuspicious && <AlertTriangle className="w-6 h-6" />}
      {isPhishing && <ShieldAlert className="w-6 h-6" />}
      {verdict}
    </div>
  );
}
