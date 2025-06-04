import axios from 'axios';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { ips } = req.body;

  if (!ips || !Array.isArray(ips) || ips.length === 0) {
    return res.status(400).json({ error: 'Please provide an array of IP addresses in the request body.' });
  }

  const vtApiKey = process.env.VIRUSTOTAL_API_KEY;
  const abuseApiKey = process.env.ABUSEIPDB_API_KEY;

  if (!vtApiKey || !abuseApiKey) {
    return res.status(500).json({ error: 'API keys not configured in environment variables.' });
  }

  const results = [];

  for (let ip of ips) {
    try {
      // VirusTotal API call
      const vtResponse = await axios.get(`https://www.virustotal.com/api/v3/ip_addresses/${ip}`, {
        headers: {
          'x-apikey': vtApiKey,
        },
      });

      // Log full VirusTotal raw response for debugging
      console.log(`VirusTotal response for ${ip}:\n`, JSON.stringify(vtResponse.data, null, 2));

      // AbuseIPDB API call
      const abuseResponse = await axios.get('https://api.abuseipdb.com/api/v2/check', {
        params: {
          ipAddress: ip,
          maxAgeInDays: 90,
        },
        headers: {
          Key: abuseApiKey,
          Accept: 'application/json',
        },
      });

      // Log full AbuseIPDB raw response for debugging
      console.log(`AbuseIPDB response for ${ip}:\n`, JSON.stringify(abuseResponse.data, null, 2));

      // Extract needed fields
      const vtScore = vtResponse.data.data.attributes.last_analysis_stats.malicious;
      const abuseConfidence = abuseResponse.data.data.abuseConfidenceScore;
      const isp = abuseResponse.data.data.isp;
      const country = abuseResponse.data.data.countryCode;

      results.push({
        ip,
        vt_score: vtScore,
        abuse_confidence: abuseConfidence,
        isp,
        country,
      });

      // Rate limit delay: 15 seconds to keep under 4 calls per minute limit
      await sleep(15000);

    } catch (error) {
      console.error(`Error fetching data for IP ${ip}:`, error.message);

      results.push({
        ip,
        error: 'API call failed or IP not found',
      });
    }
  }

  return res.status(200).json({ results });
}
