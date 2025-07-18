'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface CSQueryWidgetProps {
  className?: string;
  placeholder?: string;
  onCustomerSelect?: (customerId: string) => void;
  compact?: boolean;
}

interface QuickSearchResult {
  type: 'customer' | 'interaction';
  id: string;
  name?: string;
  email?: string;
  company?: string;
  subject?: string;
  customer_name?: string;
  match_score: number;
  status: string;
  last_interaction?: string;
  created_at?: string;
}

export default function CSQueryWidget({ 
  className = '', 
  placeholder = 'Search customers...', 
  onCustomerSelect,
  compact = false 
}: CSQueryWidgetProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<QuickSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    
    try {
      const response = await fetch(`/api/cs-query?action=quick_search&query=${encodeURIComponent(searchQuery)}&limit=5`);
      
      if (response.ok) {
        const data = await response.json();
        setResults(data.results);
        setShowResults(true);
      } else {
        console.error('Search failed');
        setResults([]);
        setShowResults(false);
      }
    } catch (error) {
      console.error('Error searching:', error);
      setResults([]);
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    
    // Debounce search
    if (value.length >= 2) {
      const timeoutId = setTimeout(() => {
        handleSearch(value);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    } else {
      setResults([]);
      setShowResults(false);
    }
  };

  const handleResultClick = (result: QuickSearchResult) => {
    if (result.type === 'customer' && onCustomerSelect) {
      onCustomerSelect(result.id);
    }
    setShowResults(false);
    setQuery('');
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'customer': return '👤';
      case 'interaction': return '💬';
      default: return '📋';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-green-600';
      case 'resolved': return 'text-green-600';
      case 'open': return 'text-blue-600';
      case 'in_progress': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 ${compact ? 'py-2' : 'py-3'} border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
        />
        
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isSearching ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          ) : (
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {results.map((result) => (
            <div
              key={result.id}
              onClick={() => handleResultClick(result)}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-start space-x-3">
                <div className="text-lg">{getTypeIcon(result.type)}</div>
                <div className="flex-1 min-w-0">
                  {result.type === 'customer' ? (
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{result.name}</p>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(result.status)}`}>
                          {result.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 truncate">{result.email}</p>
                      {result.company && (
                        <p className="text-xs text-gray-500 truncate">{result.company}</p>
                      )}
                      {result.last_interaction && (
                        <p className="text-xs text-gray-400 mt-1">
                          Last interaction: {formatDistanceToNow(new Date(result.last_interaction), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{result.subject}</p>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(result.status)}`}>
                          {result.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 truncate">Customer: {result.customer_name}</p>
                      {result.created_at && (
                        <p className="text-xs text-gray-400 mt-1">
                          Created: {formatDistanceToNow(new Date(result.created_at), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400">
                    {(result.match_score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {/* View All Results Link */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
            <a
              href={`/cs-query?query=${encodeURIComponent(query)}`}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View all results for "{query}"
            </a>
          </div>
        </div>
      )}

      {/* No Results Message */}
      {showResults && results.length === 0 && !isSearching && query.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">No results found for "{query}"</p>
            <p className="text-xs text-gray-400 mt-1">Try searching with different keywords</p>
          </div>
        </div>
      )}
    </div>
  );
}