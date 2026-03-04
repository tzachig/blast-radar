'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import * as d3 from 'd3';
import { generateMockBlastData, BlastData } from '@/lib/mockData';

export default function Results() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const identity = searchParams.get('identity') || '';
  
  const [blastData, setBlastData] = useState<BlastData | null>(null);
  const [narrative, setNarrative] = useState('');
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!identity) {
      router.push('/');
      return;
    }

    const fetchAnalysis = async () => {
      // Generate mock data
      const data = generateMockBlastData(identity);
      setBlastData(data);

      // Get AI analysis
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identity, nodes: data.nodes, riskScore: data.riskScore }),
        });

        const analysis = await response.json();
        setNarrative(analysis.narrative || 'Analysis generated');
        setRecommendations(analysis.recommendations || []);
      } catch (error) {
        console.error('Error fetching analysis:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [identity, router]);

  useEffect(() => {
    if (!blastData || !svgRef.current) return;

    // D3 Force-directed graph
    const width = 600;
    const height = 500;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    svg.selectAll('*').remove();

    const simulation = d3.forceSimulation(blastData.nodes as any)
      .force('link', d3.forceLink(blastData.edges).id((d: any) => d.id).distance(80))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.append('g')
      .selectAll('line')
      .data(blastData.edges)
      .join('line')
      .attr('stroke', (d: any) => {
        if (d.type === 'direct') return '#ef4444';
        if (d.type === 'lateral') return '#f97316';
        return '#eab308';
      })
      .attr('stroke-width', 2)
      .attr('opacity', 0.6);

    const node = svg.append('g')
      .selectAll('circle')
      .data(blastData.nodes)
      .join('circle')
      .attr('r', (d: any) => (d.type === 'compromised' ? 20 : 12))
      .attr('fill', (d: any) => {
        if (d.type === 'compromised') return '#dc2626';
        if (d.type === 'sensitive') return '#dc2626';
        if (d.type === 'lateral') return '#f97316';
        return '#eab308';
      })
      .attr('opacity', 0.8)
      .call(d3.drag<any, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);

    const labels = svg.append('g')
      .selectAll('text')
      .data(blastData.nodes)
      .join('text')
      .attr('font-size', 10)
      .attr('fill', 'white')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.3em')
      .text((d: any) => d.label.split('/').pop().substring(0, 8));

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);

      labels
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y);
    });

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  }, [blastData]);

  if (!identity) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blast-dark via-blast-navy to-black text-white">
      {/* Header */}
      <header className="bg-black/50 border-b border-red-500/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            BlastRadar Results
          </h1>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition"
          >
            ← New Analysis
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">⚙️</div>
            <p className="text-xl text-gray-400 animate-pulse">Analyzing blast radius...</p>
          </div>
        ) : blastData ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Graph */}
            <div className="lg:col-span-2">
              <div className="bg-blast-navy border border-red-500/20 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Blast Radius Map</h2>
                <svg ref={svgRef} className="w-full border border-red-500/10 rounded" />
                <div className="mt-4 grid grid-cols-4 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-600 rounded-full" />
                    <span>Sensitive Data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full" />
                    <span>Lateral Movement</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <span>Peer Access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <span>Compromised</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Analysis */}
            <div className="space-y-6">
              {/* Risk Score */}
              <div className="bg-blast-navy border border-red-500/20 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4">Risk Score</h3>
                <div className="flex items-center justify-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        fill="none"
                        stroke="rgba(239, 68, 68, 0.2)"
                        strokeWidth="8"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        strokeDasharray={`${(blastData.riskScore / 100) * 351} 351`}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#ef4444" />
                          <stop offset="100%" stopColor="#f97316" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold">{blastData.riskScore}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Narrative */}
              <div className="bg-blast-navy border border-red-500/20 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-3">Analysis Summary</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{narrative}</p>
              </div>

              {/* Recommendations */}
              <div className="bg-blast-navy border border-orange-500/20 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-3">Remediation Steps</h3>
                <ol className="space-y-2">
                  {recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-gray-300 flex gap-3">
                      <span className="font-bold text-orange-500">{i + 1}.</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
