import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsOptional, IsInt, Min, Max } from 'class-validator';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { ClinicPortalService } from './clinic-portal.service';

class SendQuoteDto {
  @IsNumber() totalPriceCents: number;
  @IsString() currencyCode: string;
  @IsArray() @IsString({ each: true }) includedItems: string[];
  @IsArray() @IsString({ each: true }) excludedItems: string[];
  @IsInt() @Min(7) @Max(90) validityDays: number;
  @IsOptional() @IsString() clinicNotes?: string;
  @IsOptional() @IsString() proposedDate?: string;
}

@ApiTags('Clinic Portal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('clinic-portal')
export class ClinicPortalController {
  constructor(private readonly service: ClinicPortalService) {}

  @Get('requests')
  @ApiOperation({ summary: 'List all quote requests for this clinic' })
  getRequests(@Request() req: any) {
    return this.service.getRequests(req.user.id);
  }

  @Get('requests/:id')
  @ApiOperation({ summary: 'Get a single quote request with patient details' })
  getRequest(@Request() req: any, @Param('id') id: string) {
    return this.service.getRequest(req.user.id, id);
  }

  @Post('requests/:id/quote')
  @ApiOperation({ summary: 'Send a quote for a patient request' })
  sendQuote(@Request() req: any, @Param('id') id: string, @Body() body: SendQuoteDto) {
    return this.service.sendQuote(req.user.id, id, body);
  }
}
