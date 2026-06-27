import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/auth/public.decorator';
import { CompareOffersQuery } from './dto/compare-offers.query';
import { SearchOffersQuery } from './dto/search-offers.query';
import { SearchService } from './search.service';

@ApiTags('search')
@Public()
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('offers')
  offers(@Query() query: SearchOffersQuery) {
    return this.searchService.searchOffers(query);
  }

  @Get('compare')
  compare(@Query() query: CompareOffersQuery) {
    return this.searchService.compareOffers(query.offerIds);
  }
}

