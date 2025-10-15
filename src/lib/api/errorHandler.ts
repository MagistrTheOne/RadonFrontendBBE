import { NextResponse } from 'next/server';

export interface ApiError {
  error: string;
  message?: string;
  details?: any;
  statusCode: number;
}

export class ApiErrorHandler {
  static handle(error: unknown): NextResponse {
    console.error('API Error:', error);

    // JSON parse errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: 'Invalid JSON format',
          message: 'The request body contains invalid JSON'
        },
        { status: 400 }
      );
    }

    // Network/connection errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        {
          error: 'Network error',
          message: 'Unable to connect to external service'
        },
        { status: 503 }
      );
    }

    // Timeout errors
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        {
          error: 'Request timeout',
          message: 'The request took too long to complete'
        },
        { status: 408 }
      );
    }

    // Custom API errors
    if (error instanceof Error && error.message.includes('API error')) {
      const statusMatch = error.message.match(/(\d{3})/);
      const statusCode = statusMatch ? parseInt(statusMatch[1]) : 500;
      
      return NextResponse.json(
        {
          error: 'External API error',
          message: 'An error occurred while processing your request'
        },
        { status: statusCode }
      );
    }

    // Authentication errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Authentication required'
        },
        { status: 401 }
      );
    }

    // Default server error
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }

  static validateJson<T>(json: any, schema: (data: any) => data is T): T {
    if (!schema(json)) {
      throw new Error('Invalid request format');
    }
    return json;
  }

  static async safeJsonParse(request: Request): Promise<any> {
    try {
      return await request.json();
    } catch (error) {
      throw new SyntaxError('Invalid JSON in request body');
    }
  }
}
