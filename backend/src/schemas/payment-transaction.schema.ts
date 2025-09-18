import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentTransactionDocument = PaymentTransaction & Document;

@Schema({ timestamps: true })
export class PaymentTransaction {
  @Prop({ required: true })
  collect_request_id: string;

  @Prop({ required: true })
  school_id: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  callback_url: string;

  @Prop({ required: true })
  payment_url: string;

  @Prop({ required: true })
  jwt_sign: string;

  @Prop({ default: 'initiated' })
  status: string; // initiated, pending, success, failed, cancelled

  @Prop()
  payment_mode: string; // upi, card, netbanking, etc.

  @Prop()
  payment_details: string; // UPI ID, card last 4 digits, etc.

  @Prop()
  bank_reference: string;

  @Prop()
  gateway_transaction_id: string;

  @Prop()
  payment_time: Date;

  @Prop()
  failure_reason: string;

  @Prop()
  gateway_response: string; // Store raw gateway response

  @Prop({ type: Object })
  metadata: Record<string, any>; // Additional payment metadata
}

export const PaymentTransactionSchema = SchemaFactory.createForClass(PaymentTransaction);

// Create indexes for better query performance
PaymentTransactionSchema.index({ collect_request_id: 1 });
PaymentTransactionSchema.index({ school_id: 1 });
PaymentTransactionSchema.index({ status: 1 });
PaymentTransactionSchema.index({ payment_time: -1 });