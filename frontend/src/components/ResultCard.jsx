import React from 'react';
import ConfidenceMeter from './ConfidenceMeter';
import VerdictBadge from './VerdictBadge';

export default function ResultCard({ result }) {
  if (!result) return null;

  const { verdict, confidence_score, risk_factors, safe_signals, explanation } = result;

  return (
    <div className="glass-panel p-6 mt-8 animate-fade-in-scale">
      <div className="flex flex-col md:flex-row items-center justify-between border-b border-border pb-6 mb-6 gap-6">
        <div className="flex items-center gap-6">
          <ConfidenceMeter score={confidence_score} verdict={verdict} />
          <div>
            <h2 className="text-sm text-slate-500 uppercase tracking-widest font-semibold mb-2">AI Verdict</h2>
            <VerdictBadge verdict={verdict} />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-bold text-lg mb-4 text-red-600 dark:text-red-400">🚨 Risk Factors</h3>
          {risk_factors && risk_factors.length > 0 ? (
            <ul className="space-y-2">
              {risk_factors.map((factor, idx) => (
                <li key={idx} className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 py-1.5 px-3 rounded-lg text-sm border border-red-100 dark:border-red-900/50 shadow-sm leading-snug">
                  {factor}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 text-sm italic">No significant risk factors flagged.</p>
          )}

          <h3 className="font-bold text-lg mt-6 mb-4 text-green-600 dark:text-green-400">✅ Safe Signals</h3>
          {safe_signals && safe_signals.length > 0 ? (
            <ul className="space-y-2">
              {safe_signals.map((signal, idx) => (
                <li key={idx} className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 py-1.5 px-3 rounded-lg text-sm border border-green-100 dark:border-green-900/50 shadow-sm leading-snug">
                  {signal}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 text-sm italic">No strong safe signals detected.</p>
          )}
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-inner h-full">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 p-1 rounded">🧠</span> AI Explanation
          </h3>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            {explanation}
          </p>
        </div>
      </div>
    </div>
  );
}
