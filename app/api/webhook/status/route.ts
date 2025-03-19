import { NextResponse } from 'next/server';

function isWebhookEnabled(): boolean {
  return process.env.WEBHOOK_ENABLED === 'true';
}

function getWebhookEndpoint(): string | null {
  return process.env.WEBHOOK_ENDPOINT || null;
}

export async function GET() {
  try {
    return NextResponse.json({
      enabled: isWebhookEnabled(),
      endpoint: getWebhookEndpoint()
    });
  } catch (error) {
    console.error('Error getting webhook status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 