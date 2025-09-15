import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtUtilService {
  constructor(private configService: ConfigService) {}

  /**
   * Sign a JWT token using the PG secret key
   * @param payload - The payload to sign
   * @returns Signed JWT token
   */
  signPayment(payload: any): string {
    const pgSecretKey = this.configService.get<string>('PG_SECRET_KEY');
    if (!pgSecretKey) {
      throw new Error('PG_SECRET_KEY is not configured');
    }

    console.log('JWT Signing Debug:');
    console.log('- Secret Key:', pgSecretKey);
    console.log('- Payload:', JSON.stringify(payload));
    
    const token = jwt.sign(payload, pgSecretKey, { 
      algorithm: 'HS256',
      noTimestamp: true  // Remove automatic iat timestamp
    });
    console.log('- Generated Token:', token);
    
    return token;
  }

  /**
   * Verify a JWT token using the PG secret key
   * @param token - The JWT token to verify
   * @returns Decoded payload
   */
  verifyPayment(token: string): any {
    const pgSecretKey = this.configService.get<string>('PG_SECRET_KEY');
    if (!pgSecretKey) {
      throw new Error('PG_SECRET_KEY is not configured');
    }

    try {
      return jwt.verify(token, pgSecretKey);
    } catch (error) {
      throw new Error(`Invalid JWT token: ${error.message}`);
    }
  }

  /**
   * Generate JWT sign for create collect request
   * @param school_id - School ID
   * @param amount - Amount in INR
   * @param callback_url - Callback URL
   * @returns Signed JWT token
   */
  generateCreateRequestSign(school_id: string, amount: string, callback_url: string): string {
    const payload = {
      school_id,
      amount,
      callback_url,
    };

    return this.signPayment(payload);
  }

  /**
   * Generate JWT sign for payment status check
   * @param school_id - School ID
   * @param collect_request_id - Collect request ID
   * @returns Signed JWT token
   */
  generateStatusCheckSign(school_id: string, collect_request_id: string): string {
    const payload = {
      school_id,
      collect_request_id,
    };

    return this.signPayment(payload);
  }
}