// Enhanced Header Section for Meeting Profile
<div className="flex items-center justify-between mb-6">
  <div className="flex items-center space-x-4">
    <div>
      <h1 className="calendly-h1">{meeting.title}</h1>
      <div className="flex items-center space-x-4 text-gray-600">
        <span>{meeting.customer_name}</span>
        <span>•</span>
        <span>{formatMeetingDate(meeting.meeting_date)}</span>
        <span>•</span>
        <span className="font-medium text-blue-600">{meeting.duration_minutes} min</span>
        {/* NEW: Meeting Type Badge */}
        <span className="calendly-badge calendly-badge-info capitalize">
          {meeting.meeting_type || 'general'}
        </span>
        {/* NEW: Data Source Badge */}
        {meeting.data_source && (
          <span className="calendly-badge calendly-badge-success">
            via {meeting.data_source}
          </span>
        )}
      </div>
    </div>
  </div>
  
  <div className="flex items-center space-x-3">
    {/* Enhanced Recording Button */}
    {meeting.recording_url && (
      <button 
        onClick={() => window.open(meeting.recording_url, '_blank')}
        className="calendly-btn-secondary flex items-center space-x-2"
      >
        <Play className="w-4 h-4" />
        <span>Watch Recording</span>
      </button>
    )}
    
    {/* NEW: Grain Share Button */}
    {meeting.grain_share_url && (
      <button 
        onClick={() => window.open(meeting.grain_share_url, '_blank')}
        className="calendly-btn-primary flex items-center space-x-2"
      >
        <ExternalLink className="w-4 h-4" />
        <span>View in Grain</span>
      </button>
    )}

    {/* NEW: Transcript Access */}
    {meeting.transcript_urls && (
      <div className="relative group">
        <button className="calendly-btn-secondary flex items-center space-x-2">
          <FileText className="w-4 h-4" />
          <span>Transcript</span>
          <ChevronDown className="w-4 h-4" />
        </button>
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
          <div className="py-1">
            {meeting.transcript_urls.txt && (
              <a href={meeting.transcript_urls.txt} target="_blank" className="block px-4 py-2 text-sm hover:bg-gray-50">
                Text Format
              </a>
            )}
            {meeting.transcript_urls.srt && (
              <a href={meeting.transcript_urls.srt} target="_blank" className="block px-4 py-2 text-sm hover:bg-gray-50">
                SRT Subtitles
              </a>
            )}
            {meeting.transcript_urls.vtt && (
              <a href={meeting.transcript_urls.vtt} target="_blank" className="block px-4 py-2 text-sm hover:bg-gray-50">
                VTT Subtitles
              </a>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
</div>