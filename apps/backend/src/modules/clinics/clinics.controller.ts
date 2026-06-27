import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/auth/public.decorator';
import { ClinicsService } from './clinics.service';
import { ListClinicsQuery } from './dto/list-clinics.query';

@ApiTags('clinics')
@Public()
@Controller('clinics')
export class ClinicsController {
  constructor(private readonly clinicsService: ClinicsService) {}

  @Get()
  list(@Query() query: ListClinicsQuery) {
    return this.clinicsService.listVerified(query);
  }

  @Get(':id')
  async detail(@Param('id') id: string) {
    const clinic = await this.clinicsService.findVerifiedById(id);

    if (!clinic) {
      throw new NotFoundException('Clinic not found.');
    }

    return clinic;
  }

  @Get(':id/procedures')
  async procedures(@Param('id') id: string) {
    const clinic = await this.clinicsService.findVerifiedById(id);

    if (!clinic) {
      throw new NotFoundException('Clinic not found.');
    }

    return this.clinicsService.listProcedureOffers(id);
  }
}

