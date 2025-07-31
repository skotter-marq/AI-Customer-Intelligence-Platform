// Enhanced Overview Cards with Grain Intelligence
<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
  {/* Enhanced Duration Card */}
  <div className="calendly-card">
    <div className="flex items-center justify-between">
      <div>
        <p className="calendly-label mb-1">Duration</p>
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-blue-500" />
          <span className="calendly-h3">{meeting.duration_minutes}m</span>
        </div>
        {/* NEW: Efficiency indicator */}
        <p className="text-xs text-gray-500 mt-1">
          {meeting.summary_points?.length} key points
        </p>
      </div>
      <span className="calendly-badge calendly-badge-success">
        {meeting.duration_minutes > 45 ? 'Detailed' : 'Focused'}
      </span>
    </div>
  </div>

  {/* Enhanced Participants Card */}
  <div className="calendly-card">
    <div className="flex items-center justify-between">
      <div>
        <p className="calendly-label mb-1">Participants</p>
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-green-500" />
          <span className="calendly-h3">{meeting.attendees?.length || 0}</span>
        </div>
        {/* NEW: Internal vs External breakdown */}
        <p className="text-xs text-gray-500 mt-1">
          {meeting.attendees?.filter(a => a.scope === 'external').length || 0} external,{' '}
          {meeting.attendees?.filter(a => a.scope === 'internal').length || 0} internal
        </p>
      </div>
      <div className="text-right">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <Building className="w-4 h-4 text-green-600" />
        </div>
      </div>
    </div>
  </div>

  {/* NEW: Grain Intelligence Card */}
  <div className="calendly-card">
    <div className="flex items-center justify-between">
      <div>
        <p className="calendly-label mb-1">AI Insights</p>
        <div className="flex items-center space-x-2">
          <Bot className="w-4 h-4 text-purple-500" />
          <span className="calendly-h3">{meeting.intelligence_notes ? 'Rich' : 'Basic'}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {meeting.intelligence_notes ? 'Action items detected' : 'Processing...'}
        </p>
      </div>
      <span className={`calendly-badge ${meeting.intelligence_notes ? 'calendly-badge-success' : 'calendly-badge-warning'}`}>
        {meeting.intelligence_notes ? 'Complete' : 'Pending'}
      </span>
    </div>
  </div>

  {/* Enhanced Customer Card */}
  <div className="calendly-card">
    <div className="flex items-center justify-between">
      <div>
        <p className="calendly-label mb-1">Customer</p>
        <div className="flex items-center space-x-2">
          <Building className="w-4 h-4 text-orange-500" />
          <span className="calendly-h3 text-sm">{meeting.customer_name || 'Unknown'}</span>
        </div>
        {/* NEW: Customer domain info */}
        <p className="text-xs text-gray-500 mt-1">
          {meeting.attendees?.filter(a => a.scope === 'external')[0]?.email?.split('@')[1] || 'N/A'}
        </p>
      </div>
      <span className={`calendly-badge ${meeting.customer_id ? 'calendly-badge-success' : 'calendly-badge-info'}`}>
        {meeting.customer_id ? 'Linked' : 'Detected'}
      </span>
    </div>
  </div>
</div>