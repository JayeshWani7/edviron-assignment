import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { method, url, ip, body, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const startTime = Date.now();

    this.logger.log(`Incoming Request: ${method} ${url} - ${ip} - ${userAgent}`);
    
    // Log request body for POST/PUT/PATCH requests (excluding sensitive data)
    if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
      const sanitizedBody = this.sanitizeBody(body);
      this.logger.debug(`Request Body: ${JSON.stringify(sanitizedBody)}`);
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseTime = Date.now() - startTime;
          this.logger.log(`Response: ${method} ${url} - ${response.statusCode} - ${responseTime}ms`);
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;
          this.logger.error(`Error Response: ${method} ${url} - ${error.status || 500} - ${responseTime}ms - ${error.message}`);
        },
      }),
    );
  }

  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') return body;

    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }

    return sanitized;
  }
}