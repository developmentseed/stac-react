import { handleStacResponse } from './handleStacResponse';
import { ApiError } from './ApiError';

describe('handleStacResponse', () => {
  describe('successful responses', () => {
    it('should parse and return JSON data', async () => {
      const mockData = { id: 'collection-1', type: 'Collection' };
      const jsonFn = jest.fn().mockResolvedValue(mockData);
      const mockResponse = {
        ok: true,
        status: 200,
        url: 'https://api.example.com/collections/collection-1',
        json: jsonFn,
      } as unknown as Response;

      const result = await handleStacResponse(mockResponse);
      expect(result).toEqual(mockData);
      expect(jsonFn).toHaveBeenCalledTimes(1);
    });

    it('should handle different data types', async () => {
      const mockData = { features: [], type: 'FeatureCollection' };
      const mockResponse = {
        ok: true,
        status: 200,
        url: 'https://api.example.com/search',
        json: jest.fn().mockResolvedValue(mockData),
      } as unknown as Response;

      const result = await handleStacResponse(mockResponse);
      expect(result).toEqual(mockData);
    });
  });

  describe('error responses', () => {
    it('should throw ApiError with JSON error detail', async () => {
      const errorDetail = { code: 'NotFound', message: 'Collection not found' };
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        url: 'https://api.example.com/collections/missing',
        json: jest.fn().mockResolvedValue(errorDetail),
      } as unknown as Response;

      await expect(handleStacResponse(mockResponse)).rejects.toThrow(ApiError);
      await expect(handleStacResponse(mockResponse)).rejects.toMatchObject({
        status: 404,
        statusText: 'Not Found',
        detail: errorDetail,
        url: 'https://api.example.com/collections/missing',
      });
    });

    it('should throw ApiError with text error detail when JSON parsing fails', async () => {
      const errorText = 'Internal Server Error';
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        url: 'https://api.example.com/search',
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
        clone: jest.fn().mockReturnValue({
          text: jest.fn().mockResolvedValue(errorText),
        }),
      } as unknown as Response;

      await expect(handleStacResponse(mockResponse)).rejects.toThrow(ApiError);
      await expect(handleStacResponse(mockResponse)).rejects.toMatchObject({
        status: 500,
        statusText: 'Internal Server Error',
        detail: errorText,
        url: 'https://api.example.com/search',
      });
    });

    it('should handle case where both JSON and text parsing fail', async () => {
      const mockResponse = {
        ok: false,
        status: 502,
        statusText: 'Bad Gateway',
        url: 'https://api.example.com/search',
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
        clone: jest.fn().mockReturnValue({
          text: jest.fn().mockRejectedValue(new Error('Cannot read text')),
        }),
      } as unknown as Response;

      await expect(handleStacResponse(mockResponse)).rejects.toThrow(ApiError);
      await expect(handleStacResponse(mockResponse)).rejects.toMatchObject({
        status: 502,
        statusText: 'Bad Gateway',
        detail: 'Unable to parse error response',
        url: 'https://api.example.com/search',
      });
    });
  });

  describe('invalid JSON responses', () => {
    it('should throw ApiError when successful response has invalid JSON', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        url: 'https://api.example.com/collections',
        json: jest.fn().mockRejectedValue(new SyntaxError('Unexpected token')),
      } as unknown as Response;

      await expect(handleStacResponse(mockResponse)).rejects.toThrow(ApiError);
      await expect(handleStacResponse(mockResponse)).rejects.toMatchObject({
        statusText: 'Invalid JSON Response',
        status: 200,
        url: 'https://api.example.com/collections',
      });
    });

    it('should include error message in detail for invalid JSON', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        url: 'https://api.example.com/collections',
        json: jest.fn().mockRejectedValue(new SyntaxError('Unexpected end of JSON input')),
      } as unknown as Response;

      try {
        await handleStacResponse(mockResponse);
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        const apiError = error as ApiError;
        expect(apiError.detail).toContain('Response is not valid JSON');
        expect(apiError.detail).toContain('Unexpected end of JSON input');
      }
    });
  });

  describe('TypeScript generic support', () => {
    it('should return correctly typed data', async () => {
      type Collection = { id: string; type: 'Collection'; title: string };
      const mockData: Collection = { id: 'col-1', type: 'Collection', title: 'Test Collection' };
      const mockResponse = {
        ok: true,
        status: 200,
        url: 'https://api.example.com/collections/col-1',
        json: jest.fn().mockResolvedValue(mockData),
      } as unknown as Response;

      const result = await handleStacResponse<Collection>(mockResponse);
      expect(result.id).toBe('col-1');
      expect(result.type).toBe('Collection');
      expect(result.title).toBe('Test Collection');
    });
  });
});
