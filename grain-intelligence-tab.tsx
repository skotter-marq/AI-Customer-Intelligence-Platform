// New Grain Intelligence Tab Content
{activeTab === 'grain-intelligence' && (
  <div className="space-y-6">
    {/* Grain Summary */}
    {meeting.data_summary && (
      <div className="calendly-card">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="calendly-h3">AI-Generated Summary</h3>
            <p className="text-sm text-gray-600">Powered by Grain Intelligence</p>
          </div>
        </div>
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
          <p className="text-blue-800 leading-relaxed">{meeting.data_summary}</p>
        </div>
      </div>
    )}

    {/* Summary Points Timeline */}
    {meeting.summary_points && meeting.summary_points.length > 0 && (
      <div className="calendly-card">
        <h3 className="calendly-h3 mb-4">Key Moments Timeline</h3>
        <div className="space-y-4">
          {meeting.summary_points.map((point, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-16 text-right">
                <span className="text-xs text-gray-500 font-mono">
                  {Math.floor(point.timestamp / 60000)}:{(Math.floor(point.timestamp / 1000) % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <div className="flex-shrink-0 w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-gray-800 leading-relaxed">{point.text}</p>
                {meeting.grain_share_url && (
                  <button
                    onClick={() => window.open(`${meeting.grain_share_url}?t=${point.timestamp}`, '_blank')}
                    className="text-blue-600 hover:text-blue-800 text-xs mt-1 flex items-center space-x-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Jump to moment</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Grain Intelligence Notes */}
    {meeting.intelligence_notes && (
      <div className="space-y-6">
        {/* Key Takeaways */}
        <div className="calendly-card">
          <h3 className="calendly-h3 mb-4">Key Takeaways</h3>
          <div className="space-y-3">
            {extractKeyTakeaways(meeting.intelligence_notes).map((takeaway, index) => (
              <div key={index} className="border-l-4 border-green-400 bg-green-50 p-4 rounded-r-lg">
                <div className="flex items-start space-x-3">
                  <Lightbulb className="w-5 h-5 text-green-600 mt-0.5" />
                  <p className="text-green-800 leading-relaxed">{takeaway}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Items from Grain */}
        <div className="calendly-card">
          <h3 className="calendly-h3 mb-4">Action Items (Grain AI)</h3>
          <div className="space-y-3">
            {extractActionItems(meeting.intelligence_notes).map((action, index) => (
              <div key={index} className="border-l-4 border-orange-400 bg-orange-50 p-4 rounded-r-lg">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-orange-800 leading-relaxed">{action}</p>
                    <div className="mt-2 flex items-center space-x-2">
                      <span className="calendly-badge calendly-badge-warning text-xs">Pending</span>
                      <button className="text-xs text-orange-600 hover:text-orange-800">
                        Create JIRA Ticket
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Implementation Details (from your example) */}
        <div className="calendly-card">
          <h3 className="calendly-h3 mb-4">Implementation Details</h3>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ __html: meeting.intelligence_notes.replace(/\*\*/g, '<strong>').replace(/\n/g, '<br/>') }} />
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Meeting Health Score */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="calendly-card">
        <h4 className="font-medium text-gray-900 mb-3">Engagement Level</h4>
        <div className="flex items-center space-x-3">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${Math.min(100, (meeting.summary_points?.length || 0) * 25)}%` }}
            />
          </div>
          <span className="text-sm font-medium text-green-600">
            {Math.min(100, (meeting.summary_points?.length || 0) * 25)}%
          </span>
        </div>
      </div>

      <div className="calendly-card">
        <h4 className="font-medium text-gray-900 mb-3">Content Richness</h4>
        <div className="flex items-center space-x-3">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${meeting.intelligence_notes ? 90 : 30}%` }}
            />
          </div>
          <span className="text-sm font-medium text-blue-600">
            {meeting.intelligence_notes ? '90%' : '30%'}
          </span>
        </div>
      </div>

      <div className="calendly-card">
        <h4 className="font-medium text-gray-900 mb-3">Follow-up Priority</h4>
        <div className="flex items-center space-x-3">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full"
              style={{ width: `${meeting.intelligence_notes?.toLowerCase().includes('contract') ? 95 : 60}%` }}
            />
          </div>
          <span className="text-sm font-medium text-orange-600">
            {meeting.intelligence_notes?.toLowerCase().includes('contract') ? 'High' : 'Medium'}
          </span>
        </div>
      </div>
    </div>
  </div>
)}