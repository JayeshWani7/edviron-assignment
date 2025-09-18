import { Controller, Post, Body, Get, Param, Query, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto, CreateCollectRequestDto, CheckPaymentStatusDto } from './dto/payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('create-payment')
  @UseGuards(JwtAuthGuard)
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.createPayment(createPaymentDto);
  }

  @Get('status/:customOrderId')
  @UseGuards(JwtAuthGuard)
  async getPaymentStatus(@Param('customOrderId') customOrderId: string) {
    return this.paymentService.getPaymentStatus(customOrderId);
  }

  // Edviron Payment API Endpoints

  /**
   * Test endpoint to check if API is accessible
   * GET /payment/test
   */
  @Get('test')
  async testEndpoint() {
    return { 
      success: true, 
      message: 'Payment API is working!',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Test JWT signing functionality
   * GET /payment/test-jwt
   */
  @Get('test-jwt')
  async testJWT(@Query('school_id') school_id?: string, @Query('amount') amount?: string) {
    try {
      const testSchoolId = school_id || '65b0e6293e9f76a9694d84b4';
      const testAmount = amount || '100';
      const testCallbackUrl = 'http://localhost:3000/payment/success';
      
      // Test JWT generation
      const jwtSign = await this.paymentService['jwtUtilService'].generateCreateRequestSign(
        testSchoolId, 
        testAmount, 
        testCallbackUrl
      );
      
      return {
        success: true,
        message: 'JWT signing is working!',
        test_data: {
          school_id: testSchoolId,
          amount: testAmount,
          callback_url: testCallbackUrl,
          generated_sign: jwtSign
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        message: 'JWT signing failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Create collect request using Edviron API
   * POST /payment/create-collect-request
   */
  @Post('create-collect-request')
  async createCollectRequest(@Body() createCollectRequestDto: CreateCollectRequestDto) {
    return this.paymentService.createCollectRequest(createCollectRequestDto);
  }

  /**
   * Create collect request with auto-generated JWT
   * POST /payment/create-collect-request-simple
   */
  @Post('create-collect-request-simple')
  async createCollectRequestSimple(@Body() body: { school_id: string; amount: string; callback_url: string }) {
    const { school_id, amount, callback_url } = body;
    return this.paymentService.createCollectRequestWithJWT(school_id, amount, callback_url);
  }

  /**
   * Check payment status using Edviron API
   * GET /payment/collect-request/:collect_request_id
   */
  @Get('collect-request/:collect_request_id')
  async checkPaymentStatus(
    @Param('collect_request_id') collect_request_id: string,
    @Query('school_id') school_id: string,
    @Query('sign') sign: string,
  ) {
    const checkPaymentStatusDto: CheckPaymentStatusDto = {
      collect_request_id,
      school_id,
      sign,
    };
    return this.paymentService.checkPaymentStatus(checkPaymentStatusDto);
  }

  /**
   * Check payment status with auto-generated JWT
   * GET /payment/collect-request-simple/:collect_request_id
   */
  @Get('collect-request-simple/:collect_request_id')
  async checkPaymentStatusSimple(
    @Param('collect_request_id') collect_request_id: string,
    @Query('school_id') school_id: string,
  ) {
    return this.paymentService.checkPaymentStatusWithJWT(collect_request_id, school_id);
  }

  /**
   * Test payment creation with detailed error logging
   * POST /payment/test-create
   */
  @Post('test-create')
  async testCreatePayment(@Body() body: { school_id?: string; amount?: string }) {
    try {
      const testSchoolId = body.school_id || '65b0e6293e9f76a9694d84b4';
      const testAmount = body.amount || '100';
      const testCallbackUrl = 'http://localhost:3000/payment/success';
      
      console.log('Testing payment creation with:', {
        school_id: testSchoolId,
        amount: testAmount,
        callback_url: testCallbackUrl
      });
      
      const result = await this.paymentService.createCollectRequestWithJWT(
        testSchoolId,
        testAmount,
        testCallbackUrl
      );
      
      return {
        success: true,
        message: 'Payment creation test successful!',
        result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Payment creation test failed:', error);
      return {
        success: false,
        message: 'Payment creation test failed',
        error: error.message,
        details: error.response?.data || 'No additional details',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Update payment status in database
   * POST /payment/update-status
   */
  @Post('update-status')
  async updatePaymentStatus(@Body() updateData: { 
    collect_request_id: string, 
    status: string, 
    payment_details?: any 
  }) {
    try {
      const result = await this.paymentService.updatePaymentStatus(
        updateData.collect_request_id,
        updateData.status,
        updateData.payment_details
      );
      
      return {
        success: true,
        message: 'Payment status updated successfully',
        data: result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update payment status',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get payment transaction status from database
   * GET /payment/transaction-status/:collect_request_id
   */
  @Get('transaction-status/:collect_request_id')
  async getPaymentTransactionStatus(@Param('collect_request_id') collect_request_id: string) {
    try {
      const result = await this.paymentService.getPaymentTransactionStatus(collect_request_id);
      
      return {
        success: true,
        message: 'Payment transaction retrieved successfully',
        data: result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get payment transaction',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Manually sync school transactions with payments for a specific school
   * POST /payment/sync-school-transactions/:schoolId
   */
  @Post('sync-school-transactions/:schoolId')
  @UseGuards(JwtAuthGuard)
  async syncSchoolTransactions(@Param('schoolId') schoolId: string) {
    return this.paymentService.syncSchoolTransactions(schoolId);
  }

  /**
   * Get payments and school transactions for a specific school
   * GET /payment/school-data/:schoolId
   */
  @Get('school-data/:schoolId')
  @UseGuards(JwtAuthGuard)
  async getSchoolPaymentsWithTransactions(@Param('schoolId') schoolId: string) {
    return this.paymentService.getSchoolPaymentsWithTransactions(schoolId);
  }
}