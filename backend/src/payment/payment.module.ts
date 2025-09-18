import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { JwtUtilService } from './jwt-util.service';
import { Order, OrderSchema } from '../schemas/order.schema';
import { PaymentTransaction, PaymentTransactionSchema } from '../schemas/payment-transaction.schema';
import { TransactionModule } from '../transaction/transaction.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: PaymentTransaction.name, schema: PaymentTransactionSchema }
    ]),
    ConfigModule,
    TransactionModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService, JwtUtilService],
  exports: [PaymentService, JwtUtilService],
})
export class PaymentModule {}