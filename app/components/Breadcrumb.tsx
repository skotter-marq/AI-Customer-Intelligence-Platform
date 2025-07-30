'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  const router = useRouter();

  const handleBackClick = () => {
    // Go to the parent page (second to last item if it has an href, otherwise router.back())
    const parentItem = items[items.length - 2];
    if (parentItem?.href) {
      router.push(parentItem.href);
    } else {
      router.back();
    }
  };

  const handleItemClick = (item: BreadcrumbItem) => {
    if (item.href && !item.current) {
      router.push(item.href);
    }
  };

  return (
    <div className={`calendly-card-static border-b ${className}`} style={{ margin: '0 24px 24px 24px', padding: '16px 24px', borderRadius: '0' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBackClick}
            className="p-2 rounded-lg"
            style={{ color: '#718096' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f1f5f9';
              e.currentTarget.style.color = '#4285f4';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#718096';
            }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2">
            {items.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <span style={{ color: '#a0aec0' }}>›</span>
                )}
                <button
                  onClick={() => handleItemClick(item)}
                  className="calendly-body-sm"
                  style={{ 
                    color: item.current ? '#1a1a1a' : '#718096',
                    fontWeight: item.current ? '500' : 'normal',
                    cursor: item.href && !item.current ? 'pointer' : 'default'
                  }}
                  onMouseEnter={(e) => {
                    if (item.href && !item.current) {
                      e.currentTarget.style.color = '#4285f4';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (item.href && !item.current) {
                      e.currentTarget.style.color = '#718096';
                    }
                  }}
                  disabled={item.current || !item.href}
                >
                  {item.label}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}