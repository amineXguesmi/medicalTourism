import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/auth/public.decorator';
import { ListProceduresQuery } from './dto/list-procedures.query';
import { ProceduresService } from './procedures.service';

@ApiTags('procedures')
@Public()
@Controller('procedures')
export class ProceduresController {
  constructor(private readonly proceduresService: ProceduresService) {}

  @Get()
  list(@Query() query: ListProceduresQuery) {
    return this.proceduresService.list(query);
  }

  @Get('specialties')
  specialties() {
    return this.proceduresService.listSpecialties();
  }

  @Get(':slug')
  async detail(@Param('slug') slug: string) {
    const procedure = await this.proceduresService.findBySlug(slug);

    if (!procedure) {
      throw new NotFoundException('Procedure not found.');
    }

    return procedure;
  }
}

