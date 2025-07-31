// Enhanced Attendees Section with Rich Participant Data
<div className="calendly-card">
  <h3 className="calendly-h3 mb-4">
    Participants ({meeting.attendees?.length || 0})
  </h3>
  
  {/* Participant Summary */}
  <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
    <div className="text-center">
      <p className="text-sm text-gray-600">Internal Team</p>
      <p className="text-xl font-bold text-blue-600">
        {meeting.attendees?.filter(a => a.scope === 'internal').length || 0}
      </p>
    </div>
    <div className="text-center">
      <p className="text-sm text-gray-600">External Stakeholders</p>
      <p className="text-xl font-bold text-green-600">
        {meeting.attendees?.filter(a => a.scope === 'external').length || 0}
      </p>
    </div>
  </div>

  {/* Participant List */}
  <div className="space-y-3">
    {meeting.attendees?.map((attendee, idx) => (
      <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            attendee.scope === 'internal' 
              ? 'bg-blue-100 text-blue-600' 
              : 'bg-green-100 text-green-600'
          }`}>
            {attendee.scope === 'internal' ? (
              <User className="w-5 h-5" />
            ) : (
              <Building className="w-5 h-5" />
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">{attendee.name}</p>
            <p className="text-sm text-gray-600">{attendee.email}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Attendance Status */}
          {attendee.confirmed_attendee && (
            <div className="w-3 h-3 bg-green-500 rounded-full" title="Confirmed Attendee" />
          )}
          
          {/* Role Badge */}
          <span className={`calendly-badge text-xs ${
            attendee.scope === 'internal' 
              ? 'calendly-badge-info' 
              : 'calendly-badge-success'
          }`}>
            {attendee.scope === 'internal' ? 'Team' : 'Customer'}
          </span>
          
          {/* Primary Contact Indicator */}
          {attendee.role === 'host' && (
            <span className="calendly-badge calendly-badge-warning text-xs">
              Host
            </span>
          )}
        </div>
      </div>
    ))}
  </div>

  {/* Customer Contact Actions */}
  {meeting.attendees?.filter(a => a.scope === 'external').length > 0 && (
    <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Mail className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">Customer Contacts</span>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => {
              const emails = meeting.attendees
                ?.filter(a => a.scope === 'external')
                .map(a => a.email)
                .join(';');
              window.open(`mailto:${emails}?subject=Follow-up: ${meeting.title}`);
            }}
            className="text-xs text-green-600 hover:text-green-800 flex items-center space-x-1"
          >
            <Mail className="w-3 h-3" />
            <span>Email All</span>
          </button>
          <button className="text-xs text-green-600 hover:text-green-800 flex items-center space-x-1">
            <User className="w-3 h-3" />
            <span>Add to CRM</span>
          </button>
        </div>
      </div>
    </div>
  )}
</div>