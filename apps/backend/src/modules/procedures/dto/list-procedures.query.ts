import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ListProceduresQuery {
  @ApiPropertyOptional({ description: 'Case-insensitive search across procedure name, specialty and description.' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ example: 'Dental care' })
  @IsOptional()
  @IsString()
  specialty?: string;
}

