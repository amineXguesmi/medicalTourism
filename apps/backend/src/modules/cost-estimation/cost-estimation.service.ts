import { Injectable } from '@nestjs/common';

export interface TotalCostEstimateInput {
  procedurePriceCents: number | null;
  clinicCountryCode: string;
  patientCountryCode?: string;
  nights?: number;
}

export interface TotalCostEstimate {
  currencyCode: 'EUR';
  procedurePriceCents: number | null;
  estimatedFlightCents: number;
  estimatedHotelCents: number;
  estimatedTransferCents: number;
  estimatedTotalCents: number | null;
  assumptions: string[];
  isEstimate: true;
}

const defaultNightsByProcedureType = 5;

const travelEstimateByCountry: Record<string, { flight: number; hotelPerNight: number; transfer: number }> = {
  ES: { flight: 18000, hotelPerNight: 9000, transfer: 4500 },
  FR: { flight: 15000, hotelPerNight: 11500, transfer: 5000 },
  GB: { flight: 22000, hotelPerNight: 13000, transfer: 5500 },
  TR: { flight: 26000, hotelPerNight: 7500, transfer: 4000 },
};

@Injectable()
export class CostEstimationService {
  estimateTotalCost(input: TotalCostEstimateInput): TotalCostEstimate {
    const nights = input.nights ?? defaultNightsByProcedureType;
    const travel = travelEstimateByCountry[input.clinicCountryCode.toUpperCase()] ?? {
      flight: 24000,
      hotelPerNight: 9500,
      transfer: 5000,
    };
    const estimatedHotelCents = travel.hotelPerNight * nights;
    const variableTotal = travel.flight + estimatedHotelCents + travel.transfer;

    return {
      currencyCode: 'EUR',
      procedurePriceCents: input.procedurePriceCents,
      estimatedFlightCents: travel.flight,
      estimatedHotelCents,
      estimatedTransferCents: travel.transfer,
      estimatedTotalCents:
        input.procedurePriceCents === null ? null : input.procedurePriceCents + variableTotal,
      assumptions: [
        `Patient origin defaults to ${input.patientCountryCode ?? 'EU/UK regional estimate'}.`,
        `${nights} hotel nights estimated for MVP comparison.`,
        'Flight, hotel and transfer values are indicative and not guaranteed.',
      ],
      isEstimate: true,
    };
  }
}

