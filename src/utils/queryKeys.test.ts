import { describe, it, expect } from '@jest/globals';
import {
  generateStacSearchQueryKey,
  generateStacApiQueryKey,
  generateItemQueryKey,
  generateCollectionsQueryKey,
  generateCollectionQueryKey,
} from './queryKeys';
import type { SearchRequestPayload, Sortby } from '../types/stac';

describe('Query Key Generators', () => {
  describe('generateCollectionsQueryKey', () => {
    it('should generate a simple static key', () => {
      const key = generateCollectionsQueryKey();
      expect(key).toEqual(['collections']);
    });
  });

  describe('generateCollectionQueryKey', () => {
    it('should generate key with collection ID', () => {
      const key = generateCollectionQueryKey('my-collection');
      expect(key).toEqual(['collection', 'my-collection']);
    });

    it('should handle different collection IDs', () => {
      const key1 = generateCollectionQueryKey('collection-a');
      const key2 = generateCollectionQueryKey('collection-b');
      expect(key1).not.toEqual(key2);
      expect(key1).toEqual(['collection', 'collection-a']);
      expect(key2).toEqual(['collection', 'collection-b']);
    });
  });

  describe('generateItemQueryKey', () => {
    it('should generate key with item URL', () => {
      const url = 'https://example.com/collections/test/items/item1';
      const key = generateItemQueryKey(url);
      expect(key).toEqual(['item', url]);
    });

    it('should handle different URLs', () => {
      const url1 = 'https://example.com/items/a';
      const url2 = 'https://example.com/items/b';
      const key1 = generateItemQueryKey(url1);
      const key2 = generateItemQueryKey(url2);
      expect(key1).not.toEqual(key2);
      expect(key1).toEqual(['item', url1]);
      expect(key2).toEqual(['item', url2]);
    });
  });

  describe('generateStacApiQueryKey', () => {
    it('should generate key with URL only when no options', () => {
      const url = 'https://example.com/stac';
      const key = generateStacApiQueryKey(url);
      expect(key).toEqual(['stacApi', url, undefined]);
    });

    it('should extract only headers from options', () => {
      const url = 'https://example.com/stac';
      const options = {
        headers: { Authorization: 'Bearer token123' },
        someOtherField: { deeply: { nested: { object: 'value' } } },
        anotherField: 'ignored',
      };
      const key = generateStacApiQueryKey(url, options);
      expect(key).toEqual(['stacApi', url, { headers: { Authorization: 'Bearer token123' } }]);
    });

    it('should handle options without headers', () => {
      const url = 'https://example.com/stac';
      const options = {
        someField: 'value',
        anotherField: { nested: 'data' },
      };
      const key = generateStacApiQueryKey(url, options);
      expect(key).toEqual(['stacApi', url, undefined]);
    });

    it('should handle empty options object', () => {
      const url = 'https://example.com/stac';
      const key = generateStacApiQueryKey(url, {});
      expect(key).toEqual(['stacApi', url, undefined]);
    });
  });

  describe('generateStacSearchQueryKey', () => {
    describe('for search requests', () => {
      it('should generate key with minimal search params', () => {
        const payload: SearchRequestPayload = {
          collections: ['collection1'],
          limit: 25,
        };
        const key = generateStacSearchQueryKey({ type: 'search', payload });
        expect(key).toEqual([
          'stacSearch',
          'search',
          {
            collections: ['collection1'],
            limit: 25,
          },
        ]);
      });

      it('should include all search parameters when present', () => {
        const sortby: Sortby[] = [
          { field: 'id', direction: 'asc' },
          { field: 'properties.cloud', direction: 'desc' },
        ];
        const payload: SearchRequestPayload = {
          ids: ['item1', 'item2'],
          bbox: [-180, -90, 180, 90],
          collections: ['collection1', 'collection2'],
          datetime: '2023-01-01/2023-12-31',
          sortby,
          limit: 50,
        };
        const key = generateStacSearchQueryKey({ type: 'search', payload });
        expect(key).toEqual([
          'stacSearch',
          'search',
          {
            ids: ['item1', 'item2'],
            bbox: [-180, -90, 180, 90],
            collections: ['collection1', 'collection2'],
            datetime: '2023-01-01/2023-12-31',
            sortby,
            limit: 50,
          },
        ]);
      });

      it('should omit undefined search parameters', () => {
        const payload: SearchRequestPayload = {
          collections: ['collection1'],
          limit: 25,
        };
        const key = generateStacSearchQueryKey({ type: 'search', payload });
        expect(key[2]).not.toHaveProperty('ids');
        expect(key[2]).not.toHaveProperty('bbox');
        expect(key[2]).not.toHaveProperty('datetime');
        expect(key[2]).not.toHaveProperty('sortby');
      });

      it('should handle empty collections array', () => {
        const payload: SearchRequestPayload = {
          collections: [],
          limit: 25,
        };
        const key = generateStacSearchQueryKey({ type: 'search', payload });
        expect(key).toEqual([
          'stacSearch',
          'search',
          {
            collections: [],
            limit: 25,
          },
        ]);
      });

      it('should ignore headers in search requests for key generation', () => {
        const payload: SearchRequestPayload = {
          collections: ['collection1'],
          limit: 25,
        };
        const key = generateStacSearchQueryKey({
          type: 'search',
          payload,
          headers: { Authorization: 'Bearer token', 'X-Custom': 'value' },
        });
        expect(key).toEqual([
          'stacSearch',
          'search',
          {
            collections: ['collection1'],
            limit: 25,
          },
        ]);
        expect(key[2]).not.toHaveProperty('headers');
      });
    });

    describe('for pagination GET requests', () => {
      it('should generate key with URL for GET requests', () => {
        const url = 'https://example.com/search?page=2&limit=25';
        const key = generateStacSearchQueryKey({ type: 'get', url });
        expect(key).toEqual(['stacSearch', 'page', url]);
      });

      it('should handle different pagination URLs', () => {
        const url1 = 'https://example.com/search?page=1';
        const url2 = 'https://example.com/search?page=2';
        const key1 = generateStacSearchQueryKey({ type: 'get', url: url1 });
        const key2 = generateStacSearchQueryKey({ type: 'get', url: url2 });
        expect(key1).not.toEqual(key2);
        expect(key1).toEqual(['stacSearch', 'page', url1]);
        expect(key2).toEqual(['stacSearch', 'page', url2]);
      });
    });

    describe('key stability', () => {
      it('should generate identical keys for identical search payloads', () => {
        const payload: SearchRequestPayload = {
          collections: ['collection1', 'collection2'],
          bbox: [-10, -5, 10, 5],
          limit: 25,
        };
        const key1 = generateStacSearchQueryKey({ type: 'search', payload });
        const key2 = generateStacSearchQueryKey({ type: 'search', payload });
        expect(key1).toEqual(key2);
      });

      it('should generate different keys for different search payloads', () => {
        const payload1: SearchRequestPayload = {
          collections: ['collection1'],
          limit: 25,
        };
        const payload2: SearchRequestPayload = {
          collections: ['collection2'],
          limit: 25,
        };
        const key1 = generateStacSearchQueryKey({ type: 'search', payload: payload1 });
        const key2 = generateStacSearchQueryKey({ type: 'search', payload: payload2 });
        expect(key1).not.toEqual(key2);
      });

      it('should generate different keys when only limit changes', () => {
        const payload1: SearchRequestPayload = {
          collections: ['collection1'],
          limit: 25,
        };
        const payload2: SearchRequestPayload = {
          collections: ['collection1'],
          limit: 50,
        };
        const key1 = generateStacSearchQueryKey({ type: 'search', payload: payload1 });
        const key2 = generateStacSearchQueryKey({ type: 'search', payload: payload2 });
        expect(key1).not.toEqual(key2);
      });

      it('should include extra properties for pagination tokens and custom params', () => {
        const payload1: SearchRequestPayload = {
          collections: ['collection1'],
          limit: 25,
        };

        const payload2 = {
          collections: ['collection1'],
          limit: 25,
          token: 'next:abc123',
        } as SearchRequestPayload;
        const key1 = generateStacSearchQueryKey({ type: 'search', payload: payload1 });
        const key2 = generateStacSearchQueryKey({ type: 'search', payload: payload2 });

        expect(key1).not.toEqual(key2);
        expect(key2[2]).toHaveProperty('token', 'next:abc123');
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty search payload', () => {
      const payload: SearchRequestPayload = {};
      const key = generateStacSearchQueryKey({ type: 'search', payload });
      expect(key).toEqual(['stacSearch', 'search', {}]);
    });

    it('should handle very long URLs', () => {
      const longUrl = 'https://example.com/items/' + 'a'.repeat(1000);
      const key = generateItemQueryKey(longUrl);
      expect(key).toEqual(['item', longUrl]);
    });

    it('should handle special characters in URLs', () => {
      const url = 'https://example.com/items/test%20item?query=hello&world=1';
      const key = generateItemQueryKey(url);
      expect(key).toEqual(['item', url]);
    });
  });
});
