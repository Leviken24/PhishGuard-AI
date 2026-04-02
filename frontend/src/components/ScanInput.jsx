import React, { useState } from 'react';
import { Search, Mail, Link as LinkIcon, Loader2 } from 'lucide-react';

export default function ScanInput({ mode, onScan, isScanning }) {
  const [inputVal, setInputVal] = useState('');

  const demos = {
    URL: [
      { label: "Safe Google", val: "https://www.google.com" },
      { label: "Susp Bitly", val: "https://bit.ly/3xK9pQ2" },
      { label: "Phish Paypal", val: "http://paypa1-secure-login.xyz/verify?user=true" }
    ],
    EMAIL: [
      { label: "Safe Slack", val: "Hi team, the Monday standup is moved to 10am. See you then. -- Priya" },
      { label: "Phish Bank", val: "Your account has been suspended. Click here immediately to verify your identity or lose access within 24 hours. Login: http://secure-bankofamerica.tk/verify" }
    ]
  };

  const handleDemoClick = (val) => setInputVal(val);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputVal.trim()) onScan(inputVal);
  };

  return (
    <div className="glass-panel p-6 shadow-2xl relative z-10 transition-all duration-300">
      <form onSubmit={handleSubmit} className="relative">
        <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300 flex items-center gap-2">
          {mode === 'URL' ? <LinkIcon className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
          {mode === 'URL' ? 'Enter suspicious URL:' : 'Paste email content:'}
        </label>
        
        {mode === 'URL' ? (
          <input 
            type="text" 
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            disabled={isScanning}
            className="w-full bg-slate-50/70 dark:bg-black/50 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-base shadow-inner focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
            placeholder="https://example.com/login"
          />
        ) : (
          <textarea
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            disabled={isScanning}
            className="w-full bg-slate-50/70 dark:bg-black/50 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-base shadow-inner focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[120px] placeholder:text-slate-400"
            placeholder="Paste raw email text here..."
          />
        )}

        <button 
          type="submit" 
          disabled={!inputVal.trim() || isScanning}
          className="mt-6 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg ring-1 ring-white/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:scale-[1.01]"
        >
          {isScanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          {isScanning ? 'Analyzing directly via Gemini AI...' : 'Scan Now'}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-200/50 dark:border-slate-800/50">
        <p className="text-xs text-slate-500 uppercase font-semibold mb-3 tracking-wider">Try a realistic demo:</p>
        <div className="flex flex-wrap gap-2">
          {demos[mode].map((d, i) => (
            <button 
              key={i} 
              onClick={() => handleDemoClick(d.val)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-semibold shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
