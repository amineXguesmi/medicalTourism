import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { BiologicalSex } from '@prisma/client';
import {
  IsEnum,
  IsISO8601,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateMeDto {
  @ApiPropertyOptional({ example: 'Amina Patient' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  fullName?: string;

  @ApiPropertyOptional({ example: '+33123456789' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  phone?: string;

  @ApiPropertyOptional({ example: 'FR' })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  countryCode?: string;

  @ApiPropertyOptional({ example: 'Paris' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  residenceCity?: string;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @IsString()
  @Length(2, 5)
  languageCode?: string;

  @ApiPropertyOptional({ example: 'EUR' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currencyCode?: string;

  @ApiPropertyOptional({ enum: BiologicalSex })
  @IsOptional()
  @IsEnum(BiologicalSex)
  biologicalSex?: BiologicalSex;

  @ApiPropertyOptional({ example: 'woman' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  genderIdentity?: string;

  @ApiPropertyOptional({ example: '1990-05-18' })
  @IsOptional()
  @IsISO8601()
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: 48.8566 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ example: 2.3522 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiPropertyOptional({ example: 2500 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(10)
  @Max(20000)
  travelRadiusKm?: number;

  @ApiPropertyOptional({ example: 'ES' })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  preferredDestinationCountryCode?: string;

  @ApiPropertyOptional({
    example: 'Dental implant interest, no urgent medical constraints.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  medicalSummary?: string;
}
