'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  FileText, 
  Target, 
  GitBranch, 
  Settings,
  User,
  ChevronLeft,
  Menu,
  Users,
  MessageSquare,
  Package,
  Bot,
  Slack,
  ChevronDown,
  LogOut,
} from 'lucide-react';

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export default function Navigation() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update the main content margin when sidebar state changes
  useEffect(() => {
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.style.marginLeft = isCollapsed ? '80px' : '250px';
    }
  }, [isCollapsed]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navigationItems: NavigationItem[] = [
    { 
      href: '/', 
      label: 'Dashboard', 
      icon: BarChart3, 
      description: 'AI Assistant & overview' 
    },
    { 
      href: '/meetings', 
      label: 'Meetings', 
      icon: MessageSquare, 
      description: 'Grain call recordings' 
    },
    { 
      href: '/competitors', 
      label: 'Competitors', 
      icon: Target, 
      description: 'Competitive intelligence' 
    },
    { 
      href: '/workflows', 
      label: 'Workflows', 
      icon: GitBranch, 
      description: 'n8n business logic & automation' 
    },
    { 
      href: '/agents', 
      label: 'Agents', 
      icon: Bot, 
      description: 'Automated & manual workflow execution' 
    },
    { 
      href: '/product', 
      label: 'Product', 
      icon: Package, 
      description: 'Updates & changelog' 
    },
    { 
      href: '/content-pipeline', 
      label: 'Content Pipeline', 
      icon: FileText, 
      description: 'Manage content workflow' 
    },
    { 
      href: '/integrations', 
      label: 'App Marketplace', 
      icon: Package, 
      description: 'Browse and manage apps' 
    }
  ];

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return pathname === '/' || pathname === '/cs-query';
    }
    // Handle legacy competitor-intelligence route (but exclude create-agent which belongs to Agents)
    if (href === '/competitors' && pathname?.startsWith('/competitor-intelligence') && !pathname?.includes('/create-agent')) {
      return true;
    }
    // Handle create-agent route for Agents tab
    if (href === '/agents' && pathname?.includes('/create-agent')) {
      return true;
    }
    // Exclude admin settings pages from highlighting main nav items
    if (pathname?.startsWith('/admin/ai-prompts') || pathname?.startsWith('/slack/configuration')) {
      return false;
    }
    return pathname?.startsWith(href) || false;
  };

  return (
    <div className="fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-40 flex flex-col" 
         style={{ width: isCollapsed ? '80px' : '250px' }}>
      
      {/* Logo/Brand Section */}
      <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: '#f1f5f9' }}>
        {!isCollapsed && (
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#4285f4' }}>
              <span className="text-white font-semibold text-sm">AI</span>
            </div>
            <span className="calendly-h3" style={{ marginBottom: 0 }}>Marq AI</span>
          </Link>
        )}
        {isCollapsed && (
          <Link href="/" className="flex items-center justify-center w-full">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#4285f4' }}>
              <span className="text-white font-semibold text-sm">AI</span>
            </div>
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg transition-colors"
          style={{ color: '#718096' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f8fafc';
            e.currentTarget.style.color = '#4a5568';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#718096';
          }}
        >
          <ChevronLeft className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-5 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveRoute(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-3 rounded-lg transition-all duration-200 group relative ${
                isActive
                  ? 'text-white'
                  : 'calendly-body-sm hover:bg-gray-50'
              }`}
              style={isActive ? { 
                background: '#4285f4',
                fontWeight: 500
              } : { 
                color: '#4a5568' 
              }}
              onMouseEnter={!isActive ? (e) => {
                e.currentTarget.style.background = '#f8fafc';
              } : undefined}
              onMouseLeave={!isActive ? (e) => {
                e.currentTarget.style.background = 'transparent';
              } : undefined}
            >
              <Icon className={`flex-shrink-0 w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
              {!isCollapsed && (
                <span className="ml-3 truncate">{item.label}</span>
              )}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50"
                     style={{ background: '#2d3748' }}>
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="border-t" style={{ borderColor: '#f1f5f9' }}>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className={`w-full p-5 flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} hover:bg-gray-50 transition-colors`}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#e2e8f0' }}>
              <User className="w-4 h-4" style={{ color: '#718096' }} />
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0 text-left">
                  <p className="calendly-body-sm font-medium truncate" style={{ color: '#1a1a1a', marginBottom: '2px' }}>User Account</p>
                  <p className="calendly-label-sm truncate">admin@company.com</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>

          {/* Dropdown Menu */}
          {isProfileDropdownOpen && !isCollapsed && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="py-2">
                <Link
                  href="/admin/settings"
                  className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsProfileDropdownOpen(false)}
                >
                  <Settings className="w-4 h-4 text-gray-500 mr-3" />
                  <span className="calendly-body-sm">Admin Settings</span>
                </Link>
                <button
                  className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    // Add logout logic here
                  }}
                >
                  <LogOut className="w-4 h-4 text-gray-500 mr-3" />
                  <span className="calendly-body-sm">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}