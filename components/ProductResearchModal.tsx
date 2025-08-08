'use client';

import React from 'react';
import { X, Database, Bot, Lightbulb, Sparkles, Zap } from 'lucide-react';

interface ProductResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: any;
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: () => void;
}

export default function ProductResearchModal({
  isOpen,
  onClose,
  meeting,
  formData,
  setFormData,
  onSubmit
}: ProductResearchModalProps) {
  if (!isOpen) return null;

  const formatMeetingDate = (dateValue: string | null | undefined): string => {
    if (!dateValue) return 'Date not available';
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return 'Invalid date';
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (error) {
      return 'Date not available';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex">
        {/* Main Form Panel */}
        <div className="flex-1 overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Database className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Publish Product Research</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              AI will automatically extract detailed insights from your meeting transcript
            </p>
          </div>
          
          <div className="p-6 space-y-8">
            {/* Source Meeting */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <span>Source Meeting</span>
              </h3>
              <div className="bg-blue-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700 font-medium">Meeting:</span>
                  <span className="text-blue-900">{meeting.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700 font-medium">Date:</span>
                  <span className="text-blue-900">{formatMeetingDate(meeting.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700 font-medium">Customer:</span>
                  <span className="text-blue-900">{meeting.customer_name || 'Unknown Customer'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700 font-medium">Duration:</span>
                  <span className="text-blue-900">{meeting.duration_minutes} minutes</span>
                </div>
              </div>
            </div>

            {/* Quick Details (Required) */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Quick Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={meeting.customer_name || "Company name"}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Research Type *</label>
                  <select
                    value={formData.researchType}
                    onChange={(e) => setFormData(prev => ({ ...prev, researchType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Discovery">🔍 Discovery Session</option>
                    <option value="Feature Request">💡 Feature Request</option>
                    <option value="Bug Report">🐛 Bug/Issue Report</option>
                    <option value="Competitive Intel">🏢 Competitive Intelligence</option>
                    <option value="User Feedback">💬 User Feedback</option>
                    <option value="Usability Issue">🎨 Usability Issue</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer Segment</label>
                  <select
                    value={formData.customerSegment}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerSegment: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select segment...</option>
                    <option value="SMB">🏢 SMB (1-50 employees)</option>
                    <option value="Mid-Market">🏬 Mid-Market (51-500)</option>
                    <option value="Enterprise">🏛️ Enterprise (500+)</option>
                    <option value="Startup">🚀 Startup</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Low">🟢 Low</option>
                    <option value="Medium">🟡 Medium</option>
                    <option value="High">🟠 High</option>
                    <option value="Critical">🔴 Critical</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Optional Manual Notes */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Additional Notes <span className="text-sm font-normal text-gray-500">(Optional)</span></h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Key Observations</label>
                  <textarea
                    value={formData.primaryFinding}
                    onChange={(e) => setFormData(prev => ({ ...prev, primaryFinding: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Any specific insights or important details to highlight (AI will extract additional insights from the transcript)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer Quotes</label>
                  <textarea
                    value={formData.customerQuotes}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerQuotes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                    placeholder='Notable quotes: "We really need this feature because..." (AI will extract more from transcript)'
                  />
                </div>
              </div>
            </div>

            {/* AI Processing Preview */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <Bot className="w-5 h-5 text-blue-600" />
                <span>AI Analysis Preview</span>
              </h3>
              <p className="text-sm text-gray-700 mb-3">
                When published, AI will automatically analyze the meeting transcript to extract:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">Feature requests & pain points</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700">Product area classification</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-700">Business impact assessment</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-700">Competitive mentions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-gray-700">Urgency & priority scoring</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    <span className="text-gray-700">Actionable next steps</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Publish with AI Analysis</span>
            </button>
          </div>
        </div>

        {/* AI Assistant Panel */}
        <div className="w-80 bg-gradient-to-b from-blue-50 to-indigo-50 border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <Bot className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">AI Research Engine</h3>
            </div>
            <p className="text-sm text-gray-600">Automated analysis will be performed on submission</p>
          </div>
          
          <div className="flex-1 p-4 space-y-4">
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-center space-x-2 mb-3">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="font-medium text-sm text-gray-900">Auto-Generated Fields</span>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="font-medium text-green-900 mb-1">🎯 Product Area Detection</div>
                  <div className="text-green-700 text-xs">AI will classify which product areas are mentioned (Login, Dashboard, API, etc.)</div>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="font-medium text-blue-900 mb-1">💡 Feature Request Extraction</div>
                  <div className="text-blue-700 text-xs">Automatically identify and categorize feature requests with priority scoring</div>
                </div>
                
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="font-medium text-purple-900 mb-1">🚨 Pain Point Analysis</div>
                  <div className="text-purple-700 text-xs">Extract customer frustrations and blockers with severity assessment</div>
                </div>
                
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="font-medium text-orange-900 mb-1">🏢 Competitive Intelligence</div>
                  <div className="text-orange-700 text-xs">Detect mentions of competitors and switching considerations</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>🎪 Smart Processing:</strong> AI analyzes {meeting.duration_minutes} minutes of transcript content</p>
                <p><strong>📊 Data Output:</strong> Structured findings exported to Coda research table</p>
                <p><strong>⚡ Processing Time:</strong> ~30 seconds for complete analysis</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}