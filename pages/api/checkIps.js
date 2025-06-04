import axios from 'axios';

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { ips } = req.body;
  const results = [];

  const vtApiKey = process.env.VIRUSTOTAL_API_KEY;
  const abuseApiKey = process.env.ABUSEIPDB_API_KEY;

  for (let ip of ips) {
    try {
      // VIRUSTOTAL API
      const vt = await axios.get(`https://www.virustotal.com/api/v3/ip_addresses/${ip}`, {
        headers: { 'x-apikey': vtApiKey },
      });

      // ABUSEIPDB API
      const abuse = await axios.get('https://api.abuseipdb.com/api/v2/check', {
        params: { ipAddress: ip, maxAgeInDays: 90 },
        headers: {
          Key: abuseApiKey,
          Accept: 'application/json',
        },
      });

      results.push({
        ip,
        vt_score: vt.data.data.attributes.last_analysis_stats.malicious,
        abuse_confidence: abuse.data.data.abuseConfidenceScore,
        isp: abuse.data.data.isp,
        country: abuse.data.data.countryCode,
      });

      // Respect rate limits
      await sleep(15000); // 15 seconds between requests
    } catch (err) {
      results.push({
        ip,
        error: 'API call failed or IP not found',
      });
    }
  }

  return res.status(200).json({ results });
}
