const mongoose = require('mongoose');

// In-memory mock for mongoose to avoid real DB connection in tests
jest.mock('../config/database', () => jest.fn().mockResolvedValue(true));
jest.mock('connect-mongo', () => ({
  create: jest.fn().mockReturnValue({}),
}));

// Suppress console output
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(async () => {
  jest.restoreAllMocks();
});
