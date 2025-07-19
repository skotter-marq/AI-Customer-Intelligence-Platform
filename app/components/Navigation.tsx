'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavigationItem {
  name: string;
  href: string;
  icon: string;
  description: string;
}

interface NavigationGroup {
  title: string;
  items: NavigationItem[];
  color: string;
}

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navigationGroups: NavigationGroup[] = [
    {
      title: 'Customer Research',
      color: 'text-indigo-600',
      items: [
        {
          name: 'Customer Intelligence',
          href: '/cs-query',
          icon: '🔍',
          description: 'Advanced customer search and AI insights'
        },
        {
          name: 'Quick Search',
          href: '/cs-quick',
          icon: '⚡',
          description: 'Rapid customer lookup and basic info'
        }
      ]
    },
    {
      title: 'Content Pipeline',
      color: 'text-purple-600',
      items: [
        {
          name: 'Product Updates',
          href: '/changelog',
          icon: '📋',
          description: 'View and manage product changelog'
        },
        {
          name: 'Content Approval',
          href: '/approval',
          icon: '✅',
          description: 'Review and approve content'
        },
        {
          name: 'Content Editor',
          href: '/edit',
          icon: '✏️',
          description: 'Edit and refine generated content'
        }
      ]
    },
    {
      title: 'System Management',
      color: 'text-indigo-700',
      items: [
        {
          name: 'Dashboard',
          href: '/dashboard',
          icon: '📊',
          description: 'Main analytics dashboard'
        },
        {
          name: 'System Monitoring',
          href: '/monitoring',
          icon: '🔬',
          description: 'Monitor system performance'
        },
        {
          name: 'Testing',
          href: '/testing',
          icon: '🧪',
          description: 'System health and testing'
        }
      ]
    },
    {
      title: 'Integrations',
      color: 'text-purple-700',
      items: [
        {
          name: 'Slack Integration',
          href: '/slack',
          icon: '💬',
          description: 'Team notifications and alerts'
        },
        {
          name: 'Notifications',
          href: '/notifications',
          icon: '🔔',
          description: 'Multi-channel notifications'
        }
      ]
    }
  ];

  const quickNavItems = [
    { href: '/', label: 'Dashboard', icon: '🔍' },
    { href: '/content-pipeline', label: 'Content Pipeline', icon: '📋' },
    { href: '/competitor-intelligence', label: 'Competitor Intelligence', icon: '🎯' },
    { href: '/integrations', label: 'Integrations', icon: '🔗' }
  ];

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return pathname === '/' || pathname === '/cs-query';
    }
    return pathname?.startsWith(href) || false;
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="bg-gradient-to-r from-indigo-100 via-white to-purple-100 backdrop-blur-md shadow-lg border-b border-indigo-200/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Marq AI Product Insights</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {quickNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActiveRoute(item.href)
                      ? 'bg-indigo-100 text-indigo-700 shadow-sm'
                      : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Mobile Menu */}
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                type="button"
                className="md:hidden inline-flex items-center justify-center p-2 rounded-xl text-gray-700 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-900">Navigation</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-8">
                {navigationGroups.map((group) => (
                  <div key={group.title}>
                    <h3 className={`text-sm font-semibold ${group.color} mb-4 uppercase tracking-wider`}>
                      {group.title}
                    </h3>
                    <div className="space-y-2">
                      {group.items.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`block p-4 rounded-xl transition-all ${
                            isActiveRoute(item.href)
                              ? 'bg-indigo-50 border-2 border-indigo-200 text-indigo-700'
                              : 'border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">{item.icon}</span>
                            <div>
                              <div className="font-semibold text-gray-900">{item.name}</div>
                              <div className="text-sm text-gray-500">{item.description}</div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="space-y-4">
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-3 p-4 rounded-xl hover:bg-gray-50 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="text-xl">🏠</span>
                    <span className="font-semibold text-gray-900">Back to Dashboard</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}