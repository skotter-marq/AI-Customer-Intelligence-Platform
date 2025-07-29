// lib/coda-client.js
/**
 * Coda API Client for creating external research initiative rows
 * Documentation: https://coda.io/developers/apis/v1
 */

class CodaClient {
  constructor() {
    this.baseUrl = 'https://coda.io/apis/v1';
    this.apiToken = process.env.CODA_API_TOKEN;
    
    if (!this.apiToken) {
      console.warn('⚠️ CODA_API_TOKEN not found in environment variables');
    }
  }

  /**
   * Get headers for Coda API requests
   */
  getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Create a new row in a Coda table for external research initiatives
   * @param {Object} meetingData - Meeting data to create research initiative from
   * @param {string} docId - Coda document ID
   * @param {string} tableId - Coda table ID
   * @param {Object} customMapping - Custom column mapping and AI-analyzed data
   * @returns {Promise<Object>} - API response
   */
  async createResearchInitiative(meetingData, docId, tableId, customMapping = null) {
    try {
      console.log('📋 Creating Coda research initiative for meeting:', meetingData.title);
      
      if (!this.apiToken) {
        throw new Error('CODA_API_TOKEN not configured');
      }

      const url = `${this.baseUrl}/docs/${docId}/tables/${tableId}/rows`;
      
      // Use form data, custom mapping, or default mapping
      let cells;
      if (customMapping && customMapping.formData) {
        cells = this.buildFormCells(meetingData, customMapping);
      } else if (customMapping && customMapping.columnMappings) {
        cells = this.buildCustomCells(meetingData, customMapping);
      } else {
        cells = this.buildDefaultCells(meetingData);
      }
      
      const rowData = {
        rows: [{ cells }]
      };

      console.log('🔗 Sending request to Coda API:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(rowData)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(`Coda API error: ${response.status} - ${result.message || 'Unknown error'}`);
      }

      console.log('✅ Research initiative created in Coda:', result.requestId);
      
      return {
        success: true,
        requestId: result.requestId,
        addedRowIds: result.addedRowIds,
        message: 'Research initiative created successfully',
        codaUrl: `https://coda.io/d/${docId}#_table_${tableId}`
      };

    } catch (error) {
      console.error('❌ Failed to create Coda research initiative:', error);
      throw error;
    }
  }

  /**
   * Build cells from form data with AI analysis
   */
  buildFormCells(meetingData, customMapping) {
    const { formData, aiAnalysis } = customMapping;
    const cells = [];
    
    // Basic info from form
    cells.push({ column: 'Name', value: formData.name || meetingData.customer || '' });
    cells.push({ column: 'Email address', value: formData.email || '' });
    cells.push({ column: 'Account', value: formData.account || meetingData.customer || '' });
    cells.push({ column: 'Date of call', value: meetingData.date });
    cells.push({ column: 'Gift card sent', value: false });
    cells.push({ column: 'Interviewer', value: formData.interviewer || '' });
    cells.push({ column: 'Recording', value: formData.recording || meetingData.recording_url || meetingData.grain_share_url || '' });
    cells.push({ column: 'Status', value: formData.status || 'Scheduled' });
    cells.push({ column: 'Role', value: formData.role || 'End User' });
    cells.push({ column: 'CSAT', value: formData.csat || '' });
    
    // Initiative field
    if (formData.initiative) {
      cells.push({ column: 'Initiatives | MASTER LIST', value: formData.initiative });
    }
    
    // JTBD columns - use AI analysis if available, otherwise form data
    if (aiAnalysis && aiAnalysis.jtbd) {
      cells.push({ column: 'JTBD 1', value: aiAnalysis.jtbd.jtbd_insights?.jtbd_1 || formData.jtbd1 || '' });
      cells.push({ column: 'JTBD 2', value: aiAnalysis.jtbd.jtbd_insights?.jtbd_2 || formData.jtbd2 || '' });
      cells.push({ column: 'JTBD 3', value: aiAnalysis.jtbd.jtbd_insights?.jtbd_3 || formData.jtbd3 || '' });
      cells.push({ column: 'JTBD 4', value: aiAnalysis.jtbd.jtbd_insights?.jtbd_4 || formData.jtbd4 || '' });
    } else {
      cells.push({ column: 'JTBD 1', value: formData.jtbd1 || '' });
      cells.push({ column: 'JTBD 2', value: formData.jtbd2 || '' });
      cells.push({ column: 'JTBD 3', value: formData.jtbd3 || '' });
      cells.push({ column: 'JTBD 4', value: formData.jtbd4 || '' });
    }
    
    // Key takeaways - use AI analysis if available, otherwise form data
    let keyTakeaways = formData.keyTakeaways || meetingData.summary || '';
    if (aiAnalysis && aiAnalysis.jtbd && aiAnalysis.jtbd.summary) {
      keyTakeaways = aiAnalysis.jtbd.summary + (keyTakeaways ? '\n\n' + keyTakeaways : '');
    }
    cells.push({ column: 'Key takeaways', value: keyTakeaways });
    
    return cells;
  }

  /**
   * Build custom cells based on user-defined column mappings and AI analysis
   */
  buildCustomCells(meetingData, customMapping) {
    const { columnMappings, aiAnalysis } = customMapping;
    const cells = [];
    
    // Process each column mapping
    Object.entries(columnMappings).forEach(([columnName, mapping]) => {
      let value = '';
      
      switch (mapping.source) {
        case 'meeting_field':
          value = this.getMeetingFieldValue(meetingData, mapping.field);
          break;
        case 'ai_analysis':
          value = aiAnalysis && aiAnalysis[mapping.field] ? aiAnalysis[mapping.field] : '';
          break;
        case 'static':
          value = mapping.value || '';
          break;
        case 'computed':
          value = this.computeValue(meetingData, mapping.computation);
          break;
        default:
          value = mapping.defaultValue || '';
      }
      
      cells.push({
        column: columnName,
        value: value
      });
    });
    
    return cells;
  }

