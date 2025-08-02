import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase-client';
import crypto from 'crypto';

interface SubscriptionRequest {
  email: string;
  name?: string;
  preferences?: {
    categories?: string[];
    tags?: string[];
    frequency?: 'immediate' | 'daily' | 'weekly';
  };
}

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
  }

  try {
    const body: SubscriptionRequest = await request.json();
    const { email, name, preferences } = body;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    // Generate unsubscribe token
    const unsubscribeToken = crypto.randomBytes(32).toString('hex');

    // Check if user already exists
    const { data: existingSubscriber, error: checkError } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking existing subscriber:', checkError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (existingSubscriber) {
      // Update existing subscriber
      const { error: updateError } = await supabase
        .from('newsletter_subscribers')
        .update({
          name: name || existingSubscriber.name,
          preferences: preferences || existingSubscriber.preferences,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('email', email);

      if (updateError) {
        console.error('Error updating subscriber:', updateError);
        return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Subscription updated successfully!',
        isExisting: true
      });
    } else {
      // Create new subscriber
      const { error: insertError } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email,
          name,
          preferences: preferences || {
            categories: ['Added', 'Improved', 'Fixed'],
            tags: [],
            frequency: 'weekly'
          },
          unsubscribe_token: unsubscribeToken,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error creating subscriber:', insertError);
        return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Successfully subscribed to Marq product updates!',
        isExisting: false
      });
    }

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'stats') {
      // Get subscription stats
      const { data: stats, error } = await supabase
        .from('newsletter_subscribers')
        .select('is_active, created_at')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
      }

      const totalSubscribers = stats?.length || 0;
      const recentSubscribers = stats?.filter(sub => {
        const createdAt = new Date(sub.created_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return createdAt >= thirtyDaysAgo;
      }).length || 0;

      return NextResponse.json({
        success: true,
        stats: {
          total: totalSubscribers,
          recent: recentSubscribers
        }
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Newsletter API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}