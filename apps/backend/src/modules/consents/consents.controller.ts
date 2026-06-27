import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { assertCanAccessUserResource } from '../../common/auth/authorization.util';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { RequestUser } from '../../common/auth/request-user.interface';
import { GrantConsentDto } from './dto/grant-consent.dto';
import { RevokeConsentDto } from './dto/revoke-consent.dto';
import { ConsentsService } from './consents.service';

@ApiTags('consents')
@ApiBearerAuth()
@Controller('consents')
export class ConsentsController {
  constructor(private readonly consentsService: ConsentsService) {}

  @Get('users/:userId')
  findForUser(@Param('userId') userId: string, @CurrentUser() user: RequestUser) {
    assertCanAccessUserResource(user, userId);
    return this.consentsService.findForUser(userId);
  }

  @Post('users/:userId')
  grant(
    @Param('userId') userId: string,
    @Body() dto: GrantConsentDto,
    @CurrentUser() user: RequestUser,
  ) {
    assertCanAccessUserResource(user, userId);
    return this.consentsService.grant(userId, dto, user.id);
  }

  @Post(':consentId/revoke')
  revoke(
    @Param('consentId') consentId: string,
    @Body() dto: RevokeConsentDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.consentsService.revoke(consentId, dto.reason, user);
  }
}
