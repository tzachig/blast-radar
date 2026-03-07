'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as d3 from 'd3';
import { generateMockAttacks, getAttackStats, Attack } from '@/lib/attackData';

export default function AttackMapContent() {
  const router = useRouter();
  const [attacks, setAttacks] = useState<Attack[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedAttack, setSelectedAttack] = useState<Attack | null>(null);

  useEffect(() => {
    const attackData = generateMockAttacks(24);
    setAttacks(attackData);
    setStats(getAttackStats(attackData));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!attacks.length || !svgRef.current) return;

    const width = 1000;
    const height = 600;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Background
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#0a0e27');

    const g = svg.append('g');

    // Grid lines
    g.append('g')
      .attr('stroke', 'rgba(239, 68, 68, 0.1)')
      .attr('stroke-width', 1)
      .selectAll('line')
      .data(d3.range(-180, 180, 30))
      .join('line')
      .attr('x1', (d) => ((d + 180) / 360) * width)
      .attr('x2', (d) => ((d + 180) / 360) * width)
      .attr('y1', 0)
      .attr('y2', height);

    // Attack points with animation
    const points = g.selectAll('circle')
      .data(attacks)
      .join('circle')
      .attr('cx', (d) => ((d.longitude + 180) / 360) * width)
      .attr('cy', (d) => ((90 - d.latitude) / 180) * height)
      .attr('r', 0)
      .attr('fill', (d) => {
        if (d.severity === 'critical') return '#dc2626';
        if (d.severity === 'high') return '#f97316';
        if (d.severity === 'medium') return '#eab308';
        return '#6366f1';
      })
      .attr('opacity', 0.7)
      .style('cursor', 'pointer')
      .on('click', (event, d) => setSelectedAttack(d))
      .on('mouseover', function() {
        d3.select(this).attr('r', 8).attr('opacity', 1);
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .attr('r', 5)
          .attr('opacity', 0.7);
      });

    // Animate in
    points.transition()
      .duration(1000)
      .attr('r', 5);

    // Pulse animation for critical attacks
    points.filter((d) => d.severity === 'critical')
      .append('circle')
      .attr('cx', (d) => ((d.longitude + 180) / 360) * width)
      .attr('cy', (d) => ((90 - d.latitude) / 180) * height)
      .attr('r', 5)
      .attr('fill', 'none')
      .attr('stroke', '#dc2626')
      .attr('stroke-width', 2)
      .attr('opacity', 0.8)
      .transition()
      .duration(2000)
      .attr('r', 15)
      .attr('opacity', 0)
      .repeat(true);

    // Connecting lines from attacks to center
    const now = Date.now();
    const recentAttacks = attacks.filter((a) => now - a.timestamp < 3600000); // Last hour

    g.selectAll('line.attack-line')
      .data(recentAttacks.slice(0, 10))
      .join('line')
      .attr('class', 'attack-line')
      .attr('x1', (d) => ((d.longitude + 180) / 360) * width)
      .attr('y1', (d) => ((90 - d.latitude) / 180) * height)
      .attr('x2', width / 2)
      .attr('y2', height / 2)
      .attr('stroke', (d) => {
        if (d.severity === 'critical') return '#dc2626';
        if (d.severity === 'high') return '#f97316';
        return '#eab308';
      })
      .attr('stroke-width', 1)
      .attr('opacity', 0.3)
      .attr('stroke-dasharray', '5,5');
  }, [attacks]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blast-dark via-blast-navy to-black text-white">
      {/* Header */}
      <header className="bg-black/50 border-b border-red-500/20 sticky top-0 z-10">
        <div className="max-w-full mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            🌍 Global Attack Map - Last 24 Hours
          </h1>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition"
          >
            ← Home
          </button>
        </div>
      </header>

      <main className="max-w-full mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map */}
          <div className="lg:col-span-3">
            <div className="bg-blast-navy border border-red-500/20 rounded-lg p-6">
              <h2 className="text-lg font-bold mb-4">Attack Origins</h2>
              <svg
                ref={svgRef}
                width="100%"
                height="600"
                className="border border-red-500/10 rounded bg-blast-dark"
              />
              <div className="mt-4 flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-600 rounded-full" />
                  <span>Critical</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full" />
                  <span>High</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <span>Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full" />
                  <span>Low</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Total Attacks */}
            <div className="bg-blast-navy border border-red-500/20 rounded-lg p-6">
              <h3 className="text-sm font-bold text-gray-400 mb-2">Total Attacks</h3>
              <p className="text-4xl font-bold text-red-500">{attacks.length}</p>
              <p className="text-xs text-gray-400 mt-1">Last 24 hours</p>
            </div>

            {/* Top Countries */}
            <div className="bg-blast-navy border border-red-500/20 rounded-lg p-6">
              <h3 className="text-sm font-bold mb-3">Top Source Countries</h3>
              <div className="space-y-2">
                {stats && Object.entries(stats.byCountry)
                  .sort((a, b) => (b[1] as number) - (a[1] as number))
                  .slice(0, 5)
                  .map(([country, count]) => (
                    <div key={country} className="flex justify-between items-center text-sm">
                      <span>{country}</span>
                      <span className="font-bold text-red-500">{count}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* By Severity */}
            <div className="bg-blast-navy border border-orange-500/20 rounded-lg p-6">
              <h3 className="text-sm font-bold mb-3">By Severity</h3>
              <div className="space-y-2">
                {stats && Object.entries(stats.bySeverity)
                  .sort((a, b) => (b[1] as number) - (a[1] as number))
                  .map(([severity, count]) => (
                    <div key={severity} className="flex justify-between items-center text-sm">
                      <span className="capitalize">{severity}</span>
                      <span className="font-bold">{count}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Selected Attack */}
            {selectedAttack && (
              <div className="bg-blast-navy border border-yellow-500/20 rounded-lg p-6">
                <h3 className="text-sm font-bold mb-3">Attack Details</h3>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-gray-400">Type:</span>
                    <p className="font-bold">{selectedAttack.attackType}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Location:</span>
                    <p className="font-bold">{selectedAttack.sourceCity}, {selectedAttack.sourceCountry}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Target:</span>
                    <p className="font-bold">{selectedAttack.targetSystem}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Severity:</span>
                    <p className="font-bold capitalize text-red-500">{selectedAttack.severity}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Source IP:</span>
                    <p className="font-mono text-xs">{selectedAttack.sourceIP}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Attacks List */}
        <div className="mt-8 bg-blast-navy border border-red-500/20 rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">Recent Attacks</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-red-500/20">
                  <th className="text-left py-2 px-4">Time</th>
                  <th className="text-left py-2 px-4">Type</th>
                  <th className="text-left py-2 px-4">Source</th>
                  <th className="text-left py-2 px-4">Target</th>
                  <th className="text-left py-2 px-4">Severity</th>
                </tr>
              </thead>
              <tbody>
                {attacks.slice(0, 10).map((attack) => (
                  <tr key={attack.id} className="border-b border-red-500/10 hover:bg-red-500/10">
                    <td className="py-2 px-4 text-xs text-gray-400">
                      {new Date(attack.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2 px-4">{attack.attackType}</td>
                    <td className="py-2 px-4">{attack.sourceCity}</td>
                    <td className="py-2 px-4">{attack.targetSystem}</td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        attack.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                        attack.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        attack.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-indigo-500/20 text-indigo-400'
                      }`}>
                        {attack.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
