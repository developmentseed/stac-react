import StacApi, { SearchMode } from './index';
import type { SearchRequestPayload } from '../types/stac';

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('StacApi', () => {
  let stacApi: StacApi;

  beforeEach(() => {
    jest.clearAllMocks();
    stacApi = new StacApi({
      baseUrl: 'https://api.example.com',
      searchMode: SearchMode.POST,
    });
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
      const getStacApi = new StacApi({
        baseUrl: 'https://api.example.com',
        searchMode: SearchMode.GET,
      });
      const searchPayload: SearchRequestPayload = {
        collections: ['sentinel-2-l2a'],
        dateRange: { from: '2025-12-01', to: '2025-12-31' },
      };

      await getStacApi.search(searchPayload);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/search?collections=sentinel-2-l2a&datetime=2025-12-01T00%3A00%3A00Z%2F2025-12-31T23%3A59%3A59Z',
        expect.objectContaining({
          method: 'GET',
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
      const getStacApi = new StacApi({
        baseUrl: 'https://api.example.com',
        searchMode: SearchMode.GET,
      });
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

  describe('auth headers getter', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
    });

    function getSentHeaders(): Record<string, string> {
      const init = mockFetch.mock.calls[0][1] as RequestInit;
      return (init.headers || {}) as Record<string, string>;
    }

    function makeApi(
      baseUrl: string,
      getAuthHeaders?: () => Record<string, string> | undefined,
      options?: { headers?: Record<string, string> },
    ) {
      return new StacApi({
        baseUrl,
        searchMode: SearchMode.GET,
        options,
        getAuthHeaders,
      });
    }

    it('injects auth headers for in-domain requests', async () => {
      const api = makeApi('https://api.example.com', () => ({ Authorization: 'Bearer tok-1' }));

      await api.fetch('https://api.example.com/collections');

      expect(getSentHeaders()).toMatchObject({ Authorization: 'Bearer tok-1' });
    });

    it('does not inject for out-of-domain URLs', async () => {
      const api = makeApi('https://api.example.com', () => ({ Authorization: 'Bearer tok-1' }));

      await api.fetch('https://other.example.com/asset.tif');

      expect(getSentHeaders()).not.toHaveProperty('Authorization');
    });

    it('does not inject when getter returns undefined', async () => {
      const api = makeApi('https://api.example.com', () => undefined);

      await api.fetch('https://api.example.com/collections');

      expect(getSentHeaders()).not.toHaveProperty('Authorization');
    });

    it('reads fresh headers on each call (no caching)', async () => {
      let token = 'first';
      const api = makeApi('https://api.example.com', () => ({ Authorization: `Bearer ${token}` }));

      await api.fetch('https://api.example.com/collections');
      expect(getSentHeaders()).toMatchObject({ Authorization: 'Bearer first' });

      mockFetch.mockClear();
      token = 'second';
      await api.fetch('https://api.example.com/collections');
      expect(getSentHeaders()).toMatchObject({ Authorization: 'Bearer second' });
    });

    it('login after construction: undefined → defined causes next fetch to carry headers', async () => {
      let headers: Record<string, string> | undefined;
      const api = makeApi('https://api.example.com', () => headers);

      await api.fetch('https://api.example.com/collections');
      expect(getSentHeaders()).not.toHaveProperty('Authorization');

      mockFetch.mockClear();
      headers = { Authorization: 'Bearer late', 'X-Tenant': 'acme' };
      await api.fetch('https://api.example.com/collections');
      expect(getSentHeaders()).toMatchObject({
        Authorization: 'Bearer late',
        'X-Tenant': 'acme',
      });
    });

    it('lets call-time headers override the injected Authorization', async () => {
      const api = makeApi('https://api.example.com', () => ({ Authorization: 'Bearer tok-1' }));

      await api.fetch('https://api.example.com/collections', {
        headers: { Authorization: 'Bearer override' },
      });

      expect(getSentHeaders()).toMatchObject({ Authorization: 'Bearer override' });
    });

    it('lets instance options.headers override the injected Authorization', async () => {
      const api = makeApi(
        'https://api.example.com',
        () => ({ Authorization: 'Bearer tok-1' }),
        { headers: { Authorization: 'Bearer static' } },
      );

      await api.fetch('https://api.example.com/collections');

      expect(getSentHeaders()).toMatchObject({ Authorization: 'Bearer static' });
    });

    describe('isInDomain edge cases', () => {
      const allow = () => ({ Authorization: 'Bearer t' });

      it('rejects sibling host with shared prefix', async () => {
        const api = makeApi('https://api.example.com', allow);
        await api.fetch('https://api.example.com.evil.test/');
        expect(getSentHeaders()).not.toHaveProperty('Authorization');
      });

      it('rejects userinfo confused-deputy', async () => {
        const api = makeApi('https://api.example.com', allow);
        await api.fetch('https://api.example.com@evil.test/foo');
        expect(getSentHeaders()).not.toHaveProperty('Authorization');
      });

      it('treats default port (:443) as origin-equivalent', async () => {
        const api = makeApi('https://api.example.com', allow);
        await api.fetch('https://api.example.com:443/collections');
        expect(getSentHeaders()).toMatchObject({ Authorization: 'Bearer t' });
      });

      it('treats uppercase host as origin-equivalent', async () => {
        const api = makeApi('https://api.example.com', allow);
        await api.fetch('https://API.EXAMPLE.COM/collections');
        expect(getSentHeaders()).toMatchObject({ Authorization: 'Bearer t' });
      });

      it('injects on querystring-only path against bare baseUrl', async () => {
        const api = makeApi('https://api.example.com', allow);
        await api.fetch('https://api.example.com?x=1');
        expect(getSentHeaders()).toMatchObject({ Authorization: 'Bearer t' });
      });

      it('injects on fragment-only against bare baseUrl', async () => {
        const api = makeApi('https://api.example.com', allow);
        await api.fetch('https://api.example.com#frag');
        expect(getSentHeaders()).toMatchObject({ Authorization: 'Bearer t' });
      });

      it('path-scoped baseUrl: querystring at the root is in-domain', async () => {
        const api = makeApi('https://api.example.com/v1', allow);
        await api.fetch('https://api.example.com/v1?x=1');
        expect(getSentHeaders()).toMatchObject({ Authorization: 'Bearer t' });
      });

      it('path-scoped baseUrl: deeper path is in-domain', async () => {
        const api = makeApi('https://api.example.com/v1', allow);
        await api.fetch('https://api.example.com/v1/collections/foo');
        expect(getSentHeaders()).toMatchObject({ Authorization: 'Bearer t' });
      });

      it('path-scoped baseUrl: prefix-collision sibling path is rejected', async () => {
        const api = makeApi('https://api.example.com/v1', allow);
        await api.fetch('https://api.example.com/v10/collections');
        expect(getSentHeaders()).not.toHaveProperty('Authorization');
      });

      it('rejects different origin (port mismatch)', async () => {
        const api = makeApi('https://api.example.com', allow);
        await api.fetch('https://api.example.com:8443/collections');
        expect(getSentHeaders()).not.toHaveProperty('Authorization');
      });

      it('rejects http→https origin mismatch', async () => {
        const api = makeApi('https://api.example.com', allow);
        await api.fetch('http://api.example.com/collections');
        expect(getSentHeaders()).not.toHaveProperty('Authorization');
      });

      it('rejects unparseable URL', async () => {
        const api = makeApi('https://api.example.com', allow);
        await api.fetch('not a url');
        expect(getSentHeaders()).not.toHaveProperty('Authorization');
      });

      it('strips multiple trailing slashes from baseUrl', async () => {
        const api = makeApi('https://api.example.com///', allow);
        await api.fetch('https://api.example.com/collections');
        expect(getSentHeaders()).toMatchObject({ Authorization: 'Bearer t' });
      });
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
