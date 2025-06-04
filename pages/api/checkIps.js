import axios from 'axios';
import countries from 'i18n-iso-countries';

// Register English locale for country names
countries.registerLocale(require('i18n-iso-countries/langs/en.json'));

// Delay for 15s between API calls (4/min limit)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { ips } = req.body;

  if (!Array.isArray(ips) || ips.length === 0) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const VT_API_KEY = process.env.VIRUSTOTAL_API_KEY;
  const ABUSE_API_KEY = process.env.ABUSEIPDB_API_KEY;

  const results = [];

  for (let i = 0; i < ips.length; i++) {
    const ip = ips[i];
    console.log(`Processing IP: ${ip}`);

    try {
      // === VirusTotal API Call ===
      const vtResponse = await axios.get(`https://www.virustotal.com/api/v3/ip_addresses/${ip}`, {
        headers: {
          'x-apikey': VT_API_KEY,
        },
      });

      const analysisResults = vtResponse.data.data.attributes.last_analysis_results;
      let maliciousCount = 0;
      let totalEngines = 0;

      for (const engine in analysisResults) {
        totalEngines++;
        if (analysisResults[engine].category === 'malicious') {
          maliciousCount++;
        }
      }

      // Format: e.g. "8/94"
      const vtScore = `${maliciousCount}/${totalEngines}`;
      await delay(15000); // 15s wait to avoid VT rate limit

      // === AbuseIPDB API Call ===
      const abuseResponse = await axios.get(`https://api.abuseipdb.com/api/v2/check`, {
        params: {
          ipAddress: ip,
          maxAgeInDays: 90,
        },
        headers: {
          Key: ABUSE_API_KEY,
          Accept: 'application/json',
        },
      });

      const abuseData = abuseResponse.data.data;

      // Get full country name from country code
      const countryFull = countries.getName(abuseData.countryCode, "en") || abuseData.countryCode;
      const abuseConfidence = `${abuseData.abuseConfidenceScore}%`;

      results.push({
        ip,
        vt_score: vtScore,
        abuse_confidence: abuseConfidence,
        isp: abuseData.isp,
        country: countryFull,
      });

      await delay(15000); // wait before next IP
    } catch (error) {
      console.error(`Error checking IP ${ip}:`, error.message);
      results.push({
        ip,
        error: 'Failed to fetch data from one or both APIs.',
      });
    }
  }

  res.status(200).json({ results });
}
