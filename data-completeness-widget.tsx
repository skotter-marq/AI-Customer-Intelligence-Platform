// Data Completeness Widget
const DataCompletenessWidget = ({ meeting }) => {
  const calculateCompleteness = () => {
    const fields = [
      { key: 'title', label: 'Title', present: !!meeting.title },
      { key: 'duration', label: 'Duration', present: !!meeting.duration_minutes },
      { key: 'participants', label: 'Participants', present: meeting.attendees?.length > 0 },
      { key: 'transcript', label: 'Transcript', present: !!meeting.raw_transcript },
      { key: 'summary', label: 'AI Summary', present: !!meeting.data_summary },
      { key: 'intelligence', label: 'Intelligence Notes', present: !!meeting.intelligence_notes },
      { key: 'customer', label: 'Customer ID', present: !!meeting.customer_id },
      { key: 'recording', label: 'Recording URL', present: !!meeting.recording_url }
    ];
    
    const presentCount = fields.filter(f => f.present).length;
    const completeness = Math.round((presentCount / fields.length) * 100);
    
    return { fields, completeness, presentCount, totalCount: fields.length };
  };

  const { fields, completeness, presentCount, totalCount } = calculateCompleteness();

  return (
    <div className="calendly-card mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            completeness >= 80 ? 'bg-green-100' : 
            completeness >= 60 ? 'bg-yellow-100' : 'bg-red-100'
          }`}>
            <Database className={`w-5 h-5 ${
              completeness >= 80 ? 'text-green-600' : 
              completeness >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`} />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Data Completeness</h3>
            <p className="text-sm text-gray-600">{presentCount} of {totalCount} fields populated</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`text-2xl font-bold ${
            completeness >= 80 ? 'text-green-600' : 
            completeness >= 60 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {completeness}%
          </div>
          <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                completeness >= 80 ? 'bg-green-500' : 
                completeness >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${completeness}%` }}
            />
          </div>
        </div>
      </div>

      {/* Field Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {fields.map((field) => (
          <div key={field.key} className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              field.present ? 'bg-green-500' : 'bg-gray-300'
            }`} />
            <span className={`text-xs ${
              field.present ? 'text-gray-900' : 'text-gray-500'
            }`}>
              {field.label}
            </span>
          </div>
        ))}
      </div>

      {/* Enhancement Suggestions */}
      {completeness < 100 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-2">
            <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Enhance this meeting:</p>
              <ul className="text-xs text-blue-700 mt-1 space-y-1">
                {!meeting.raw_transcript && (
                  <li>• Fetch transcript from Grain for AI analysis</li>
                )}
                {!meeting.customer_id && (
                  <li>• Link to customer record for better tracking</li>
                )}
                {!meeting.intelligence_notes && (
                  <li>• Enable Grain AI for detailed insights</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataCompletenessWidget;