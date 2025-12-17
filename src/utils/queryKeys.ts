import type { SearchRequestPayload, FetchRequest } from '../types/stac';
import type { GenericObject } from '../types';

/**
 * Extracts only the essential search parameters from a payload for query key generation.
 * This creates a minimal, stable key that's cheap to hash.
 * Handles both dateRange (from useStacSearch state) and datetime (from API transformations).
 * Also includes pagination-specific parameters (token, page, merge) that make requests unique.
 */
function extractSearchParams(payload: SearchRequestPayload): Record<string, unknown> {
  const params: Record<string, unknown> = {};

  // Only include defined search parameters
  if (payload.ids !== undefined) params.ids = payload.ids;
  if (payload.bbox !== undefined) params.bbox = payload.bbox;
  if (payload.collections !== undefined) params.collections = payload.collections;

  // Handle both dateRange (from hook state) and datetime (from API transformation)
  if (payload.datetime !== undefined) {
    params.datetime = payload.datetime;
  } else if (payload.dateRange !== undefined) {
    // Convert dateRange to datetime format for consistent keys
    const { from, to } = payload.dateRange;
    if (from || to) {
      params.datetime = `${from || '..'}/${to || '..'}`;
    }
  }

  if (payload.sortby !== undefined) params.sortby = payload.sortby;
  if (payload.limit !== undefined) params.limit = payload.limit;

  // Include pagination-specific parameters
  if (payload.token !== undefined) params.token = payload.token;
  if (payload.page !== undefined) params.page = payload.page;
  if (payload.merge !== undefined) params.merge = payload.merge;

  return params;
}

/**
 * Generates a query key for STAC collections requests.
 * Collections are fetched from a single endpoint with no parameters.
 */
export function generateCollectionsQueryKey(): [string] {
  return ['collections'];
}

/**
 * Generates a query key for a single STAC collection request.
 * Collections are fetched by ID from /collections/{collectionId}.
 */
export function generateCollectionQueryKey(collectionId: string): [string, string] {
  return ['collection', collectionId];
}

/**
 * Generates a query key for STAC item requests.
 * Items are fetched by URL.
 */
export function generateItemQueryKey(url: string): [string, string] {
  return ['item', url];
}

/**
 * Generates a query key for STAC API initialization.
 * Extracts only the headers from options to avoid including large nested objects.
 */
export function generateStacApiQueryKey(
  url: string,
  options?: GenericObject
): [string, string, { headers: GenericObject } | undefined] {
  // Only include headers in the query key, as other options don't affect the API initialization
  const relevantOptions = options?.headers ? { headers: options.headers } : undefined;
  return ['stacApi', url, relevantOptions];
}

/**
 * Generates a query key for STAC search requests.
 * For search requests: extracts minimal search parameters (ids, bbox, collections, datetime, sortby, limit)
 * For pagination GET requests: uses the URL
 *
 * This ensures the query key is:
 * - Small and cheap to hash
 * - Stable across identical requests
 * - Free from irrelevant data like headers
 */
export function generateStacSearchQueryKey(
  request: FetchRequest
): [string, string, string] | [string, string, Record<string, unknown>] {
  if (request.type === 'get') {
    // For pagination GET requests, use the URL
    return ['stacSearch', 'page', request.url];
  } else {
    // For search requests, extract only the essential search parameters
    const searchParams = extractSearchParams(request.payload);
    return ['stacSearch', 'search', searchParams];
  }
}
