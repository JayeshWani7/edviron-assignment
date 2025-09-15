import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { JwtUtilService } from './jwt-util.service';
import { Order, OrderSchema } from '../schemas/order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    ConfigModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService, JwtUtilService],
  exports: [PaymentService, JwtUtilService],
})
export class PaymentModule {}