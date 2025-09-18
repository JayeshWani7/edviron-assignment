import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../schemas/order.schema';
import { OrderStatus, OrderStatusDocument } from '../schemas/order-status.schema';
import { PaymentTransaction, PaymentTransactionDocument } from '../schemas/payment-transaction.schema';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(OrderStatus.name) private orderStatusModel: Model<OrderStatusDocument>,
    @InjectModel(PaymentTransaction.name) private paymentTransactionModel: Model<PaymentTransactionDocument>,
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

  async updateSchoolTransactionsFromPayments(schoolId?: string) {
    try {
      console.log(`🔄 Starting school transactions update${schoolId ? ` for school: ${schoolId}` : ' for all schools'}`);
      
      // Build query filter
      const paymentFilter = schoolId ? { school_id: schoolId } : {};
      
      // Get all payment transactions for the school(s)
      const paymentTransactions = await this.paymentTransactionModel.find(paymentFilter);
      
      console.log(`📊 Found ${paymentTransactions.length} payment transactions`);
      
      let updatedCount = 0;
      let createdCount = 0;
      const errors = [];

      for (const payment of paymentTransactions) {
        try {
          // Try to find existing order by collect_request_id or custom_order_id
          let existingOrder = await this.orderModel.findOne({
            $or: [
              { custom_order_id: payment.collect_request_id },
              { _id: payment.collect_request_id }
            ]
          });

          // If no order exists, create a new one
          if (!existingOrder) {
            const newOrder = new this.orderModel({
              school_id: payment.school_id,
              trustee_id: '65b0e552dd319509b41c5ba', // Default trustee ID
              student_info: {
                name: 'Student from Payment',
                id: `student_${Date.now()}`,
                email: 'student@school.edu'
              },
              gateway_name: 'edviron_pg',
              custom_order_id: payment.collect_request_id,
              status: this.mapPaymentStatusToOrderStatus(payment.status),
            });
            
            existingOrder = await newOrder.save();
            createdCount++;
            console.log(`➕ Created new order for payment: ${payment.collect_request_id}`);
          }

          // Map payment status to order status
          const mappedOrderStatus = this.mapPaymentStatusToOrderStatus(payment.status);
          
          console.log(`🔄 Syncing payment ${payment.collect_request_id}: ${payment.status} → ${mappedOrderStatus}`);

          // Update or create order status
          const orderStatusData = {
            collect_id: existingOrder._id,
            order_amount: payment.amount,
            transaction_amount: payment.amount,
            status: mappedOrderStatus,
            payment_mode: payment.payment_mode || 'upi',
            payment_details: payment.payment_details || '',
            bank_reference: payment.bank_reference || '',
            payment_message: this.getPaymentMessage(payment.status),
            error_message: payment.failure_reason || '',
            payment_time: payment.payment_time || new Date(),
          };

          // Update or insert order status
          const updatedOrderStatus = await this.orderStatusModel.findOneAndUpdate(
            { collect_id: existingOrder._id },
            orderStatusData,
            { upsert: true, new: true }
          );

          // Update the order status as well (ensure consistency)
          const updatedOrder = await this.orderModel.findByIdAndUpdate(
            existingOrder._id, 
            { status: mappedOrderStatus },
            { new: true }
          );

          console.log(`✅ Status synced - Order: ${updatedOrder?.status}, OrderStatus: ${updatedOrderStatus?.status}`);

          updatedCount++;
          
        } catch (error) {
          console.error(`❌ Error processing payment ${payment.collect_request_id}:`, error);
          errors.push({
            paymentId: payment.collect_request_id,
            error: error.message
          });
        }
      }

      const result = {
        success: true,
        message: `School transactions updated successfully`,
        statistics: {
          totalPayments: paymentTransactions.length,
          ordersUpdated: updatedCount,
          ordersCreated: createdCount,
          errors: errors.length
        },
        ...(errors.length > 0 && { errors })
      };

      console.log(`✅ Update completed:`, result.statistics);
      return result;

    } catch (error) {
      console.error('❌ Error updating school transactions from payments:', error);
      throw new HttpException(
        'Error updating school transactions from payments',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async compareSchoolTransactionsWithPayments(schoolId?: string) {
    try {
      console.log(`🔍 Comparing school transactions with payments${schoolId ? ` for school: ${schoolId}` : ''}`);
      
      // Build query filter
      const filter = schoolId ? { school_id: schoolId } : {};
      
      // Get payment transactions
      const paymentTransactions = await this.paymentTransactionModel.find(filter);
      
      // Get school transactions (orders with order status)
      const pipeline = [
        ...(schoolId ? [{ $match: { school_id: schoolId } }] : []),
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
            custom_order_id: 1,
            order_status: 1,
            createdAt: 1,
            updatedAt: 1
          }
        }
      ];

      const schoolTransactions = await this.orderModel.aggregate(pipeline as any);
      
      // Create maps for comparison
      const paymentMap = new Map();
      paymentTransactions.forEach(payment => {
        paymentMap.set(payment.collect_request_id, payment);
      });

      const transactionMap = new Map();
      schoolTransactions.forEach(transaction => {
        transactionMap.set(transaction.custom_order_id, transaction);
      });

      // Find discrepancies
      const missingInTransactions = [];
      const missingInPayments = [];
      const statusMismatches = [];

      // Check for payments not in transactions
      for (const payment of paymentTransactions) {
        const transaction = transactionMap.get(payment.collect_request_id);
        if (!transaction) {
          missingInTransactions.push({
            collect_request_id: payment.collect_request_id,
            school_id: payment.school_id,
            amount: payment.amount,
            payment_status: payment.status,
            payment_time: payment.payment_time
          });
        } else {
          // Check for status mismatches
          const expectedOrderStatus = this.mapPaymentStatusToOrderStatus(payment.status);
          if (transaction.order_status?.status !== expectedOrderStatus) {
            statusMismatches.push({
              collect_request_id: payment.collect_request_id,
              school_id: payment.school_id,
              payment_status: payment.status,
              transaction_status: transaction.order_status?.status || 'no_status',
              expected_status: expectedOrderStatus
            });
          }
        }
      }

      // Check for transactions not in payments
      for (const transaction of schoolTransactions) {
        if (!paymentMap.has(transaction.custom_order_id)) {
          missingInPayments.push({
            collect_request_id: transaction.custom_order_id,
            school_id: transaction.school_id,
            transaction_status: transaction.order_status?.status || 'no_status',
            created_at: transaction.createdAt
          });
        }
      }

      return {
        success: true,
        comparison: {
          totalPayments: paymentTransactions.length,
          totalTransactions: schoolTransactions.length,
          missingInTransactions: {
            count: missingInTransactions.length,
            items: missingInTransactions
          },
          missingInPayments: {
            count: missingInPayments.length,
            items: missingInPayments
          },
          statusMismatches: {
            count: statusMismatches.length,
            items: statusMismatches
          }
        }
      };

    } catch (error) {
      console.error('❌ Error comparing school transactions with payments:', error);
      throw new HttpException(
        'Error comparing school transactions with payments',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get detailed status report for debugging
   */
  async getStatusReport(schoolId?: string) {
    try {
      const filter = schoolId ? { school_id: schoolId } : {};
      
      // Get payment transactions
      const payments = await this.paymentTransactionModel.find(filter);
      
      // Get school transactions with status
      const pipeline = [
        ...(schoolId ? [{ $match: { school_id: schoolId } }] : []),
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
        }
      ];

      const transactions = await this.orderModel.aggregate(pipeline as any);
      
      // Create detailed report
      const report = {
        summary: {
          total_payments: payments.length,
          total_transactions: transactions.length,
          school_id: schoolId || 'all_schools'
        },
        status_breakdown: {
          payments: this.getStatusBreakdown(payments, 'status'),
          transactions: this.getStatusBreakdown(transactions, 'order_status.status')
        },
        detailed_items: []
      };

      // Create detailed comparison
      const paymentMap = new Map();
      payments.forEach(p => paymentMap.set(p.collect_request_id, p));

      for (const transaction of transactions) {
        const payment = paymentMap.get(transaction.custom_order_id);
        const item = {
          collect_request_id: transaction.custom_order_id,
          school_id: transaction.school_id,
          payment_status: payment?.status || 'NO_PAYMENT',
          order_status: transaction.status || 'NO_STATUS',
          order_status_table_status: transaction.order_status?.status || 'NO_ORDER_STATUS',
          status_match: payment && transaction.order_status ? 
            this.mapPaymentStatusToOrderStatus(payment.status) === transaction.order_status.status : false,
          payment_amount: payment?.amount,
          transaction_amount: transaction.order_status?.transaction_amount,
          last_updated: payment?.updatedAt || transaction.updatedAt
        };
        
        report.detailed_items.push(item);
      }

      return report;
      
    } catch (error) {
      console.error('❌ Error generating status report:', error);
      throw new HttpException(
        'Error generating status report',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get status breakdown for array of items
   */
  private getStatusBreakdown(items: any[], statusPath: string): Record<string, number> {
    const breakdown: Record<string, number> = {};
    
    items.forEach(item => {
      const status = this.getNestedProperty(item, statusPath) || 'unknown';
      breakdown[status] = (breakdown[status] || 0) + 1;
    });
    
    return breakdown;
  }

  /**
   * Get nested property value
   */
  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Verify and fix status mismatches between payments and transactions
   */
  async verifyAndFixStatusMismatches(schoolId?: string) {
    try {
      console.log(`🔍 Verifying status consistency${schoolId ? ` for school: ${schoolId}` : ''}`);
      
      // Get comparison data
      const comparison = await this.compareSchoolTransactionsWithPayments(schoolId);
      const mismatches = comparison.comparison.statusMismatches.items;
      
      if (mismatches.length === 0) {
        console.log('✅ No status mismatches found');
        return {
          success: true,
          message: 'All statuses are in sync',
          mismatches: 0
        };
      }

      console.log(`⚠️ Found ${mismatches.length} status mismatches, fixing...`);

      let fixedCount = 0;
      const errors = [];

      for (const mismatch of mismatches) {
        try {
          // Find the order
          const order = await this.orderModel.findOne({
            custom_order_id: mismatch.collect_request_id
          });

          if (!order) {
            console.warn(`Order not found for collect_request_id: ${mismatch.collect_request_id}`);
            continue;
          }

          // Update both Order and OrderStatus to match payment status
          const correctStatus = mismatch.expected_status;

          await Promise.all([
            this.orderModel.findByIdAndUpdate(order._id, { status: correctStatus }),
            this.orderStatusModel.findOneAndUpdate(
              { collect_id: order._id },
              { status: correctStatus }
            )
          ]);

          console.log(`✅ Fixed status mismatch for ${mismatch.collect_request_id}: ${mismatch.transaction_status} → ${correctStatus}`);
          fixedCount++;

        } catch (error) {
          console.error(`❌ Error fixing status for ${mismatch.collect_request_id}:`, error);
          errors.push({
            collect_request_id: mismatch.collect_request_id,
            error: error.message
          });
        }
      }

      return {
        success: true,
        message: `Fixed ${fixedCount} status mismatches`,
        statistics: {
          totalMismatches: mismatches.length,
          fixed: fixedCount,
          errors: errors.length
        },
        ...(errors.length > 0 && { errors })
      };

    } catch (error) {
      console.error('❌ Error verifying status consistency:', error);
      throw new HttpException(
        'Error verifying status consistency',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private mapPaymentStatusToOrderStatus(paymentStatus: string): string {
    if (!paymentStatus) {
      console.warn('⚠️ Null/undefined payment status, defaulting to pending');
      return 'pending';
    }

    const normalizedStatus = paymentStatus.toLowerCase().trim();
    
    const statusMap = {
      // Success variations
      'success': 'success',
      'completed': 'success',
      'paid': 'success',
      'successful': 'success',
      'complete': 'success',
      
      // Failed variations
      'failed': 'failed',
      'failure': 'failed',
      'fail': 'failed',
      'declined': 'failed',
      'rejected': 'failed',
      'error': 'failed',
      
      // Cancelled variations
      'cancelled': 'cancelled',
      'canceled': 'cancelled',
      'cancel': 'cancelled',
      'aborted': 'cancelled',
      'timeout': 'cancelled',
      
      // Pending variations
      'pending': 'pending',
      'initiated': 'pending',
      'processing': 'pending',
      'in_progress': 'pending',
      'created': 'pending',
      'starting': 'pending'
    };
    
    const mappedStatus = statusMap[normalizedStatus];
    
    if (!mappedStatus) {
      console.warn(`⚠️ Unknown payment status '${paymentStatus}', defaulting to pending`);
      return 'pending';
    }
    
    return mappedStatus;
  }

  private getPaymentMessage(status: string): string {
    const messageMap = {
      'success': 'Payment completed successfully',
      'completed': 'Payment completed successfully',
      'paid': 'Payment completed successfully',
      'failed': 'Payment failed',
      'failure': 'Payment failed',
      'cancelled': 'Payment cancelled by user',
      'pending': 'Payment is pending',
      'initiated': 'Payment initiated'
    };
    
    return messageMap[status?.toLowerCase()] || 'Payment status unknown';
  }
}