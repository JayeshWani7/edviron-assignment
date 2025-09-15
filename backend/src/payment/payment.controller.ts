import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payment')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('create-payment')
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.createPayment(createPaymentDto);
  }

  @Get('status/:customOrderId')
  async getPaymentStatus(@Param('customOrderId') customOrderId: string) {
    return this.paymentService.getPaymentStatus(customOrderId);
  }
}