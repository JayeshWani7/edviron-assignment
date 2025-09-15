import { IsNotEmpty, IsNumber, IsEmail, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  school_id: string;

  @IsNotEmpty()
  @IsString()
  trustee_id: string;

  @IsNotEmpty()
  student_info: {
    name: string;
    id: string;
    email: string;
  };

  @IsNotEmpty()
  @IsString()
  gateway_name: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsString()
  currency?: string;

  @IsString()
  description?: string;
}