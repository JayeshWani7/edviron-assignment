import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Order, OrderDocument } from '../schemas/order.schema';
import { PaymentTransaction, PaymentTransactionDocument } from '../schemas/payment-transaction.schema';
import { CreatePaymentDto, CreateCollectRequestDto, CheckPaymentStatusDto } from './dto/payment.dto';
import { JwtUtilService } from './jwt-util.service';

@Injectable()
export class PaymentService {
  private readonly pgKey = 'edvtest01';
  private readonly apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0cnVzdGVlSWQiOiI2NWIwZTU1MmRkMzE5NTBhOWI0MWM1YmEiLCJJbmRleE9mQXBpS2V5Ijo2LCJpYXQiOjE3MTE2MjIyNzAsImV4cCI6MTc0MzE3OTg3MH0.Rye77Dp59GGxwCmwWekJHRj6edXWJnff9finjMhxKuw';
  private readonly schoolId = '65b0e6293e9f76a9694d84b4';
  private readonly paymentApiUrl = 'https://staging.edviron.com/api';
  private readonly edvironApiUrl = 'https://dev-vanilla.edviron.com/erp';

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(PaymentTransaction.name) private paymentTransactionModel: Model<PaymentTransactionDocument>,
    private configService: ConfigService,
    private jwtUtilService: JwtUtilService,
  ) {}

  async createPayment(createPaymentDto: CreatePaymentDto) {
    try {
      // Generate unique custom order ID
      const customOrderId = `EDV_${Date.now()}_${uuidv4().substring(0, 8)}`;

      // Create order in database
      const order = new this.orderModel({
        school_id: createPaymentDto.school_id || this.schoolId,
        trustee_id: createPaymentDto.trustee_id,
        student_info: createPaymentDto.student_info,
        gateway_name: createPaymentDto.gateway_name,
        custom_order_id: customOrderId,
        status: 'pending',
      });

      const savedOrder = await order.save();

      // Prepare payment request payload
      const paymentPayload = {
        pg_key: this.pgKey,
        school_id: createPaymentDto.school_id || this.schoolId,
        trustee_id: createPaymentDto.trustee_id,
        custom_order_id: customOrderId,
        amount: createPaymentDto.amount,
        currency: createPaymentDto.currency || 'INR',
        description: createPaymentDto.description || `Payment for ${createPaymentDto.student_info.name}`,
        student_info: createPaymentDto.student_info,
        gateway_name: createPaymentDto.gateway_name,
        success_url: process.env.SUCCESS_URL || 'http://localhost:3000/payment/success',
        failure_url: process.env.FAILURE_URL || 'http://localhost:3000/payment/failure',
        webhook_url: process.env.WEBHOOK_URL || 'http://localhost:3000/webhook',
      };

      // Create JWT signed payload
      const jwtPayload = jwt.sign(paymentPayload, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: '1h',
      });

      // Make API call to payment gateway
      const response = await axios.post(
        `${this.paymentApiUrl}/create-collect-request`,
        {
          ...paymentPayload,
          jwt_token: jwtPayload,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data && response.data.success) {
        // Update order with payment gateway response
        await this.orderModel.findByIdAndUpdate(savedOrder._id, {
          status: 'initiated',
        });

        return {
          success: true,
          order_id: customOrderId,
          collect_id: savedOrder._id,
          payment_url: response.data.payment_url,
          gateway_response: response.data,
        };
      } else {
        throw new HttpException('Payment initiation failed', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      console.error('Payment creation error:', error);
      
      if (error.response) {
        throw new HttpException(
          `Payment gateway error: ${error.response.data.message || error.response.data}`,
          error.response.status || HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
      
      throw new HttpException(
        error.message || 'Internal server error during payment creation',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getPaymentStatus(customOrderId: string) {
    try {
      const order = await this.orderModel.findOne({ custom_order_id: customOrderId });
      
      if (!order) {
        throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
      }

      return {
        custom_order_id: customOrderId,
        status: order.status,
        order_details: order,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error fetching payment status',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Create payment link using Edviron API
   */
  async createCollectRequest(createCollectRequestDto: CreateCollectRequestDto) {
    try {
      const apiKey = this.configService.get<string>('EDVIRON_API_KEY') || this.apiKey;
      
      const response = await axios.post(
        `${this.edvironApiUrl}/create-collect-request`,
        createCollectRequestDto,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Create collect request error:', error);
      
      if (error.response) {
        throw new HttpException(
          `Edviron API error: ${error.response.data?.message || error.response.statusText}`,
          error.response.status || HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
      
      throw new HttpException(
        'Failed to create collect request',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Check payment status using Edviron API
   */
  async checkPaymentStatus(checkPaymentStatusDto: CheckPaymentStatusDto) {
    try {
      const apiKey = this.configService.get<string>('EDVIRON_API_KEY') || this.apiKey;
      const { collect_request_id, school_id, sign } = checkPaymentStatusDto;

      const url = `${this.edvironApiUrl}/collect-request/${collect_request_id}`;
      const params = new URLSearchParams({
        school_id,
        sign,
      });

      const response = await axios.get(`${url}?${params}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Check payment status error:', error);
      
      if (error.response) {
        throw new HttpException(
          `Edviron API error: ${error.response.data?.message || error.response.statusText}`,
          error.response.status || HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
      
      throw new HttpException(
        'Failed to check payment status',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Helper method to create a collect request with auto-generated JWT
   */
  async createCollectRequestWithJWT(school_id: string, amount: string, callback_url: string) {
    try {
      // Generate JWT sign
      const sign = this.jwtUtilService.generateCreateRequestSign(school_id, amount, callback_url);

      // Create collect request
      const collectRequestDto: CreateCollectRequestDto = {
        school_id,
        amount,
        callback_url,
        sign,
      };

      const response = await this.createCollectRequest(collectRequestDto);

      // If successful, save payment transaction to database
      if (response.success && response.data) {
        const paymentTransaction = new this.paymentTransactionModel({
          collect_request_id: response.data.collect_request_id || response.data.id,
          school_id,
          amount: parseFloat(amount),
          callback_url,
          payment_url: response.data.collect_request_url || response.data.Collect_request_url,
          jwt_sign: sign,
          status: 'initiated',
          metadata: {
            created_at: new Date(),
            api_response: response.data
          }
        });

        await paymentTransaction.save();
        console.log('✅ Payment transaction saved to database:', paymentTransaction._id);
      }

      return response;
    } catch (error) {
      console.error('❌ Error in createCollectRequestWithJWT:', error);
      throw new HttpException(
        `Failed to create collect request: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Helper method to check payment status with auto-generated JWT
   */
  async checkPaymentStatusWithJWT(collect_request_id: string, school_id: string) {
    try {
      // Generate JWT sign
      const sign = this.jwtUtilService.generateStatusCheckSign(school_id, collect_request_id);

      // Check payment status
      const checkStatusDto: CheckPaymentStatusDto = {
        collect_request_id,
        school_id,
        sign,
      };

      return await this.checkPaymentStatus(checkStatusDto);
    } catch (error) {
      throw new HttpException(
        `Failed to check payment status: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Update payment status in database
   */
  async updatePaymentStatus(collect_request_id: string, status: string, paymentDetails?: any) {
    try {
      const paymentTransaction = await this.paymentTransactionModel.findOne({
        collect_request_id
      });

      if (!paymentTransaction) {
        throw new Error(`Payment transaction not found for collect_request_id: ${collect_request_id}`);
      }

      // Update payment status and details
      paymentTransaction.status = status;
      if (paymentDetails) {
        paymentTransaction.payment_mode = paymentDetails.payment_mode;
        paymentTransaction.bank_reference = paymentDetails.bank_reference;
        paymentTransaction.gateway_response = paymentDetails.gateway_response;
        paymentTransaction.payment_details = paymentDetails;
      }

      await paymentTransaction.save();
      console.log(`✅ Payment status updated to ${status} for collect_request_id: ${collect_request_id}`);
      
      return paymentTransaction;
    } catch (error) {
      console.error('❌ Error updating payment status:', error);
      throw new HttpException(
        `Failed to update payment status: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get payment status from database
   */
  async getPaymentTransactionStatus(collect_request_id: string) {
    try {
      const paymentTransaction = await this.paymentTransactionModel.findOne({
        collect_request_id
      });

      if (!paymentTransaction) {
        throw new Error(`Payment transaction not found for collect_request_id: ${collect_request_id}`);
      }

      return paymentTransaction;
    } catch (error) {
      console.error('❌ Error getting payment status:', error);
      throw new HttpException(
        `Failed to get payment status: ${error.message}`,
        HttpStatus.NOT_FOUND
      );
    }
  }
}