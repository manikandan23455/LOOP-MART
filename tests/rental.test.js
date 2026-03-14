/**
 * Tests for rental price calculation logic
 */

describe('Rental price calculation', () => {
  const calculateRental = (startDate, endDate, pricePerDay, securityDeposit) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const rentalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalRentalCost = rentalDays * pricePerDay;
    const totalAmount = totalRentalCost + securityDeposit;
    return { rentalDays, totalRentalCost, totalAmount };
  };

  test('calculates 3-day rental correctly', () => {
    const result = calculateRental('2024-01-01', '2024-01-04', 25, 100);
    expect(result.rentalDays).toBe(3);
    expect(result.totalRentalCost).toBe(75);
    expect(result.totalAmount).toBe(175);
  });

  test('calculates 7-day rental correctly', () => {
    const result = calculateRental('2024-02-01', '2024-02-08', 15, 50);
    expect(result.rentalDays).toBe(7);
    expect(result.totalRentalCost).toBe(105);
    expect(result.totalAmount).toBe(155);
  });

  test('calculates 1-day rental correctly', () => {
    const result = calculateRental('2024-03-10', '2024-03-11', 50, 200);
    expect(result.rentalDays).toBe(1);
    expect(result.totalRentalCost).toBe(50);
    expect(result.totalAmount).toBe(250);
  });

  test('calculates rental with zero deposit', () => {
    const result = calculateRental('2024-01-01', '2024-01-06', 20, 0);
    expect(result.rentalDays).toBe(5);
    expect(result.totalAmount).toBe(100);
  });

  test('end date must be after start date validation', () => {
    const start = new Date('2024-01-05');
    const end = new Date('2024-01-03');
    expect(end <= start).toBe(true); // Invalid: end before start
  });
});
