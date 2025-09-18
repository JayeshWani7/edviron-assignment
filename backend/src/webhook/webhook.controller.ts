import { Controller, Post, Body, Get, Query, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookDto } from './dto/webhook.dto';
import { PaymentService } from '../payment/payment.service';
import { Response } from 'express';

@Controller('webhook')
export class WebhookController {
  constructor(
    private webhookService: WebhookService,
    private paymentService: PaymentService
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() webhookDto: WebhookDto) {
    return this.webhookService.processWebhook(webhookDto);
  }

  @Get('logs')
  async getWebhookLogs(
    @Query('limit') limit: number = 50,
    @Query('page') page: number = 1,
  ) {
    return this.webhookService.getWebhookLogs(Number(limit), Number(page));
  }

  /**
   * Handle payment status updates from gateway
   * POST /webhook/payment-status
   */
  @Post('payment-status')
  @HttpCode(HttpStatus.OK)
  async handlePaymentStatusWebhook(@Body() payload: any, @Res() response: Response) {
    try {
      console.log('🔔 Payment status webhook received:', JSON.stringify(payload, null, 2));

      const { collect_request_id, status, payment_mode, payment_details, failure_reason } = payload;

      if (!collect_request_id || !status) {
        return response.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Missing required fields: collect_request_id and status'
        });
      }

      // Map gateway status to internal status
      let internalStatus = status.toLowerCase();
      switch (internalStatus) {
        case 'success':
        case 'completed':
        case 'paid':
          internalStatus = 'success';
          break;
        case 'failed':
        case 'failure':
          internalStatus = 'failed';
          break;
        case 'invalid_vpa':
        case 'invalid':
          internalStatus = 'invalid_vpa';
          break;
        default:
          internalStatus = 'failed';
      }

      // Update payment status in database
      await this.paymentService.updatePaymentStatus(collect_request_id, internalStatus, {
        payment_mode: payment_mode || 'UPI',
        payment_details: payment_details || this.getPaymentDetailsFromStatus(internalStatus),
        failure_reason,
        gateway_response: JSON.stringify(payload),
        payment_time: new Date().toISOString()
      });

      console.log(`✅ Payment status updated: ${collect_request_id} -> ${internalStatus}`);

      return response.status(HttpStatus.OK).json({
        success: true,
        message: 'Payment status updated successfully'
      });

    } catch (error) {
      console.error('❌ Error processing payment status webhook:', error);
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Webhook processing failed',
        error: error.message
      });
    }
  }

  /**
   * Test endpoint to simulate different UPI scenarios
   * POST /webhook/test-upi-scenarios
   */
  @Post('test-upi-scenarios')
  @HttpCode(HttpStatus.OK)
  async testUpiScenarios(@Body() payload: any, @Res() response: Response) {
    try {
      console.log('🧪 Testing UPI scenario:', JSON.stringify(payload, null, 2));

      const { collect_request_id, upi_id } = payload;

      if (!collect_request_id || !upi_id) {
        return response.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Missing collect_request_id or upi_id'
        });
      }

      let status: string;
      let paymentDetails: any;

      // Simulate different test UPI scenarios
      switch (upi_id) {
        case 'testsuccess@gocash':
          status = 'success';
          paymentDetails = {
            payment_mode: 'UPI',
            payment_details: 'testsuccess@gocash',
            gateway_response: 'Payment completed successfully'
          };
          break;

        case 'testfailure@gocash':
          status = 'failed';
          paymentDetails = {
            payment_mode: 'UPI',
            payment_details: 'testfailure@gocash',
            failure_reason: 'Insufficient funds or payment declined'
          };
          break;

        case 'testinvalid@gocash':
          status = 'invalid_vpa';
          paymentDetails = {
            payment_mode: 'UPI',
            payment_details: 'testinvalid@gocash',
            failure_reason: 'Invalid UPI ID'
          };
          break;

        default:
          return response.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            message: 'Unknown UPI test scenario. Use: testsuccess@gocash, testfailure@gocash, or testinvalid@gocash'
          });
      }

      // Update payment status
      await this.paymentService.updatePaymentStatus(collect_request_id, status, paymentDetails);

      console.log(`✅ Test UPI scenario processed: ${upi_id} -> ${status}`);

      return response.status(HttpStatus.OK).json({
        success: true,
        message: `UPI test scenario processed: ${upi_id}`,
        collect_request_id,
        status,
        upi_id
      });

    } catch (error) {
      console.error('❌ Error processing UPI test scenario:', error);
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Test scenario processing failed',
        error: error.message
      });
    }
  }

  private getPaymentDetailsFromStatus(status: string): string {
    switch (status) {
      case 'success':
        return 'testsuccess@gocash';
      case 'failed':
        return 'testfailure@gocash';
      case 'invalid_vpa':
        return 'testinvalid@gocash';
      default:
        return 'Unknown payment method';
    }
  }
}