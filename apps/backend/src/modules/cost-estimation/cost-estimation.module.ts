import { Module } from '@nestjs/common';
import { CostEstimationService } from './cost-estimation.service';

@Module({
  providers: [CostEstimationService],
  exports: [CostEstimationService],
})
export class CostEstimationModule {}

