import React, { useState, useEffect } from 'react';
import ScanInput from './components/ScanInput';
import ResultCard from './components/ResultCard';
import ScanHistory from './components/ScanHistory';
import { Moon, Sun, Shield } from 'lucide-react';

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [mode, setMode] = useState('URL');
  const [isScanning, setIsScanning] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('scanHistory')) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Persist history
  useEffect(() => {
    localStorage.setItem('scanHistory', JSON.stringify(history));
  }, [history]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const API_URL = 'http://127.0.0.1:8000'; // Make sure uvicorn runs on default port

  const handleScan = async (inputVal) => {
    setIsScanning(true);
    setCurrentResult(null);
    
    const endpoint = mode === 'URL' ? '/analyze/url' : '/analyze/email';
    const payload = mode === 'URL' ? { url: inputVal } : { email_text: inputVal };

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        throw new Error(await res.text());
      }
      
      const data = await res.json();
      setCurrentResult(data);
      
      // Update history top-5
      setHistory(prev => {
        const newEntry = { timestamp: Date.now(), type: mode, input: inputVal, result: data };
        return [newEntry, ...prev].slice(0, 5);
      });

    } catch (err) {
      console.error(err);
      alert("Failed to analyze. Ensure backend is running and Gemini API key is set.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen relative font-sans text-slate-900 dark:text-slate-100 overflow-hidden pb-20">
      
      {/* Background blobs for premium dynamic look */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/20 dark:bg-blue-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/20 dark:bg-purple-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '10s' }}></div>

      <div className="max-w-4xl mx-auto px-4 pt-12 relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                PhishGuard AI
              </h1>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Explainable Phishing Detection</p>
            </div>
          </div>
          
          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-full bg-white/50 hover:bg-white dark:bg-black/40 dark:hover:bg-black/60 shadow-sm border border-slate-200 dark:border-slate-800 transition-all backdrop-blur"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
          </button>
        </header>

        <main>
          {/* Mode Toggle */}
          <div className="flex justify-center mb-8">
            <div className="glass-panel p-1 inline-flex rounded-xl shadow-sm max-w-sm w-full">
              <button 
                onClick={() => setMode('URL')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  mode === 'URL' ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Analyze URL
              </button>
              <button 
                onClick={() => setMode('EMAIL')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  mode === 'EMAIL' ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Analyze Email
              </button>
            </div>
          </div>

          <ScanInput mode={mode} onScan={handleScan} isScanning={isScanning} />
          
          <ResultCard result={currentResult} />
          
          <ScanHistory history={history} />
          
        </main>
      </div>
    </div>
  );
}

export default App;
