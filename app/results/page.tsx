'use client';

import { Suspense } from 'react';
import ResultsContent from './ResultsContent';

export default function Results() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blast-dark via-blast-navy to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚙️</div>
          <p className="text-xl text-gray-400 animate-pulse">Loading analysis...</p>
        </div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
