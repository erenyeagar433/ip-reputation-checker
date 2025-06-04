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
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>IP Reputation Bulk Checker</h1>
      <textarea
        rows="10"
        cols="50"
        placeholder="Enter one IP per line"
        value={ipInput}
        onChange={(e) => setIpInput(e.target.value)}
        style={{ width: '100%', padding: '10px' }}
      />
      <br />
      <button onClick={handleSubmit} disabled={loading} style={{ marginTop: '10px' }}>
        {loading ? 'Checking...' : 'Check Reputation'}
      </button>

      {results.length > 0 && (
        <>
          <h2>Results:</h2>
          <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th>IP</th>
                <th>VirusTotal Malicious</th>
                <th>AbuseIPDB Confidence</th>
                <th>ISP</th>
                <th>Country</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody>
              {results.map((res, idx) => (
                <tr key={idx}>
                  <td>{res.ip}</td>
                  <td>{res.vt_score ?? '—'}</td>
                  <td>{res.abuse_confidence ?? '—'}</td>
                  <td>{res.isp ?? '—'}</td>
                  <td>{res.country ?? '—'}</td>
                  <td>{res.error ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <br />
          <button onClick={downloadCSV}>Download CSV</button>
          <button onClick={downloadJSON} style={{ marginLeft: '10px' }}>
            Download JSON
          </button>
        </>
      )}
    </div>
  );
}
