import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
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

  @Get('sync/school-transactions')
  async updateAllSchoolTransactionsFromPayments() {
    return this.transactionService.updateSchoolTransactionsFromPayments();
  }

  @Get('sync/school-transactions/:schoolId')
  async updateSchoolTransactionsFromPayments(@Param('schoolId') schoolId: string) {
    return this.transactionService.updateSchoolTransactionsFromPayments(schoolId);
  }

  @Get('compare/school-transactions')
  async compareAllSchoolTransactionsWithPayments() {
    return this.transactionService.compareSchoolTransactionsWithPayments();
  }

  @Get('compare/school-transactions/:schoolId')
  async compareSchoolTransactionsWithPayments(@Param('schoolId') schoolId: string) {
    return this.transactionService.compareSchoolTransactionsWithPayments(schoolId);
  }

  @Post('fix/status-mismatches')
  async fixAllStatusMismatches() {
    return this.transactionService.verifyAndFixStatusMismatches();
  }

  @Post('fix/status-mismatches/:schoolId')
  async fixSchoolStatusMismatches(@Param('schoolId') schoolId: string) {
    return this.transactionService.verifyAndFixStatusMismatches(schoolId);
  }

  @Get('status-report')
  async getStatusReport() {
    return this.transactionService.getStatusReport();
  }

  @Get('status-report/:schoolId')
  async getSchoolStatusReport(@Param('schoolId') schoolId: string) {
    return this.transactionService.getStatusReport(schoolId);
  }
}