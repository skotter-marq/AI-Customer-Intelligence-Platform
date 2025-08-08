import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase-client';

/**
 * AI Analysis API - Routes AI prompts from the admin system
 * Called by webhook and other services to run AI analysis using stored prompts
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { promptId, variables } = body;

    if (!promptId || !variables) {
      return NextResponse.json(
        { error: 'promptId and variables are required' },
        { status: 400 }
      );
    }

    console.log(`🧠 Running AI analysis with prompt: ${promptId}`);

    // Get the AI prompt from database
    if (!supabase) {
      throw new Error('Database connection not available');
    }

    const { data: prompt, error: promptError } = await supabase
      .from('ai_prompts')
      .select('*')
      .eq('id', promptId)
      .eq('enabled', true)
      .single();

    if (promptError || !prompt) {
      return NextResponse.json(
        { error: `AI prompt '${promptId}' not found or disabled` },
        { status: 404 }
      );
    }

    // Replace variables in the prompt template
    let processedPrompt = prompt.user_prompt_template;
    const processedSystemInstructions = prompt.system_instructions || '';

    // Replace all variables in the format {variable_name}
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      processedPrompt = processedPrompt.replace(regex, String(value || ''));
    }

    // Call AI service (Anthropic Claude)
    const aiResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: prompt.parameters?.model || 'claude-3-5-sonnet-20241022',
        max_tokens: prompt.parameters?.maxTokens || 4000,
        temperature: prompt.parameters?.temperature || 0.3,
        system: processedSystemInstructions,
        messages: [
          {
            role: 'user',
            content: processedPrompt
          }
        ]
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API error: ${aiResponse.status} - ${errorText}`);
    }

    const aiResult = await aiResponse.json();
    const aiContent = aiResult.content[0]?.text;

    if (!aiContent) {
      throw new Error('No content returned from AI');
    }

    // Parse JSON response
    let analysis;
    try {
      // Clean up the response - sometimes AI adds markdown formatting
      const cleanContent = aiContent.replace(/```json\n?/g, '').replace(/\n?```/g, '').trim();
      analysis = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      throw new Error('AI returned invalid JSON format');
    }

    // Update usage count in database
    await supabase
      .from('ai_prompts')
      .update({ 
        usage_count: (prompt.usage_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', promptId);

    console.log(`✅ AI analysis completed for prompt: ${promptId}`);

    return NextResponse.json({
      success: true,
      promptId,
      analysis,
      metadata: {
        model: prompt.parameters?.model || 'claude-3-5-sonnet-20241022',
        temperature: prompt.parameters?.temperature || 0.3,
        processed_variables: Object.keys(variables).length,
        response_length: aiContent.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ AI analysis failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'AI analysis failed' },
      { status: 500 }
    );
  }
}