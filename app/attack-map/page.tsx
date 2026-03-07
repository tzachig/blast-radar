'use client';

import { Suspense } from 'react';
import AttackMapContent from './AttackMapContent';

export default function AttackMap() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blast-dark via-blast-navy to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🌍</div>
          <p className="text-xl text-gray-400 animate-pulse">Loading attack map...</p>
        </div>
      </div>
    }>
      <AttackMapContent />
    </Suspense>
  );
}
