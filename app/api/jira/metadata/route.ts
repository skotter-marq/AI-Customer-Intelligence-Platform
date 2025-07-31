import { NextResponse } from 'next/server';

// JIRA API integration to fetch workspace metadata
export async function GET() {
  try {
    const jiraBaseUrl = process.env.JIRA_BASE_URL; // e.g., https://marq.atlassian.net
    const jiraApiToken = process.env.JIRA_API_TOKEN;
    const jiraEmail = process.env.JIRA_EMAIL; // Your JIRA account email

    if (!jiraBaseUrl || !jiraApiToken || !jiraEmail) {
      console.log('⚠️ JIRA credentials not configured, using fallback data');
      return NextResponse.json({
        success: false,
        error: 'JIRA credentials not configured',
        data: getStaticJiraData() // Fallback to static data
      });
    }

    const auth = Buffer.from(`${jiraEmail}:${jiraApiToken}`).toString('base64');
    const headers = {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    console.log('🔍 Fetching JIRA workspace metadata...');

    // Fetch all JIRA metadata in parallel
    const [
      projectsResponse,
      statusesResponse,
      issueTypesResponse,
      prioritiesResponse,
      usersResponse,
      customFieldsResponse
    ] = await Promise.allSettled([
      fetch(`${jiraBaseUrl}/rest/api/2/project`, { headers }),
      fetch(`${jiraBaseUrl}/rest/api/2/status`, { headers }),
      fetch(`${jiraBaseUrl}/rest/api/2/issuetype`, { headers }),
      fetch(`${jiraBaseUrl}/rest/api/2/priority`, { headers }),
      fetch(`${jiraBaseUrl}/rest/api/2/users/search?query=`, { headers }), // Gets active users
      fetch(`${jiraBaseUrl}/rest/api/2/field`, { headers })
    ]);

    const metadata: any = {
      projects: [],
      statuses: [],
      issueTypes: [],
      priorities: [],
      users: [],
      customFields: [],
      components: [], // Teams/Components from JIRA
      labels: [], // Real labels from JIRA
      statusCategories: [
        { key: 'new', name: 'To Do', colorName: 'blue-gray' },
        { key: 'indeterminate', name: 'In Progress', colorName: 'yellow' },
        { key: 'done', name: 'Done', colorName: 'green' }
      ]
    };

    // Process Projects
    if (projectsResponse.status === 'fulfilled' && projectsResponse.value.ok) {
      const projects = await projectsResponse.value.json();
      metadata.projects = projects.map((p: any) => ({
        key: p.key,
        name: p.name,
        id: p.id,
        projectTypeKey: p.projectTypeKey
      })).sort((a: any, b: any) => a.key.localeCompare(b.key));

      // Fetch components and labels from all projects
      const allComponents = new Set();
      const allLabels = new Set();

      for (const project of projects.slice(0, 5)) { // Limit to first 5 projects for performance
        try {
          // Fetch components (teams) for this project
          const componentsResponse = await fetch(`${jiraBaseUrl}/rest/api/2/project/${project.key}/components`, { headers });
          if (componentsResponse.ok) {
            const components = await componentsResponse.json();
            components.forEach((comp: any) => {
              if (comp.name) {
                allComponents.add(comp.name);
              }
            });
          }

          // Fetch recent issues to get labels (more efficient than searching all labels)
          const issuesResponse = await fetch(`${jiraBaseUrl}/rest/api/2/search?jql=project=${project.key}&fields=labels&maxResults=100`, { headers });
          if (issuesResponse.ok) {
            const issuesData = await issuesResponse.json();
            issuesData.issues?.forEach((issue: any) => {
              issue.fields?.labels?.forEach((label: string) => {
                if (label) {
                  allLabels.add(label);
                }
              });
            });
          }
        } catch (error) {
          console.warn(`⚠️ Failed to fetch data for project ${project.key}:`, error);
        }
      }

      metadata.components = Array.from(allComponents).sort();
      metadata.labels = Array.from(allLabels).sort();
    }

    // Process Statuses
    if (statusesResponse.status === 'fulfilled' && statusesResponse.value.ok) {
      const statuses = await statusesResponse.value.json();
      metadata.statuses = statuses.map((s: any) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        statusCategory: {
          key: s.statusCategory.key,
          name: s.statusCategory.name,
          colorName: s.statusCategory.colorName
        }
      })).sort((a: any, b: any) => a.name.localeCompare(b.name));
    }

    // Process Issue Types
    if (issueTypesResponse.status === 'fulfilled' && issueTypesResponse.value.ok) {
      const issueTypes = await issueTypesResponse.value.json();
      metadata.issueTypes = issueTypes
        .filter((it: any) => !it.subtask) // Exclude subtasks
        .map((it: any) => ({
          id: it.id,
          name: it.name,
          description: it.description,
          iconUrl: it.iconUrl
        })).sort((a: any, b: any) => a.name.localeCompare(b.name));
    }

    // Process Priorities
    if (prioritiesResponse.status === 'fulfilled' && prioritiesResponse.value.ok) {
      const priorities = await prioritiesResponse.value.json();
      metadata.priorities = priorities.map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        iconUrl: p.iconUrl
      })).sort((a: any, b: any) => {
        // Sort by priority order (higher priority first)
        const order = ['Critical', 'High', 'Medium', 'Low', 'Lowest'];
        return order.indexOf(a.name) - order.indexOf(b.name);
      });
    }

    // Process Users (limit to first 50 active users)
    if (usersResponse.status === 'fulfilled' && usersResponse.value.ok) {
      const users = await usersResponse.value.json();
      metadata.users = users
        .filter((u: any) => u.active)
        .slice(0, 50)
        .map((u: any) => ({
          accountId: u.accountId,
          displayName: u.displayName,
          emailAddress: u.emailAddress,
          avatarUrls: u.avatarUrls
        })).sort((a: any, b: any) => a.displayName.localeCompare(b.displayName));
    }

    // Process Custom Fields
    if (customFieldsResponse.status === 'fulfilled' && customFieldsResponse.value.ok) {
      const fields = await customFieldsResponse.value.json();
      metadata.customFields = fields
        .filter((f: any) => f.custom && f.name && f.id.startsWith('customfield_'))
        .map((f: any) => ({
          id: f.id,
          name: f.name,
          description: f.description,
          type: f.schema?.type,
          custom: f.custom
        }))
        .sort((a: any, b: any) => a.name.localeCompare(b.name));
    }

    // Add common labels (these are project-specific, so we'll provide common ones)
    metadata.commonLabels = [
      'customer-facing',
      'product-update',
      'urgent',
      'customer-request',
      'bug-fix',
      'enhancement',
      'security',
      'performance',
      'ui-ux',
      'backend',
      'frontend',
      'mobile',
      'api',
      'documentation'
    ].sort();

    console.log('✅ JIRA metadata fetched successfully');
    console.log(`   Projects: ${metadata.projects.length}`);
    console.log(`   Statuses: ${metadata.statuses.length}`);
    console.log(`   Issue Types: ${metadata.issueTypes.length}`);
    console.log(`   Priorities: ${metadata.priorities.length}`);
    console.log(`   Users: ${metadata.users.length}`);
    console.log(`   Custom Fields: ${metadata.customFields.length}`);

    return NextResponse.json({
      success: true,
      data: metadata,
      lastFetched: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Failed to fetch JIRA metadata:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch JIRA metadata',
      data: getStaticJiraData() // Fallback to static data
    });
  }
}

