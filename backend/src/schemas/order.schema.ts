import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class StudentInfo {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  email: string;
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true })
  school_id: string;

  @Prop({ required: true })
  trustee_id: string;

  @Prop({ type: StudentInfo, required: true })
  student_info: StudentInfo;

  @Prop({ required: true })
  gateway_name: string;

  @Prop({ required: true, unique: true })
  custom_order_id: string;

  @Prop({ default: 'pending' })
  status: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);