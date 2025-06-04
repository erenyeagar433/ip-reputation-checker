import axios from 'axios';

// Simple rate limiter: 4 requests per minute (1 every 15 sec)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Country code to full name map
const countryMap = {
  US: 'United States',
  IN: 'India',
  NL: 'Netherlands',
  CN: 'China',
  RU: 'Russia',
  DE: 'Germany',
  FR: 'France',
  GB: 'United Kingdom',
  // Add more as needed
};

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
    console.log(`Checking IP: ${ip}`);
    try {
      // VirusTotal API call
      const vtResponse = await axios.get(`https://www.virustotal.com/api/v3/ip_addresses/${ip}`, {
        headers: {
          'x-apikey': VT_API_KEY,
        },
      });

      // Count malicious detections from all engines
      const lastResults = vtResponse.data.data.attributes.last_analysis_results;
      let maliciousCount = 0;
      for (const engine in lastResults) {
        if (lastResults[engine].category === 'malicious') {
          maliciousCount++;
        }
      }

      await delay(15000); // Wait 15 sec before AbuseIPDB call

      // AbuseIPDB API call
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

      const countryCode = abuseResponse.data.data.countryCode;
      const fullCountry = countryMap[countryCode] || countryCode;

      results.push({
        ip,
        vt_score: maliciousCount,
        abuse_confidence: abuseResponse.data.data.abuseConfidenceScore,
        isp: abuseResponse.data.data.isp,
        country: fullCountry,
      });

      await delay(15000); // Wait before next IP
    } catch (error) {
      console.error(`Error checking IP ${ip}:`, error.message);
      results.push({
        ip,
        error: 'Failed to retrieve data',
      });
    }
  }

  res.status(200).json({ results });
}
