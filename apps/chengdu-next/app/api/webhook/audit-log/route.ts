import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { OperationTarget, OperationType, Prisma } from '@prisma/client';
import { emitter } from '@/lib/emitter';

export interface AuditLogPayload {
  id: string;
  operationType: string;
  targetType: string;
  targetId: string;
  targetName: string;
  content: string;
  operatorId: string;
  operatorName: string;
  operationTime: string;
  details: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string | null;
}

function validateWebhookSecret(request: NextRequest): boolean {
  const webhookSecret = process.env.WEBHOOK_SECRET;
  const requestSecret = request.headers.get('x-webhook-secret');

  if (!webhookSecret || !requestSecret) {
    return false;
  }

  return webhookSecret === requestSecret;
}

function isWebhookEnabled(): boolean {
  return process.env.WEBHOOK_ENABLED === 'true';
}

export async function POST(request: NextRequest) {
  // Check if webhook is enabled
  if (!isWebhookEnabled()) {
    return NextResponse.json(
      { error: 'Webhook is not enabled' },
      { status: 400 }
    );
  }

  // Validate webhook secret
  if (!validateWebhookSecret(request)) {
    return NextResponse.json(
      { error: 'Invalid webhook secret' },
      { status: 401 }
    );
  }

  try {
    // Parse and validate request body
    const payload: AuditLogPayload = await request.json();

    // Validate required fields
    const requiredFields: (keyof AuditLogPayload)[] = [
      'id', 'operationType', 'targetType', 'targetId', 'targetName',
      'content', 'operatorId', 'operatorName', 'operationTime'
    ];

    for (const field of requiredFields) {
      if (!payload[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Extract IP and user agent if not provided
    if (!payload.ipAddress) {
      payload.ipAddress = request.headers.get('x-forwarded-for') || null;
    }

    if (!payload.userAgent) {
      payload.userAgent = request.headers.get('user-agent');
    }

    const log = await prisma.auditLog.create({
      data: {
        operationType: payload.operationType as OperationType,
        targetType: payload.targetType as OperationTarget,
        targetId: payload.targetId,
        targetName: payload.targetName,
        operatorId: payload.operatorId,
        operatorName: payload.operatorName,
        content: payload.content,
        details: payload.details as Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue,
        operationTime: payload.operationTime
      }
    });

    emitter.emit('newAuditLog', log);
    // For demonstration purposes, we're just returning success
    return NextResponse.json({
      success: true,
      logId: log.id
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
