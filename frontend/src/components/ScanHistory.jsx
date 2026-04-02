import React from 'react';
import { Download } from 'lucide-react';

export default function ScanHistory({ history }) {
  if (!history || history.length === 0) return null;

  const exportCSV = () => {
    const headers = ['Timestamp', 'Type', 'Target', 'Verdict', 'Confidence'];
    const rows = history.map(item => [
      new Date(item.timestamp).toISOString(),
      item.type,
      `"${item.input.replace(/"/g, '""')}"`,
      item.result.verdict,
      item.result.confidence_score
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "phishguard_scan_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-panel p-6 mt-12 animate-fade-in-scale" style={{ animationDelay: '0.1s' }}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-xl flex items-center gap-2">
          🕒 Recent Scans
        </h3>
        <button 
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase text-xs tracking-wider">
              <th className="py-3 px-4 w-28">Verdict</th>
              <th className="py-3 px-4">Target</th>
              <th className="py-3 px-4 text-center w-24">Score</th>
              <th className="py-3 px-4 text-right w-32">Time</th>
            </tr>
          </thead>
          <tbody>
            {history.map((scan, idx) => (
              <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                <td className="py-3 px-4">
                  <div className={`text-xs font-bold px-2 py-1 inline-block rounded border ${
                    scan.result.verdict === 'SAFE' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:border-green-800' :
                    scan.result.verdict === 'SUSPICIOUS' ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800' :
                    'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:border-red-800'
                  }`}>
                    {scan.result.verdict}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="max-w-[150px] sm:max-w-[300px] md:max-w-[400px] truncate text-sm font-mono text-slate-700 dark:text-slate-300" title={scan.input}>
                    <span className="mr-2">{scan.type === 'EMAIL' ? '📨' : '🔗'}</span>
                    {scan.input}
                  </div>
                </td>
                <td className="py-3 px-4 text-center font-bold text-sm">
                  {scan.result.confidence_score}%
                </td>
                <td className="py-3 px-4 text-right text-xs text-slate-500">
                  {new Date(scan.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
