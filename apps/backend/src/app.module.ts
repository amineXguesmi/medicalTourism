import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { AuditModule } from './modules/audit/audit.module';
import { ClinicsModule } from './modules/clinics/clinics.module';
import { ConsentsModule } from './modules/consents/consents.module';
import { HealthModule } from './modules/health/health.module';
import { ProceduresModule } from './modules/procedures/procedures.module';
import { QuoteRequestsModule } from './modules/quote-requests/quote-requests.module';
import { SearchModule } from './modules/search/search.module';
import { UsersModule } from './modules/users/users.module';
import { AiSummaryModule } from './modules/ai-summary/ai-summary.module';
import { ClinicPortalModule } from './modules/clinic-portal/clinic-portal.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '../../.env'],
      isGlobal: true,
    }),
    HealthModule,
    AuditModule,
    UsersModule,
    ConsentsModule,
    ProceduresModule,
    ClinicsModule,
    SearchModule,
    QuoteRequestsModule,
    AuthModule,
    AiSummaryModule,
    ClinicPortalModule,
  ],
})
export class AppModule {}
