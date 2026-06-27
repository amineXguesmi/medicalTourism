import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { assertCanAccessUserResource } from '../../common/auth/authorization.util';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { RequestUser } from '../../common/auth/request-user.interface';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: RequestUser) {
    return this.usersService.findPublicById(user.id);
  }

  @Get(':id')
  async findById(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    assertCanAccessUserResource(user, id);

    const found = await this.usersService.findPublicById(id);
    if (!found) {
      throw new NotFoundException('User not found.');
    }

    return found;
  }
}
