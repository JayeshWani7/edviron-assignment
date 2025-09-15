import { Controller, Post, Body, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookDto } from './dto/webhook.dto';

@Controller('webhook')
export class WebhookController {
  constructor(private webhookService: WebhookService) {}

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
}