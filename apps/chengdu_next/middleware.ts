import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { OperationTarget, OperationType } from '@prisma/client';
import { match, P } from 'ts-pattern';
import { emitterSalt } from '@/lib/emitter';
import { cookies } from 'next/headers';

export async function middleware(request: NextRequest, response: NextResponse) {
  // 跳过 /api/webhook /api/dashboard 路径的请求
  const pathname = request.nextUrl.pathname;
  cookies().then(cookies => cookies.set("emitterSalt", emitterSalt));

  if (['webhook', 'dashboard', 'auditLog', 'stream', 'sse', 'health'].some(path => new RegExp(`^(\/api)?\/${path}\\b`).test(pathname))) {
    const res = NextResponse.next()
    res.headers.set("X-Emitter-Salt", emitterSalt);
    return res;
  }
  const paths = request.nextUrl.pathname
    .replace('/api', '')
    .split('/').filter(Boolean);

    const operationType = match({ module: paths?.[0], method: request.method, action: paths?.[1] })
    .with(P.union({ method: 'GET'}, {action: 'list' }), () => {
      return OperationType.BROWSE
    })
    .with({ method: 'POST', action: 'add' }, () => {
      return OperationType.CREATE
    })
    .with({ method: 'POST', action: 'delete' }, () => {
      return OperationType.DELETE
    })
    .with({ method: 'POST', action: 'update' }, () => {
      return OperationType.UPDATE
    })
    .otherwise(() => {
      return OperationType.BROWSE
    })
  const targetTypeActionMap = {
    [OperationType.BROWSE]: '浏览',
    [OperationType.CREATE]: '新增',
    [OperationType.DELETE]: '删除',
    [OperationType.UPDATE]: '编辑',
  }
  const action = targetTypeActionMap[operationType as keyof typeof targetTypeActionMap]
  try {
    // 准备审计日志数据
    const auditLogPayload = {
      id: crypto.randomUUID(),
      operationType: operationType,
      targetType: paths?.[0]?.toUpperCase() || OperationTarget.DASHBOARD,
      targetId: request.nextUrl.pathname,
      targetName: request.nextUrl.pathname,
      content: `${action}: ${request.method} ${request.nextUrl.pathname}`,
      operatorId: request.cookies.get('userId')?.value || 'anonymous',
      operatorName: request.cookies.get('userName')?.value || 'anonymous',
      operationTime: new Date().toISOString(),
      details: {
        query: Object.fromEntries(request.nextUrl.searchParams.entries()),
        headers: Object.fromEntries(request.headers.entries()),
      },
      ipAddress: request.headers.get('x-forwarded-for') || null,
      userAgent: request.headers.get('user-agent'),
    }

    // 发送审计日志
    const webhookResponse = await fetch(`${request.nextUrl.origin}/api/webhook/audit-log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': process.env.WEBHOOK_SECRET || '',
      },
      body: JSON.stringify(auditLogPayload),
    })

    if (!webhookResponse.ok) {
      console.error('Failed to send audit log:', await webhookResponse.text())
    }
  } catch (error) {
    console.error('Error in audit log middleware:', error)
  }

  // 继续处理请求
  const res = NextResponse.next()
  res.headers.set("X-Emitter-Salt", emitterSalt);
  return res;
}

// 配置中间件匹配的路由
export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了:
     * /api/webhook/* - webhook 相关的路由
     * /_next/* - Next.js 静态文件
     * /favicon.ico, /sitemap.xml 等静态文件
     */
    '/((?!api/webhook|_next/|favicon.ico|sitemap.xml).*)',
  ],
}
