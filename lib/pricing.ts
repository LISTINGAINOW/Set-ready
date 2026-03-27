export const HOST_FEE_RATE = 0;
export const PRODUCER_FEE_RATE = 0.10;
export const MINIMUM_BOOKING_TOTAL = 49;

export type PricingBreakdown = {
  baseRate: number;
  producerFee: number;
  hostFee: number;
  subtotal: number;
  total: number;
  bookingMinimumAdjustment: number;
};

function clampCurrency(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, value);
}

export function calculateBookingPricing(baseRateInput: number): PricingBreakdown {
  const baseRate = clampCurrency(baseRateInput);
  const producerFee = clampCurrency(baseRate * PRODUCER_FEE_RATE);
  const hostFee = clampCurrency(baseRate * HOST_FEE_RATE);
  const subtotal = clampCurrency(baseRate + producerFee);
  const total = Math.max(subtotal, MINIMUM_BOOKING_TOTAL);
  const bookingMinimumAdjustment = clampCurrency(total - subtotal);

  return {
    baseRate,
    producerFee,
    hostFee,
    subtotal,
    total,
    bookingMinimumAdjustment,
  };
}
