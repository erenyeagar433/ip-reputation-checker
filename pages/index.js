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
    link.click
