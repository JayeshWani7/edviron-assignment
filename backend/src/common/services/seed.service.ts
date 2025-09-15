import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../../schemas/user.schema';
import { Order, OrderDocument } from '../../schemas/order.schema';
import { OrderStatus, OrderStatusDocument } from '../../schemas/order-status.schema';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(OrderStatus.name) private orderStatusModel: Model<OrderStatusDocument>,
  ) {}

  async onModuleInit() {
    if (process.env.NODE_ENV === 'development') {
      await this.seedData();
    }
  }

  async seedData() {
    try {
      // Check if data already exists
      const userCount = await this.userModel.countDocuments();
      if (userCount > 0) {
        console.log('Data already seeded, skipping...');
        return;
      }

      console.log('Seeding database with sample data...');

      // Seed users
      const users = [
        {
          name: 'Admin User',
          email: 'admin@edviron.com',
          password: await bcrypt.hash('admin123', 10),
          role: 'admin',
        },
        {
          name: 'School Manager',
          email: 'manager@school.com',
          password: await bcrypt.hash('manager123', 10),
          role: 'manager',
        },
        {
          name: 'Test User',
          email: 'user@test.com',
          password: await bcrypt.hash('user123', 10),
          role: 'user',
        },
      ];

      await this.userModel.insertMany(users);
      console.log('✓ Users seeded');

      // Seed sample orders
      const orders = [
        {
          school_id: '65b0e6293e9f76a9694d84b4',
          trustee_id: '65b0e552dd319550a9b41c5ba',
          student_info: {
            name: 'Alice Johnson',
            id: 'STU001',
            email: 'alice@student.com',
          },
          gateway_name: 'PhonePe',
          custom_order_id: 'EDV_1234567890_sample01',
          status: 'success',
        },
        {
          school_id: '65b0e6293e9f76a9694d84b4',
          trustee_id: '65b0e552dd319550a9b41c5ba',
          student_info: {
            name: 'Bob Smith',
            id: 'STU002',
            email: 'bob@student.com',
          },
          gateway_name: 'Razorpay',
          custom_order_id: 'EDV_1234567891_sample02',
          status: 'pending',
        },
        {
          school_id: '65b0e6293e9f76a9694d84b4',
          trustee_id: '65b0e552dd319550a9b41c5ba',
          student_info: {
            name: 'Carol Brown',
            id: 'STU003',
            email: 'carol@student.com',
          },
          gateway_name: 'PhonePe',
          custom_order_id: 'EDV_1234567892_sample03',
          status: 'failed',
        },
      ];

      const createdOrders = await this.orderModel.insertMany(orders);
      console.log('✓ Orders seeded');

      // Seed sample order statuses
      const orderStatuses = [
        {
          collect_id: createdOrders[0]._id,
          order_amount: 2000,
          transaction_amount: 2200,
          payment_mode: 'upi',
          payment_details: 'success@ybl',
          bank_reference: 'YESBNK001',
          payment_message: 'Payment successful',
          status: 'success',
          error_message: 'NA',
          payment_time: new Date('2024-01-15T10:30:00Z'),
        },
        {
          collect_id: createdOrders[2]._id,
          order_amount: 1500,
          transaction_amount: 1500,
          payment_mode: 'card',
          payment_details: 'xxxx-xxxx-xxxx-1234',
          bank_reference: 'HDFC002',
          payment_message: 'Payment failed - insufficient funds',
          status: 'failed',
          error_message: 'Insufficient funds in account',
          payment_time: new Date('2024-01-16T14:20:00Z'),
        },
      ];

      await this.orderStatusModel.insertMany(orderStatuses);
      console.log('✓ Order statuses seeded');

      console.log('Database seeding completed successfully!');
      console.log('Sample login credentials:');
      console.log('Admin: admin@edviron.com / admin123');
      console.log('Manager: manager@school.com / manager123');
      console.log('User: user@test.com / user123');

    } catch (error) {
      console.error('Error seeding database:', error);
    }
  }
}