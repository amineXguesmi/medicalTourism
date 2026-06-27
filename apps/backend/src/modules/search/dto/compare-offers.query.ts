import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CompareOffersQuery {
  @ApiProperty({ description: 'Comma-separated clinic procedure offer IDs. Maximum 4.' })
  @IsString()
  offerIds: string;
}

