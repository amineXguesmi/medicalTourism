import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ListClinicsQuery {
  @ApiPropertyOptional({ example: 'FR' })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @ApiPropertyOptional({ description: 'Case-insensitive search across clinic name and country code.' })
  @IsOptional()
  @IsString()
  q?: string;
}

