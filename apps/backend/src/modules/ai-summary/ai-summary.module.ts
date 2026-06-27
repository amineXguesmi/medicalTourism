import { Module } from '@nestjs/common';
import { AiSummaryController } from './ai-summary.controller';
import { AiSummaryService } from './ai-summary.service';

@Module({
  controllers: [AiSummaryController],
  providers: [AiSummaryService],
  exports: [AiSummaryService],
})
export class AiSummaryModule {}
