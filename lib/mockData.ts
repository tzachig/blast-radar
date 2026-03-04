export interface GraphNode {
  id: string;
  label: string;
  type: 'compromised' | 'sensitive' | 'lateral' | 'peer';
  risk: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: 'direct' | 'lateral' | 'peer';
}

export interface BlastData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  riskScore: number;
  compromisedIdentity: string;
}

const lateralSystems = [
  'dev-server-01',
  'prod-database-primary',
  'backup-server',
  'ci-cd-pipeline',
  'monitoring-stack',
  'auth-service',
  'api-gateway',
  'cache-cluster',
];

const peerAccounts = [
  'sarah.johnson@company.com',
  'mike.chen@company.com',
  'alex.torres@company.com',
  'jessica.lee@company.com',
];

export function generateMockBlastData(identity: string): BlastData {
  const nodes: GraphNode[] = [
    {
      id: 'compromised',
      label: `🔴 ${identity}`,
      type: 'compromised',
      risk: 100,
    },
  ];

  const edges: GraphEdge[] = [];

  // Enhanced realistic folder structure
  const enhancedFolders = [
    '/Finance/Q4-2024-Budgets',
    '/Finance/Executive-Salaries',
    '/HR/Employee-Records',
    '/HR/Background-Checks',
    '/Legal/Contracts-NDAs',
    '/Legal/Litigation-Files',
    '/Engineering/API-Keys-Vault',
    '/Engineering/Database-Credentials',
    '/Security/Incident-Reports',
    '/Security/Penetration-Tests',
    '/Executive/Board-Minutes',
    '/Executive/M&A-Strategy',
    '/Customer-Data/PII-Database',
    '/Customer-Data/Payment-Records',
    '/Operations/Server-Configs',
    '/Operations/Backup-Keys',
    '/Marketing/Customer-Lists',
    '/R&D/Product-Roadmap',
  ];

  // Add sensitive data nodes (8-10 folders)
  const numSensitive = 8 + Math.floor(Math.random() * 3);
  for (let i = 0; i < numSensitive; i++) {
    const folder = enhancedFolders[i % enhancedFolders.length];
    nodes.push({
      id: `sensitive-${i}`,
      label: `🔴 ${folder}`,
      type: 'sensitive',
      risk: 85 + Math.random() * 15,
    });
    edges.push({
      source: 'compromised',
      target: `sensitive-${i}`,
      type: 'direct',
    });
  }

  // Add lateral movement systems (6-8 systems)
  const numLateral = 6 + Math.floor(Math.random() * 3);
  for (let i = 0; i < numLateral; i++) {
    const system = lateralSystems[i % lateralSystems.length];
    nodes.push({
      id: `lateral-${i}`,
      label: `🟠 ${system}`,
      type: 'lateral',
      risk: 60 + Math.random() * 25,
    });
    edges.push({
      source: 'compromised',
      target: `lateral-${i}`,
      type: 'lateral',
    });

    // Add inter-system connections
    if (i > 0) {
      edges.push({
        source: `lateral-${i - 1}`,
        target: `lateral-${i}`,
        type: 'lateral',
      });
    }
  }

  // Add peer accounts (3-4 peers)
  const numPeers = 3 + Math.floor(Math.random() * 2);
  for (let i = 0; i < numPeers; i++) {
    const peer = peerAccounts[i % peerAccounts.length];
    nodes.push({
      id: `peer-${i}`,
      label: `🟡 ${peer}`,
      type: 'peer',
      risk: 40 + Math.random() * 30,
    });
    edges.push({
      source: 'compromised',
      target: `peer-${i}`,
      type: 'peer',
    });
  }

  // Calculate overall risk score
  const avgRisk = nodes.reduce((sum, n) => sum + n.risk, 0) / nodes.length;
  const riskScore = Math.round(Math.min(100, avgRisk * 1.2));

  return {
    nodes,
    edges,
    riskScore,
    compromisedIdentity: identity,
  };
}
