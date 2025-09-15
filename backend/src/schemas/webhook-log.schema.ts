import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WebhookLogDocument = WebhookLog & Document;

@Schema({ timestamps: true })
export class WebhookLog {
  @Prop({ required: true })
  order_id: string;

  @Prop({ required: true })
  status_code: number;

  @Prop({ type: Object, required: true })
  payload: any;

  @Prop({ required: true })
  source: string;

  @Prop({ default: 'received' })
  processing_status: string;

  @Prop()
  error_message: string;
}

export const WebhookLogSchema = SchemaFactory.createForClass(WebhookLog);