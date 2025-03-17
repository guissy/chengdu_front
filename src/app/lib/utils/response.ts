import { NextResponse } from 'next/server'

interface SuccessResponse<T> {
  code: 200
  data: T
}

interface ErrorResponse {
  code: number
  message: string
  errors?: unknown
}

export function successResponse<T>(data: T): NextResponse<SuccessResponse<T>> {
  return NextResponse.json({
    code: 200,
    data,
  })
}

export function errorResponse(
  message: string,
  statusCode: number = 500,
  errors?: unknown
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      code: statusCode,
      message,
      ...(errors ? { errors } : {}),
    },
    { status: statusCode } as ResponseInit
  )
} 