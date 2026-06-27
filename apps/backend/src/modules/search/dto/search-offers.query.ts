import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export const offerSortOptions = ['price_asc', 'price_desc', 'total_asc', 'clinic_name'] as const;
export type OfferSort = (typeof offerSortOptions)[number];

export class SearchOffersQuery {
  @ApiPropertyOptional({ example: 'dental-implant' })
  @IsOptional()
  @IsString()
  procedureSlug?: string;

  @ApiPropertyOptional({ example: 'ES' })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @ApiPropertyOptional({ example: 'FR' })
  @IsOptional()
  @IsString()
  patientCountryCode?: string;

  @ApiPropertyOptional({ description: 'Search clinic name, country, procedure name, specialty or description.' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPriceCents?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxPriceCents?: number;

  @ApiPropertyOptional({ enum: offerSortOptions })
  @IsOptional()
  @IsIn(offerSortOptions)
  sort?: OfferSort;

  @ApiPropertyOptional({ minimum: 1, maximum: 50, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

