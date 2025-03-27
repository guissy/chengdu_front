import { middleware } from '../middleware'
import { NextRequest, NextResponse } from 'next/server'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// 模拟 fetch 函数
const mockFetch = vi.fn()
global.fetch = mockFetch

// 模拟 console.error
const mockConsoleError = vi.spyOn(console, 'error')

// 模拟 crypto.randomUUID
const mockRandomUUID = vi.fn()
global.crypto = {
  ...global.crypto,
  randomUUID: mockRandomUUID,
}

describe('Audit Log Middleware', () => {
  beforeEach(() => {
    // 重置所有模拟函数
    vi.clearAllMocks()
    
    // 设置默认的 mockRandomUUID 返回值
    mockRandomUUID.mockReturnValue('test-uuid')
    
    // 设置默认的 fetch 响应
    mockFetch.mockResolvedValue(new Response(JSON.stringify({ success: true }), {
      status: 200,
    }))

    // 设置环境变量
    process.env.WEBHOOK_SECRET = 'test-secret'
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('应该跳过 /api/webhook 路径的请求', async () => {
    const request = new NextRequest(new URL('http://localhost:3000/api/webhook/test'))
    const response = await middleware(request)
    
    expect(mockFetch).not.toHaveBeenCalled()
    expect(response).toBeInstanceOf(NextResponse)
  })

  it('应该为普通路由请求发送审计日志', async () => {
    const url = new URL('http://localhost:3000/some/path?param=value')
    const request = new NextRequest(url, {
      method: 'GET',
      headers: {
        'user-agent': 'test-agent',
        'x-forwarded-for': '127.0.0.1',
      },
    })

    // 模拟 cookies
    Object.defineProperty(request, 'cookies', {
      get: () => ({
        get: (name: string) => ({
          value: name === 'userId' ? 'test-user' : 'Test User',
        }),
      }),
    })

    await middleware(request)

    // 验证 fetch 调用
    expect(mockFetch).toHaveBeenCalledTimes(1)
    const [url1, options] = mockFetch.mock.calls[0]
    
    expect(url1).toBe('http://localhost:3000/api/webhook/audit-log')
    expect(options.method).toBe('POST')
    expect(options.headers['x-webhook-secret']).toBe('test-secret')
    
    const payload = JSON.parse(options.body)
    expect(payload).toMatchObject({
      id: 'test-uuid',
      operationType: 'GET',
      targetType: 'route',
      targetId: '/some/path',
      operatorId: 'test-user',
      operatorName: 'Test User',
      ipAddress: '127.0.0.1',
      userAgent: 'test-agent',
      details: {
        query: { param: 'value' },
      },
    })
  })

  it('应该处理审计日志发送失败的情况', async () => {
    // 模拟 fetch 失败
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const request = new NextRequest(new URL('http://localhost:3000/test'))
    await middleware(request)

    expect(mockConsoleError).toHaveBeenCalledWith(
      'Error in audit log middleware:',
      expect.any(Error)
    )
  })

  it('应该处理审计日志响应不成功的情况', async () => {
    // 模拟 webhook 响应失败
    mockFetch.mockResolvedValueOnce(new Response('Invalid webhook secret', {
      status: 401,
    }))

    const request = new NextRequest(new URL('http://localhost:3000/test'))
    await middleware(request)

    expect(mockConsoleError).toHaveBeenCalledWith(
      'Failed to send audit log:',
      'Invalid webhook secret'
    )
  })
}) 