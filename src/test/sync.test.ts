import { dbService } from '../../services/mysqlDbService';
import * as mysqlClient from '../../services/mysqlClient';

vi.mock('../../services/mysqlClient', () => ({
  query: vi.fn(),
  queryOne: vi.fn(),
  default: {
    query: vi.fn(),
    queryOne: vi.fn()
  }
}));

describe('dbService Sync Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkConflict', () => {
    it('should return true if a conflict exists', async () => {
      vi.mocked(mysqlClient.queryOne).mockResolvedValue({ count: 1 });

      const result = await dbService.checkConflict('room-1', '2025-10-01', '2025-10-05');

      expect(result).toBe(true);
      expect(mysqlClient.queryOne).toHaveBeenCalled();
    });

    it('should return false if no conflict exists', async () => {
      vi.mocked(mysqlClient.queryOne).mockResolvedValue({ count: 0 });

      const result = await dbService.checkConflict('room-1', '2025-10-01', '2025-10-05');

      expect(result).toBe(false);
    });
  });

  describe('confirmBooking', () => {
    it('should update status to confirmed if no conflict', async () => {
      const mockBooking = { 
        id: 'b-1', 
        roomId: 'r-1', 
        checkIn: '2025-10-01', 
        checkOut: '2025-10-05', 
        status: 'queued' 
      };
      
      // Mock getById
      vi.mocked(mysqlClient.queryOne).mockResolvedValueOnce(mockBooking);
      // Mock checkConflict (queryOne inside checkConflict)
      vi.mocked(mysqlClient.queryOne).mockResolvedValueOnce({ count: 0 });
      // Mock update (query inside update)
      vi.mocked(mysqlClient.query).mockResolvedValueOnce([]);
      // Mock getById again after update
      vi.mocked(mysqlClient.queryOne).mockResolvedValueOnce({ ...mockBooking, status: 'confirmed' });

      const result = await dbService.confirmBooking('b-1');

      expect(result.status).toBe('confirmed');
    });

    it('should throw error if conflict detected', async () => {
      const mockBooking = { 
        id: 'b-1', 
        roomId: 'r-1', 
        checkIn: '2025-10-01', 
        checkOut: '2025-10-05', 
        status: 'queued' 
      };
      
      vi.mocked(mysqlClient.queryOne).mockResolvedValueOnce(mockBooking);
      vi.mocked(mysqlClient.queryOne).mockResolvedValueOnce({ count: 1 });

      await expect(dbService.confirmBooking('b-1')).rejects.toThrow('Double booking detected');
    });
  });
});
