import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class WebhookDto {
  @IsNumber()
  status: number;

  @IsNotEmpty()
  order_info: {
    order_id: string;
    order_amount: number;
    transaction_amount: number;
    gateway: string;
    bank_reference: string;
    status: string;
    payment_mode: string;
    payemnt_details: string;
    Payment_message: string;
    payment_time: string;
    error_message: string;
  };
}