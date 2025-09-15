import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @Get('transactions')
  async getAllTransactions(
    @Query('limit') limit: number = 10,
    @Query('page') page: number = 1,
    @Query('sort') sort: string = 'createdAt',
    @Query('order') order: string = 'desc',
  ) {
    return this.transactionService.getAllTransactions(
      Number(limit),
      Number(page),
      sort,
      order,
    );
  }

  @Get('transactions/school/:schoolId')
  async getTransactionsBySchool(
    @Param('schoolId') schoolId: string,
    @Query('limit') limit: number = 10,
    @Query('page') page: number = 1,
    @Query('sort') sort: string = 'createdAt',
    @Query('order') order: string = 'desc',
  ) {
    return this.transactionService.getTransactionsBySchool(
      schoolId,
      Number(limit),
      Number(page),
      sort,
      order,
    );
  }

  @Get('transaction-status/:customOrderId')
  async getTransactionStatus(@Param('customOrderId') customOrderId: string) {
    return this.transactionService.getTransactionStatus(customOrderId);
  }
}