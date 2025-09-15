import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Order, OrderDocument } from '../schemas/order.schema';
import { CreatePaymentDto } from './dto/payment.dto';

@Injectable()
export class PaymentService {
  private readonly pgKey = 'edvtest01';
  private readonly apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0cnVzdGVlSWQiOiI2NWIwZTU1MmRkMzE5NTBhOWI0MWM1YmEiLCJJbmRleE9mQXBpS2V5Ijo2LCJpYXQiOjE3MTE2MjIyNzAsImV4cCI6MTc0MzE3OTg3MH0.Rye77Dp59GGxwCmwWekJHRj6edXWJnff9finjMhxKuw';
  private readonly schoolId = '65b0e6293e9f76a9694d84b4';
  private readonly paymentApiUrl = 'https://staging.edviron.com/api';

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
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
}