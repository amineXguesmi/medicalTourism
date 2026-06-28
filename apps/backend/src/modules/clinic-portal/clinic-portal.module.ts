import { Module } from '@nestjs/common';
import { ClinicPortalController } from './clinic-portal.controller';
import { ClinicPortalService } from './clinic-portal.service';
import { PrismaModule } from '../../common/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ClinicPortalController],
  providers: [ClinicPortalService],
})
export class ClinicPortalModule {}