  /**
   * Build default cells for backward compatibility
   */
  buildDefaultCells(meetingData) {
    // Map to actual column names in the "Interviewed customers" table
    return [
      {
        column: 'Name',
        value: meetingData.customer || 'Unknown Customer'
      },
      {
        column: 'Email address',
        value: '' // To be filled manually
      },
      {
        column: 'Account',
        value: meetingData.customer || 'Unknown'
      },
      {
        column: 'Role',
        value: '' // To be filled manually
      },
      {
        column: 'Date of call',
        value: meetingData.date
      },
      {
        column: 'Gift card sent',
        value: false
      },
      {
        column: 'Interviewer',
        value: '' // To be filled manually
      },
      {
        column: 'Recording',
        value: meetingData.title // Meeting title as reference
      },
      {
        column: 'Status',
        value: 'New Interview'
      },
      {
        column: 'Key takeaways',
        value: meetingData.summary || 'No summary available'
      },
      {
        column: 'CSAT',
        value: '' // To be filled manually
      }
    ];
  }

  /**
   * Get meeting field value by path
   */
  getMeetingFieldValue(meetingData, fieldPath) {
    const value = fieldPath.split('.').reduce((obj, key) => obj && obj[key], meetingData);
    return value !== undefined ? String(value) : '';
  }

  /**
   * Compute value based on meeting data
   */
  computeValue(meetingData, computation) {
    switch (computation) {
      case 'research_title':
        return `Research: ${meetingData.title}`;
      case 'current_date':
        return new Date().toISOString();
      case 'priority_mapping':
        return this.mapPriorityToCoda(meetingData.priority);
      case 'attendee_list':
        return this.formatAttendees(meetingData.attendees);
      case 'topic_list':
        return meetingData.keyTopics ? meetingData.keyTopics.join(', ') : '';
      case 'action_items':
        return meetingData.actionItems ? meetingData.actionItems.join('; ') : '';
      default:
        return '';
    }
  }

  /**
   * Map meeting priority to Coda-friendly values
   */
  mapPriorityToCoda(priority) {
    const priorityMap = {
      'high': 'High',
      'medium': 'Medium', 
      'low': 'Low'
    };
    return priorityMap[priority] || 'Medium';
  }

  /**
   * Format attendees for Coda display
   */
  formatAttendees(attendees) {
    if (!attendees || attendees.length === 0) {
      return 'No attendees listed';
    }

    if (typeof attendees[0] === 'string') {
      return attendees.join(', ');
    }

    // Handle attendee objects
    return attendees.map(attendee => {
      if (typeof attendee === 'object' && attendee.name) {
        return attendee.email ? `${attendee.name} (${attendee.email})` : attendee.name;
      }
      return String(attendee);
    }).join(', ');
  }

  /**
   * Check Coda API connection and permissions
   */
  async testConnection(docId, tableId) {
    try {
      console.log('🧪 Testing Coda API connection...');
      
      if (!this.apiToken) {
        throw new Error('CODA_API_TOKEN not configured');
      }

      // Test by getting table info
      const url = `${this.baseUrl}/docs/${docId}/tables/${tableId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`API test failed: ${response.status} - ${error.message || 'Unknown error'}`);
      }

      const tableInfo = await response.json();
      
      console.log('✅ Coda API connection successful');
      console.log(`📋 Table: ${tableInfo.name} (${tableInfo.columns?.length || 'Unknown'} columns)`);
      
      return {
        success: true,
        table: tableInfo,
        message: 'Connection successful'
      };

    } catch (error) {
      console.error('❌ Coda API connection test failed:', error);
      throw error;
    }
  }

  /**
   * Get table columns to help with mapping
   */
  async getTableColumns(docId, tableId) {
    try {
      const url = `${this.baseUrl}/docs/${docId}/tables/${tableId}/columns`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to get columns: ${response.status} - ${error.message}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        columns: result.items.map(col => ({
          id: col.id,
          name: col.name,
          type: col.valueType
        }))
      };

    } catch (error) {
      console.error('❌ Failed to get table columns:', error);
      throw error;
    }
  }

  /**
   * Get table rows for dropdown population
   */
  async getTableRows(docId, tableId, columnNames = []) {
    try {
      let url = `${this.baseUrl}/docs/${docId}/tables/${tableId}/rows`;
      
      // Add column filter if specified
      if (columnNames.length > 0) {
        const columnParams = columnNames.map(name => `valueColumns=${encodeURIComponent(name)}`).join('&');
        url += `?${columnParams}`;
      }
      
      console.log('🔗 Coda API URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      console.log('🔗 Coda API response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.log('❌ Coda API error response:', JSON.stringify(error, null, 2));
        throw new Error(`Failed to get table rows: ${response.status} - ${error.message}`);
      }

      const result = await response.json();
      console.log('🔗 Raw Coda API result:', JSON.stringify(result, null, 2));
      
      return {
        success: true,
        rows: result.items || []
      };

    } catch (error) {
      console.error('❌ Failed to get table rows:', error);
      throw error;
    }
  }
}

module.exports = { CodaClient };