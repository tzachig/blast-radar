export interface Attack {
  id: string;
  timestamp: number;
  sourceIP: string;
  sourceCountry: string;
  sourceCity: string;
  latitude: number;
  longitude: number;
  targetSystem: string;
  attackType: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

const attacks_data = [
  { country: 'China', city: 'Shanghai', lat: 31.2304, lng: 121.4737 },
  { country: 'Russia', city: 'Moscow', lat: 55.7558, lng: 37.6173 },
  { country: 'Iran', city: 'Tehran', lat: 35.6892, lng: 51.389 },
  { country: 'North Korea', city: 'Pyongyang', lat: 39.0392, lng: 125.7625 },
  { country: 'Vietnam', city: 'Hanoi', lat: 21.0285, lng: 105.8542 },
  { country: 'India', city: 'Mumbai', lat: 19.076, lng: 72.8777 },
  { country: 'Brazil', city: 'São Paulo', lat: -23.5505, lng: -46.6333 },
  { country: 'Nigeria', city: 'Lagos', lat: 6.4969, lng: 3.5833 },
  { country: 'Romania', city: 'Bucharest', lat: 44.4268, lng: 26.1025 },
  { country: 'Turkey', city: 'Istanbul', lat: 41.0082, lng: 28.9784 },
];

const attackTypes = [
  'DDoS Attack',
  'SQL Injection',
  'Brute Force',
  'Malware Upload',
  'Phishing Campaign',
  'Zero-Day Exploit',
  'Credential Stuffing',
  'Man-in-the-Middle',
  'Ransomware',
  'Bot Network',
];

const targetSystems = [
  'Web Server',
  'Database',
  'Email Server',
  'VPN Gateway',
  'API Endpoint',
  'DNS Server',
  'Load Balancer',
  'Firewall',
  'Router',
  'S3 Bucket',
];

export function generateMockAttacks(hours: number = 24): Attack[] {
  const attacks: Attack[] = [];
  const now = Date.now();
  const hourMs = 60 * 60 * 1000;

  // Generate 30-50 attacks in the last 24 hours
  const numAttacks = 30 + Math.floor(Math.random() * 20);

  for (let i = 0; i < numAttacks; i++) {
    const attackData = attacks_data[Math.floor(Math.random() * attacks_data.length)];
    const hourOffset = Math.random() * hours;
    const timestamp = now - hourOffset * hourMs;

    attacks.push({
      id: `attack-${i}`,
      timestamp,
      sourceIP: `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
      sourceCountry: attackData.country,
      sourceCity: attackData.city,
      latitude: attackData.lat + (Math.random() - 0.5) * 2,
      longitude: attackData.lng + (Math.random() - 0.5) * 2,
      targetSystem: targetSystems[Math.floor(Math.random() * targetSystems.length)],
      attackType: attackTypes[Math.floor(Math.random() * attackTypes.length)],
      severity: ['critical', 'high', 'medium', 'low'][Math.floor(Math.random() * 4)] as any,
    });
  }

  return attacks.sort((a, b) => b.timestamp - a.timestamp);
}

export function getAttackStats(attacks: Attack[]) {
  const byCountry: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};
  const byType: Record<string, number> = {};

  attacks.forEach(attack => {
    byCountry[attack.sourceCountry] = (byCountry[attack.sourceCountry] || 0) + 1;
    bySeverity[attack.severity] = (bySeverity[attack.severity] || 0) + 1;
    byType[attack.attackType] = (byType[attack.attackType] || 0) + 1;
  });

  return { byCountry, bySeverity, byType };
}
