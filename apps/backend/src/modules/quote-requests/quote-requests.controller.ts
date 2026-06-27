import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { RequestUser } from '../../common/auth/request-user.interface';
import { Roles } from '../../common/auth/roles.decorator';
import { UserRole } from '../../common/auth/user-role.enum';
import { CreateQuoteRequestsDto } from './dto/create-quote-requests.dto';
import { QuoteRequestsService } from './quote-requests.service';

@ApiTags('quote-requests')
@ApiBearerAuth()
@Roles(UserRole.PATIENT)
@Controller('quote-requests')
export class QuoteRequestsController {
  constructor(private readonly quoteRequestsService: QuoteRequestsService) {}

  @Get('mine')
  listMine(@CurrentUser() user: RequestUser) {
    return this.quoteRequestsService.listMine(user.id);
  }

  @Get(':id')
  findMineById(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.quoteRequestsService.findMineById(id, user.id);
  }

  @Post()
  create(@Body() dto: CreateQuoteRequestsDto, @CurrentUser() user: RequestUser) {
    return this.quoteRequestsService.create(user.id, dto);
  }
}
