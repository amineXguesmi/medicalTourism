import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateQuoteRequestsDto {
  @ApiProperty({
    description: 'Selected clinic procedure offer IDs. One quote request is created per offer.',
    example: ['b56d1eb7-2d27-4ad3-95d8-588f01b8066b'],
    maxItems: 4,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(4)
  @IsUUID('4', { each: true })
  offerIds: string[];

  @ApiProperty({
    description: 'Patient acceptance of anti-bypass and platform communication terms.',
    example: true,
  })
  @IsBoolean()
  antiBypassTermsAccepted: boolean;

  @ApiPropertyOptional({
    description: 'Optional patient note for the selected clinics.',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  patientMessage?: string;
}
