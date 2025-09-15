import { IsNotEmpty, IsNumber, IsEmail, IsString, IsUrl } from 'class-validator';

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

export class CreateCollectRequestDto {
  @IsNotEmpty()
  @IsString()
  school_id: string;

  @IsNotEmpty()
  @IsString()
  amount: string;

  @IsNotEmpty()
  @IsUrl()
  callback_url: string;

  @IsNotEmpty()
  @IsString()
  sign: string;
}

export class CheckPaymentStatusDto {
  @IsNotEmpty()
  @IsString()
  collect_request_id: string;

  @IsNotEmpty()
  @IsString()
  school_id: string;

  @IsNotEmpty()
  @IsString()
  sign: string;
}