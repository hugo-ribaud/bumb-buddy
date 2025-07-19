import { logger } from '../logger';

// Mock console methods
const originalConsole = global.console;
const mockConsole = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

describe('Logger', () => {
  beforeEach(() => {
    global.console = mockConsole as any;
    jest.clearAllMocks();
  });

  afterAll(() => {
    global.console = originalConsole;
  });

  describe('in development mode', () => {
    beforeEach(() => {
      // Mock development environment
      (global as any).__DEV__ = true;
    });

    it('should log debug messages in development', () => {
      logger.debug('Debug message');
      expect(mockConsole.debug).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG] Debug message')
      );
    });

    it('should log info messages in development', () => {
      logger.info('Info message');
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] Info message')
      );
    });
  });

  describe('error logging', () => {
    it('should always log errors', () => {
      const testError = new Error('Test error');
      logger.error('Error occurred', testError);
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR] Error occurred')
      );
    });

    it('should always log warnings', () => {
      logger.warn('Warning message');
      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('[WARN] Warning message')
      );
    });
  });

  describe('API logging', () => {
    it('should log API calls in development', () => {
      (global as any).__DEV__ = true;
      logger.api('GET', '/api/users', 200, 150);
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('GET /api/users')
      );
    });
  });
});