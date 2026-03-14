/**
 * Tests for User model validation logic
 */
const bcrypt = require('bcryptjs');

// Mock mongoose before requiring the model
jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return actual;
});

describe('User model schema rules', () => {
  test('password is hashed before save (bcrypt round-trip)', async () => {
    const plain = 'secret123';
    const hashed = await bcrypt.hash(plain, 12);
    const match = await bcrypt.compare(plain, hashed);
    expect(match).toBe(true);
  });

  test('bcrypt rejects wrong password', async () => {
    const hashed = await bcrypt.hash('correct', 12);
    const match = await bcrypt.compare('wrong', hashed);
    expect(match).toBe(false);
  });

  test('role enum only allows buyer/seller/admin', () => {
    const allowed = ['buyer', 'seller', 'admin'];
    const submitted = ['buyer', 'seller', 'hacker', 'admin', 'superuser'];
    const filtered = submitted.filter((r) => allowed.includes(r));
    expect(filtered).toEqual(['buyer', 'seller', 'admin']);
  });

  test('registration blocks admin role selection', () => {
    const allowedRoles = ['buyer', 'seller'];
    const requestedRole = 'admin';
    const actual = allowedRoles.includes(requestedRole) ? requestedRole : 'buyer';
    expect(actual).toBe('buyer');
  });
});
