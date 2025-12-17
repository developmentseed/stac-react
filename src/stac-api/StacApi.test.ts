import StacApi, { SearchMode } from './index';
import type { SearchRequestPayload } from '../types/stac';

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('StacApi', () => {
  let stacApi: StacApi;

  beforeEach(() => {
    jest.clearAllMocks();
    stacApi = new StacApi('https://api.example.com', SearchMode.POST);
  });

  describe('makeDatetimePayload', () => {
    it('should return undefined for undefined dateRange', () => {
      const result = stacApi.makeDatetimePayload(undefined);
      expect(result).toBeUndefined();
    });

    it('should return undefined for empty dateRange', () => {
      const result = stacApi.makeDatetimePayload({});
      expect(result).toBeUndefined();
    });

    it('should format date range with from and to appending time parts', () => {
      const dateRange = { from: '2025-12-01', to: '2025-12-31' };
      const result = stacApi.makeDatetimePayload(dateRange);
      // Simple date format for STAC API compatibility
      expect(result).toBe('2025-12-01T00:00:00Z/2025-12-31T23:59:59Z');
    });

    it('should format date range with only from', () => {
      const dateRange = { from: '2025-12-01' };
      const result = stacApi.makeDatetimePayload(dateRange);
      expect(result).toBe('2025-12-01T00:00:00Z/..');
    });

    it('should format date range with only to', () => {
      const dateRange = { to: '2025-12-31' };
      const result = stacApi.makeDatetimePayload(dateRange);
      expect(result).toBe('../2025-12-31T23:59:59Z');
    });

    it('should handle full datetime strings', () => {
      const dateRange = {
        from: '2025-12-01T11:11:11Z',
        to: '2025-12-31T11:11:11Z',
      };
      const result = stacApi.makeDatetimePayload(dateRange);
      expect(result).toBe('2025-12-01T11:11:11Z/2025-12-31T11:11:11Z');
    });
  });

  describe('search payload transformation', () => {
    beforeEach(() => {
      // Mock successful response
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ features: [] }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
    });

    it('should transform dateRange to datetime string in POST mode', async () => {
      const searchPayload: SearchRequestPayload = {
        collections: ['sentinel-2-l2a'],
        dateRange: { from: '2025-12-01', to: '2025-12-31' },
      };

      await stacApi.search(searchPayload);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/search',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({
            collections: ['sentinel-2-l2a'],
            datetime: '2025-12-01T00:00:00Z/2025-12-31T23:59:59Z',
            ids: undefined,
            bbox: undefined,
          }),
        })
      );
    });

    it('should transform dateRange to datetime string in GET mode', async () => {
      const getStacApi = new StacApi('https://api.example.com', SearchMode.GET);
      const searchPayload: SearchRequestPayload = {
        collections: ['sentinel-2-l2a'],
        dateRange: { from: '2025-12-01', to: '2025-12-31' },
      };

      await getStacApi.search(searchPayload);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/search?collections=sentinel-2-l2a&datetime=2025-12-01T00%3A00%3A00Z%2F2025-12-31T23%3A59%3A59Z',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should not include undefined values in POST payload', async () => {
      const searchPayload: SearchRequestPayload = {
        collections: ['sentinel-2-l2a'],
      };

      await stacApi.search(searchPayload);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/search',
        expect.objectContaining({
          body: JSON.stringify({
            collections: ['sentinel-2-l2a'],
            ids: undefined,
            bbox: undefined,
            datetime: undefined,
          }),
        })
      );
    });

    it('should not include undefined values in GET query string', async () => {
      const getStacApi = new StacApi('https://api.example.com', SearchMode.GET);
      const searchPayload: SearchRequestPayload = {
        collections: ['sentinel-2-l2a'],
      };

      await getStacApi.search(searchPayload);

      const expectedUrl = 'https://api.example.com/search?collections=sentinel-2-l2a';
      expect(mockFetch).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({
          method: 'GET',
        })
      );
    });
  });

  describe('payloadToQuery', () => {
    it('should convert arrays to comma-separated strings', () => {
      const payload = {
        collections: ['col1', 'col2'],
        ids: ['id1', 'id2', 'id3'],
      };
      const result = stacApi.payloadToQuery(payload);
      expect(result).toBe('collections=col1%2Ccol2&ids=id1%2Cid2%2Cid3');
    });

    it('should convert primitive values to strings', () => {
      const payload = {
        collections: ['col1'],
        datetime: '2025-12-01T00:00:00Z/2025-12-31T23:59:59Z',
      };
      const result = stacApi.payloadToQuery(payload);
      expect(result).toBe(
        'collections=col1&datetime=2025-12-01T00%3A00%3A00Z%2F2025-12-31T23%3A59%3A59Z'
      );
    });

    it('should skip undefined values', () => {
      const payload = {
        collections: ['col1'],
        ids: undefined,
        datetime: '2025-12-01T00:00:00Z/2025-12-31T23:59:59Z',
      };
      const result = stacApi.payloadToQuery(payload);
      expect(result).toBe(
        'collections=col1&datetime=2025-12-01T00%3A00%3A00Z%2F2025-12-31T23%3A59%3A59Z'
      );
    });

    it('should handle sortby parameter', () => {
      const payload = {
        collections: ['col1'],
        sortby: [
          { field: 'datetime', direction: 'desc' as const },
          { field: 'id', direction: 'asc' as const },
        ],
      };
      const result = stacApi.payloadToQuery(payload);
      expect(result).toBe('collections=col1&sortby=-datetime%2C%2Bid');
    });
  });
});