// Fallback static data when JIRA API is not available
function getStaticJiraData() {
  return {
    projects: [
      { key: 'PRESS', name: 'Product Release System', id: '10001' },
      { key: 'PROD', name: 'Product Development', id: '10002' },
      { key: 'SUPPORT', name: 'Customer Support', id: '10003' }
    ],
    statuses: [
      { id: '1', name: 'Open', statusCategory: { key: 'new', name: 'To Do' } },
      { id: '3', name: 'In Progress', statusCategory: { key: 'indeterminate', name: 'In Progress' } },
      { id: '6', name: 'Closed', statusCategory: { key: 'done', name: 'Done' } },
      { id: '10001', name: 'Done', statusCategory: { key: 'done', name: 'Done' } },
      { id: '10002', name: 'Deployed', statusCategory: { key: 'done', name: 'Done' } },
      { id: '10003', name: 'Released', statusCategory: { key: 'done', name: 'Done' } }
    ],
    issueTypes: [
      { id: '1', name: 'Bug', description: 'A problem that impairs product functions' },
      { id: '2', name: 'Feature', description: 'A new feature request' },
      { id: '3', name: 'Task', description: 'A task to be completed' },
      { id: '4', name: 'Story', description: 'A user story' },
      { id: '5', name: 'Epic', description: 'A large body of work' }
    ],
    priorities: [
      { id: '1', name: 'Critical', description: 'Critical priority' },
      { id: '2', name: 'High', description: 'High priority' },
      { id: '3', name: 'Medium', description: 'Medium priority' },
      { id: '4', name: 'Low', description: 'Low priority' }
    ],
    users: [
      { accountId: 'sample', displayName: 'Sample User', emailAddress: 'user@company.com' }
    ],
    customFields: [
      { id: 'customfield_10000', name: 'Customer Facing', type: 'string' },
      { id: 'customfield_10001', name: 'Epic Link', type: 'string' },
      { id: 'customfield_10002', name: 'Sprint', type: 'array' }
    ],
    statusCategories: [
      { key: 'new', name: 'To Do', colorName: 'blue-gray' },
      { key: 'indeterminate', name: 'In Progress', colorName: 'yellow' },
      { key: 'done', name: 'Done', colorName: 'green' }
    ],
    components: [
      'Designosaur',
      'Brandwagon'
    ],
    labels: [
      'customer-facing',
      'product-update',
      'urgent',
      'customer-request',
      'bug-fix',
      'enhancement',
      'security',
      'performance',
      'ui-improvement',
      'api-change',
      'mobile',
      'web-app',
      'backend',
      'frontend'
    ]
  };
}