'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  segment: string;
  status: string;
  created_at: string;
  last_interaction: string;
  total_interactions: number;
  satisfaction_score: number;
  tags: string[];
  custom_fields: Record<string, any>;
}

export default function CSQueryPage() {
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {!selectedCustomer ? (
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <h2 className="text-xl font-semibold text-gray-900">Customer List</h2>
              <p className="text-gray-600">Select a customer to view details</p>
            </div>
          ) : (
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <h2 className="text-xl font-semibold text-gray-900">Customer Details</h2>
              <p className="text-gray-600">Customer information and insights</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}