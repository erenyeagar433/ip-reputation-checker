
import { useState } from 'react';
import axios from 'axios';
import Papa from 'papaparse';

export default function Home() {
  const [ipInput, setIpInput] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const ips = ipInput
      .split('\n')
      .map(ip => ip.trim())
      .filter(ip => ip.length > 0);

    if (ips.length === 0) return alert('Please enter at least one IP.');

    setLoading(true);
    const res = await axios.post('/api/checkIps', { ips });
    setResults(res.data.results);
    setLoading(false);
  };

  const downloadCSV = () => {
    const csv = Papa.unparse(results);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'ip_reputation.csv';
    link.click();
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'ip_reputation.json';
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-75"></div>
              <div className="relative p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-4">
            IP Reputation Bulk Checker
          </h1>
          <p className="text-slate-400 text-xl">
            Advanced threat intelligence and reputation analysis platform
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 mb-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-white">Enter IP Addresses</h2>
          </div>
          
          <div className="relative mb-6">
            <textarea
              rows={12}
              placeholder="Enter one IP address per line&#10;Example:&#10;8.8.8.8&#10;1.1.1.1&#10;192.168.1.1"
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 rounded-xl p-6 font-mono text-lg resize-none outline-none transition-all duration-200"
            />
            <div className="absolute top-4 right-4 text-slate-500 text-sm bg-slate-700/50 px-3 py-1 rounded-lg">
              {ipInput.split('\n').filter(ip => ip.trim().length > 0).length} IPs
            </div>
          </div>
          
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 hover:scale-105 disabled:scale-100 flex items-center gap-3 text-lg shadow-lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Checking...
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Check Reputation
              </>
            )}
          </button>
        </div>

        {/* Results Section */}
        {results.length > 0 && (
          <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-8 border-b border-slate-700/50">
              <div className="flex items-center gap-3 mb-4 sm:mb-0">
                <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-2xl font-bold text-white">
                  Results ({results.length} IPs analyzed)
                </h2>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={downloadCSV}
                  className="border border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download CSV
                </button>
                <button
                  onClick={downloadJSON}
                  className="border border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Download JSON
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50 bg-slate-800/30">
                    <th className="text-left py-4 px-6 text-slate-300 font-semibold">IP</th>
                    <th className="text-left py-4 px-6 text-slate-300 font-semibold">VirusTotal Malicious</th>
                    <th className="text-left py-4 px-6 text-slate-300 font-semibold">AbuseIPDB Confidence</th>
                    <th className="text-left py-4 px-6 text-slate-300 font-semibold">ISP</th>
                    <th className="text-left py-4 px-6 text-slate-300 font-semibold">Country</th>
                    <th className="text-left py-4 px-6 text-slate-300 font-semibold">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((res, idx) => (
                    <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors duration-200">
                      <td className="py-4 px-6">
                        <code className="text-blue-300 bg-slate-800/50 px-3 py-2 rounded-lg text-sm font-mono border border-blue-900/30">
                          {res.ip}
                        </code>
                      </td>
                      <td className="py-4 px-6 text-slate-300 font-mono">
                        {res.vt_score ?? <span className="text-slate-500">—</span>}
                      </td>
                      <td className="py-4 px-6 text-slate-300 font-mono">
                        {res.abuse_confidence ?? <span className="text-slate-500">—</span>}
                      </td>
                      <td className="py-4 px-6 text-slate-300">
                        {res.isp ?? <span className="text-slate-500">—</span>}
                      </td>
                      <td className="py-4 px-6 text-slate-300">
                        {res.country ?? <span className="text-slate-500">—</span>}
                      </td>
                      <td className="py-4 px-6">
                        {res.error ? (
                          <span className="text-red-400 text-sm">{res.error}</span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
