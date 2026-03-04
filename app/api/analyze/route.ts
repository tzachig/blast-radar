import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { identity, nodes, riskScore } = await request.json();

    if (!identity) {
      return NextResponse.json(
        { error: 'Identity is required' },
        { status: 400 }
      );
    }

    // Generate AI narrative
    const prompt = `You are a cybersecurity analyst. Analyze this security incident:

Compromised Identity: ${identity}
Risk Score: ${riskScore}/100
Accessible Resources: ${nodes
      .filter((n: any) => n.type === 'sensitive')
      .map((n: any) => n.label)
      .join(', ')}
Lateral Movement Targets: ${nodes
      .filter((n: any) => n.type === 'lateral')
      .map((n: any) => n.label)
      .join(', ')}
Peer Accounts at Risk: ${nodes
      .filter((n: any) => n.type === 'peer')
      .map((n: any) => n.label)
      .join(', ')}

Provide:
1. A 2-3 sentence plain English explanation of this blast radius
2. Three specific, actionable remediation recommendations

Format as JSON:
{
  "narrative": "...",
  "recommendations": ["...", "...", "..."]
}`;

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      {
        narrative:
          'Unable to generate analysis at this time. Please check your API key configuration.',
        recommendations: [
          'Review access logs for suspicious activity',
          'Reset credentials for the compromised identity',
          'Audit all systems accessed by this account',
        ],
      },
      { status: 200 } // Return mock data instead of error
    );
  }
}
