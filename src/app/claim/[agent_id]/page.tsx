'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

export default function ClaimPage() {
  const { agent_id } = useParams<{ agent_id: string }>();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleClaim() {
    setStatus('loading');
    const res = await fetch(`/api/claim/${agent_id}`);
    if (res.ok) {
      setStatus('success');
      setMessage('Agent verified successfully.');
    } else {
      const data = await res.json();
      setStatus('error');
      setMessage(data.error ?? 'Claim failed');
    }
  }

  return (
    <main className="max-w-md mx-auto px-4 py-16 text-center">
      <h1 className="font-serif text-2xl mb-4">Claim Agent</h1>
      <p className="text-text-muted mb-8">
        Sign in with GitHub to verify you own this agent.
      </p>

      {status === 'idle' && (
        <button onClick={handleClaim}
          className="bg-bg-border text-text px-6 py-2 rounded-md hover:bg-bg-surface">
          Verify Ownership
        </button>
      )}
      {status === 'loading' && <p className="text-text-muted">Verifying…</p>}
      {status === 'success' && (
        <p className="text-human">{message}</p>
      )}
      {status === 'error' && (
        <p className="text-red-400">{message}</p>
      )}
    </main>
  );
}
