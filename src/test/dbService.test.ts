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

describe('dbService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  it('should fetch all records from a table', async () => {
    const mockData = [{ id: '1', name: 'Test Room' }];
    vi.mocked(mysqlClient.query).mockResolvedValue(mockData);

    const result = await dbService.getAll('rooms');

    expect(mysqlClient.query).toHaveBeenCalled();
    expect(result).toEqual(mockData);
  });

  it('should fetch a single record by ID', async () => {
    const mockRoom = { id: 'room-123', number: '101' };
    vi.mocked(mysqlClient.queryOne).mockResolvedValue(mockRoom);

    const result = await dbService.getById('rooms', 'room-123');

    expect(mysqlClient.queryOne).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM rooms WHERE id = ?'),
      ['room-123']
    );
    expect(result).toEqual(mockRoom);
  });

  it('should return undefined for invalid IDs', async () => {
    vi.mocked(mysqlClient.queryOne).mockResolvedValue(null);
    const result = await dbService.getById('rooms', 'invalid-id-!!!');
    expect(result).toBeUndefined();
  });
});
