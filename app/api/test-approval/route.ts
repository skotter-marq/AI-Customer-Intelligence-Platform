import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase-client';

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
  }
  
  try {
    // Create test content for approval workflow
    const testContent = [
      {
        content_title: 'New API Rate Limiting Feature',
        generated_content: 'We are excited to announce the launch of our new API rate limiting feature. This enhancement provides better control over API usage and helps prevent abuse while ensuring fair access for all users.\n\nKey benefits:\n- Improved API stability\n- Better resource management\n- Enhanced security\n- Fair usage policies\n\nThis update is now available in all regions and will be gradually rolled out to existing customers.',
        content_type: 'feature_release',
        target_audience: 'developers',
        quality_score: 0.85,
        status: 'review',
        approval_status: 'pending',
        tldr_summary: 'New API rate limiting feature provides better control and stability for all users.',
        tldr_bullet_points: [
          'Improved API stability and performance',
          'Better resource management capabilities',
          'Enhanced security features',
          'Fair usage policies for all users'
        ],
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        content_title: 'Dashboard Performance Improvements',
        generated_content: 'We have implemented significant performance improvements to our dashboard interface. Users can now expect faster load times, smoother navigation, and improved responsiveness across all devices.\n\nImprovements include:\n- 40% faster page load times\n- Reduced memory usage\n- Optimized data fetching\n- Better mobile experience\n\nThese changes are part of our ongoing commitment to providing the best user experience possible.',
        content_type: 'performance_improvement',
        target_audience: 'customers',
        quality_score: 0.75,
        status: 'review',
        approval_status: 'pending',
        tldr_summary: 'Dashboard performance improvements deliver 40% faster load times and better user experience.',
        tldr_bullet_points: [
          '40% faster page load times',
          'Reduced memory usage',
          'Optimized data fetching',
          'Better mobile experience'
        ],
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        content_title: 'Security Update - Multi-Factor Authentication',
        generated_content: 'We have enhanced our security measures by implementing mandatory multi-factor authentication (MFA) for all user accounts. This critical update helps protect your data and ensures secure access to your account.\n\nWhat this means:\n- All users must enable MFA\n- Supported methods: SMS, email, authenticator apps\n- Gradual rollout over next 30 days\n- Enhanced account protection\n\nPlease enable MFA on your account as soon as possible to maintain uninterrupted access.',
        content_type: 'security_update',
        target_audience: 'customers',
        quality_score: 0.92,
        status: 'review',
        approval_status: 'pending',
        tldr_summary: 'Mandatory multi-factor authentication enhances security for all user accounts.',
        tldr_bullet_points: [
          'Mandatory MFA for all accounts',
          'Multiple authentication methods supported',
          'Gradual 30-day rollout',
          'Enhanced account protection'
        ],
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      },
      {
        content_title: 'Integration with Slack - Beta Release',
        generated_content: 'We are pleased to announce the beta release of our Slack integration. This new feature allows you to receive notifications and interact with our platform directly from your Slack workspace.\n\nBeta features:\n- Real-time notifications\n- Command shortcuts\n- Direct messaging support\n- Webhook integrations\n\nThis is a beta release, so please report any issues you encounter. We plan to make this generally available in Q2.',
        content_type: 'integration_update',
        target_audience: 'customers',
        quality_score: 0.68,
        status: 'review',
        approval_status: 'pending',
        tldr_summary: 'Beta Slack integration enables real-time notifications and workspace interactions.',
        tldr_bullet_points: [
          'Real-time notifications in Slack',
          'Command shortcuts available',
          'Direct messaging support',
          'Webhook integrations included'
        ],
        created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
      },
      {
        content_title: 'Customer Success Story - TechCorp',
        generated_content: 'We are thrilled to share the success story of TechCorp, who achieved remarkable results using our platform. Over the past 6 months, they have seen significant improvements in their operational efficiency and customer satisfaction.\n\nResults achieved:\n- 50% reduction in response time\n- 35% increase in customer satisfaction\n- 60% improvement in team productivity\n- 25% cost savings\n\nTechCorp\'s CTO commented: "This platform has transformed how we operate. The results speak for themselves."\n\nRead the full case study to learn more about their journey.',
        content_type: 'customer_communication',
        target_audience: 'prospects',
        quality_score: 0.81,
        status: 'review',
        approval_status: 'approved',
        reviewer_id: 'marketing_team',
        review_comments: 'Great success story with strong metrics. Approved for publication.',
        review_date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        published_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        tldr_summary: 'TechCorp achieved 50% faster response times and 35% higher customer satisfaction.',
        tldr_bullet_points: [
          '50% reduction in response time',
          '35% increase in customer satisfaction',
          '60% improvement in team productivity',
          '25% cost savings achieved'
        ],
        created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Insert test content
    const { data, error } = await supabase
      .from('generated_content')
      .insert(testContent)
      .select();

    if (error) {
      console.error('Error inserting test content:', error);
      return NextResponse.json(
        { error: 'Failed to create test content' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Created ${testContent.length} test content items for approval workflow`,
      content: data
    });

  } catch (error) {
    console.error('Test approval API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
  }
  
  try {
    // Clean up test content
    const { error } = await supabase
      .from('generated_content')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all except a non-existent ID

    if (error) {
      console.error('Error deleting test content:', error);
      return NextResponse.json(
        { error: 'Failed to delete test content' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Test content deleted successfully'
    });

  } catch (error) {
    console.error('Test approval DELETE API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}