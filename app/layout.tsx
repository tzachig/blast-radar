import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BlastRadar - Cyber Blast Radius Simulator',
  description: 'Analyze security blast radius for compromised identities',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-blast-dark text-white">
        {children}
      </body>
    </html>
  );
}
