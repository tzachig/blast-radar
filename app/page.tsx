'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [identity, setIdentity] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity.trim()) return;

    setLoading(true);
    try {
      // Store identity in URL params for results page
      router.push(`/results?identity=${encodeURIComponent(identity)}`);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blast-dark via-blast-navy to-black flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
            BlastRadar
          </h1>
          <p className="text-xl text-gray-400">
            Cybersecurity Blast Radius Simulator
          </p>
          <p className="text-gray-500 mt-2 text-sm">
            Analyze the potential impact of a compromised identity on your organization
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleAnalyze} className="space-y-6">
          <div>
            <label htmlFor="identity" className="block text-sm font-medium text-gray-300 mb-3">
              Enter Identity to Analyze
            </label>
            <input
              type="text"
              id="identity"
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              placeholder="e.g., john.smith@company.com or svc-backup-account"
              className="w-full px-6 py-4 bg-blast-navy border border-red-500/30 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-white placeholder-gray-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !identity.trim()}
            className="w-full py-4 px-6 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg rounded-lg transition transform hover:scale-105 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⚙️</span>
                Analyzing Blast Radius...
              </>
            ) : (
              <>
                🔍 Analyze Blast Radius
              </>
            )}
          </button>
        </form>

        {/* Info */}
        <div className="mt-12 grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl mb-2">🔴</div>
            <p className="text-sm text-gray-400">Sensitive Data</p>
          </div>
          <div>
            <div className="text-3xl mb-2">🟠</div>
            <p className="text-sm text-gray-400">Lateral Movement</p>
          </div>
          <div>
            <div className="text-3xl mb-2">🟡</div>
            <p className="text-sm text-gray-400">Peer Access</p>
          </div>
        </div>
      </div>
    </div>
  );
}
