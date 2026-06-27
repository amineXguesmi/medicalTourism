import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/database/prisma.module';
import { CostEstimationModule } from '../cost-estimation/cost-estimation.module';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [PrismaModule, CostEstimationModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}

