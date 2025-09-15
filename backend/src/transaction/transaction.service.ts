import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../schemas/order.schema';
import { OrderStatus, OrderStatusDocument } from '../schemas/order-status.schema';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(OrderStatus.name) private orderStatusModel: Model<OrderStatusDocument>,
  ) {}

  async getAllTransactions(
    limit: number = 10,
    page: number = 1,
    sort: string = 'createdAt',
    order: string = 'desc',
  ) {
    try {
      const skip = (page - 1) * limit;
      const sortOrder = order === 'desc' ? -1 : 1;
      
      // MongoDB aggregation pipeline to join orders and order_status
      const pipeline = [
        {
          $lookup: {
            from: 'orderstatuses', // MongoDB collection name (pluralized)
            localField: '_id',
            foreignField: 'collect_id',
            as: 'order_status'
          }
        },
        {
          $unwind: {
            path: '$order_status',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            collect_id: '$_id',
            school_id: 1,
            gateway: '$gateway_name',
            order_amount: '$order_status.order_amount',
            transaction_amount: '$order_status.transaction_amount',
            status: '$order_status.status',
            custom_order_id: 1,
            student_info: 1,
            trustee_id: 1,
            payment_mode: '$order_status.payment_mode',
            payment_details: '$order_status.payment_details',
            bank_reference: '$order_status.bank_reference',
            payment_message: '$order_status.payment_message',
            error_message: '$order_status.error_message',
            payment_time: '$order_status.payment_time',
            createdAt: 1,
            updatedAt: 1
          }
        },
        {
          $sort: { [sort]: sortOrder }
        },
        {
          $skip: skip
        },
        {
          $limit: limit
        }
      ];

      const transactions = await this.orderModel.aggregate(pipeline as any);
      
      // Get total count for pagination
      const countPipeline = [
        {
          $lookup: {
            from: 'orderstatuses',
            localField: '_id',
            foreignField: 'collect_id',
            as: 'order_status'
          }
        },
        {
          $count: 'total'
        }
      ];
      
      const countResult = await this.orderModel.aggregate(countPipeline as any);
      const total = countResult[0]?.total || 0;

      return {
        transactions,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw new HttpException(
        'Error fetching transactions',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getTransactionsBySchool(
    schoolId: string,
    limit: number = 10,
    page: number = 1,
    sort: string = 'createdAt',
    order: string = 'desc',
  ) {
    try {
      const skip = (page - 1) * limit;
      const sortOrder = order === 'desc' ? -1 : 1;

      // MongoDB aggregation pipeline with school filter
      const pipeline = [
        {
          $match: { school_id: schoolId }
        },
        {
          $lookup: {
            from: 'orderstatuses',
            localField: '_id',
            foreignField: 'collect_id',
            as: 'order_status'
          }
        },
        {
          $unwind: {
            path: '$order_status',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            collect_id: '$_id',
            school_id: 1,
            gateway: '$gateway_name',
            order_amount: '$order_status.order_amount',
            transaction_amount: '$order_status.transaction_amount',
            status: '$order_status.status',
            custom_order_id: 1,
            student_info: 1,
            trustee_id: 1,
            payment_mode: '$order_status.payment_mode',
            payment_details: '$order_status.payment_details',
            bank_reference: '$order_status.bank_reference',
            payment_message: '$order_status.payment_message',
            error_message: '$order_status.error_message',
            payment_time: '$order_status.payment_time',
            createdAt: 1,
            updatedAt: 1
          }
        },
        {
          $sort: { [sort]: sortOrder }
        },
        {
          $skip: skip
        },
        {
          $limit: limit
        }
      ];

      const transactions = await this.orderModel.aggregate(pipeline as any);

      // Get total count for pagination
      const countPipeline = [
        {
          $match: { school_id: schoolId }
        },
        {
          $lookup: {
            from: 'orderstatuses',
            localField: '_id',
            foreignField: 'collect_id',
            as: 'order_status'
          }
        },
        {
          $count: 'total'
        }
      ];
      
      const countResult = await this.orderModel.aggregate(countPipeline as any);
      const total = countResult[0]?.total || 0;

      return {
        transactions,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        school_id: schoolId,
      };
    } catch (error) {
      console.error('Error fetching school transactions:', error);
      throw new HttpException(
        'Error fetching school transactions',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getTransactionStatus(customOrderId: string) {
    try {
      // Find order and its status
      const pipeline = [
        {
          $match: { custom_order_id: customOrderId }
        },
        {
          $lookup: {
            from: 'orderstatuses',
            localField: '_id',
            foreignField: 'collect_id',
            as: 'order_status'
          }
        },
        {
          $unwind: {
            path: '$order_status',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            collect_id: '$_id',
            school_id: 1,
            gateway: '$gateway_name',
            order_amount: '$order_status.order_amount',
            transaction_amount: '$order_status.transaction_amount',
            status: '$order_status.status',
            custom_order_id: 1,
            student_info: 1,
            trustee_id: 1,
            payment_mode: '$order_status.payment_mode',
            payment_details: '$order_status.payment_details',
            bank_reference: '$order_status.bank_reference',
            payment_message: '$order_status.payment_message',
            error_message: '$order_status.error_message',
            payment_time: '$order_status.payment_time',
            createdAt: 1,
            updatedAt: 1
          }
        }
      ];

      const result = await this.orderModel.aggregate(pipeline as any);
      
      if (!result || result.length === 0) {
        throw new HttpException('Transaction not found', HttpStatus.NOT_FOUND);
      }

      return {
        transaction: result[0],
        custom_order_id: customOrderId,
      };
    } catch (error) {
      console.error('Error fetching transaction status:', error);
      
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }
      
      throw new HttpException(
        'Error fetching transaction status',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}