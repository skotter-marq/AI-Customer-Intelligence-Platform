'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CreateAgentRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the main create agent page
    router.push('/competitor-intelligence/create-agent');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
    </div>
  );
}