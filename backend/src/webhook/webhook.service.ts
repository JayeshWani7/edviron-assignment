import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../schemas/order.schema';
import { OrderStatus, OrderStatusDocument } from '../schemas/order-status.schema';
import { WebhookLog, WebhookLogDocument } from '../schemas/webhook-log.schema';
import { WebhookDto } from './dto/webhook.dto';

@Injectable()
export class WebhookService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(OrderStatus.name) private orderStatusModel: Model<OrderStatusDocument>,
    @InjectModel(WebhookLog.name) private webhookLogModel: Model<WebhookLogDocument>,
  ) {}

  async processWebhook(webhookDto: WebhookDto) {
    try {
      // Log the incoming webhook
      const webhookLog = new this.webhookLogModel({
        order_id: webhookDto.order_info.order_id,
        status_code: webhookDto.status,
        payload: webhookDto,
        source: 'payment_gateway',
        processing_status: 'received',
      });

      await webhookLog.save();

      // Find the order by custom_order_id
      const order = await this.orderModel.findOne({ 
        custom_order_id: webhookDto.order_info.order_id 
      });

      if (!order) {
        await this.webhookLogModel.findByIdAndUpdate(webhookLog._id, {
          processing_status: 'failed',
          error_message: 'Order not found',
        });
        
        throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
      }

      // Update or create order status
      const existingOrderStatus = await this.orderStatusModel.findOne({ 
        collect_id: order._id 
      });

      const orderStatusData = {
        collect_id: order._id,
        order_amount: webhookDto.order_info.order_amount,
        transaction_amount: webhookDto.order_info.transaction_amount,
        payment_mode: webhookDto.order_info.payment_mode,
        payment_details: webhookDto.order_info.payemnt_details, // Note: typo in the API spec
        bank_reference: webhookDto.order_info.bank_reference,
        payment_message: webhookDto.order_info.Payment_message,
        status: webhookDto.order_info.status,
        error_message: webhookDto.order_info.error_message || 'NA',
        payment_time: new Date(webhookDto.order_info.payment_time),
      };

      if (existingOrderStatus) {
        await this.orderStatusModel.findByIdAndUpdate(
          existingOrderStatus._id,
          orderStatusData
        );
      } else {
        const orderStatus = new this.orderStatusModel(orderStatusData);
        await orderStatus.save();
      }

      // Update order status
      await this.orderModel.findByIdAndUpdate(order._id, {
        status: webhookDto.order_info.status,
      });

      // Update webhook log as processed
      await this.webhookLogModel.findByIdAndUpdate(webhookLog._id, {
        processing_status: 'processed',
      });

      return {
        success: true,
        message: 'Webhook processed successfully',
        order_id: webhookDto.order_info.order_id,
      };

    } catch (error) {
      console.error('Webhook processing error:', error);
      
      throw new HttpException(
        error.message || 'Error processing webhook',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getWebhookLogs(limit: number = 50, page: number = 1) {
    try {
      const skip = (page - 1) * limit;
      
      const logs = await this.webhookLogModel
        .find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .exec();

      const total = await this.webhookLogModel.countDocuments();

      return {
        logs,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new HttpException(
        'Error fetching webhook logs',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}