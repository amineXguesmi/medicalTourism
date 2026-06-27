import { CostEstimationService } from './cost-estimation.service';

describe('CostEstimationService', () => {
  const service = new CostEstimationService();

  it('adds travel estimates to a known procedure price', () => {
    const estimate = service.estimateTotalCost({
      procedurePriceCents: 140000,
      clinicCountryCode: 'ES',
      patientCountryCode: 'FR',
    });

    expect(estimate).toMatchObject({
      currencyCode: 'EUR',
      procedurePriceCents: 140000,
      estimatedFlightCents: 18000,
      estimatedHotelCents: 45000,
      estimatedTransferCents: 4500,
      estimatedTotalCents: 207500,
      isEstimate: true,
    });
    expect(estimate.assumptions).toContain('5 hotel nights estimated for MVP comparison.');
  });

  it('keeps total cost unknown when the clinic has no base price', () => {
    const estimate = service.estimateTotalCost({
      procedurePriceCents: null,
      clinicCountryCode: 'FR',
    });

    expect(estimate.estimatedTotalCents).toBeNull();
    expect(estimate.estimatedFlightCents).toBeGreaterThan(0);
  });
});

