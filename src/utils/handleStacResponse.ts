import { ApiError } from './ApiError';

/**
 * Handles STAC API response parsing and error handling.
 *
 * This utility function consolidates the common pattern of:
 * 1. Checking response.ok status
 * 2. Parsing error details (JSON or text)
 * 3. Throwing ApiError with proper details
 * 4. Parsing successful JSON response
 *
 * Hooks can use this for standard response handling while retaining
 * the flexibility to work with raw Response objects when needed
 * (e.g., checking headers, status codes, ETags).
 *
 * @param response - The Response object from a fetch call
 * @returns Parsed JSON data of type T
 * @throws ApiError with status, statusText, detail, and url
 *
 * @example
 * ```typescript
 * const response = await stacApi.getCollection(collectionId);
 * const collection = await handleStacResponse<Collection>(response);
 * ```
 */
export async function handleStacResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail;
    try {
      detail = await response.json();
    } catch {
      const clone = response.clone();
      try {
        detail = await clone.text();
      } catch {
        detail = 'Unable to parse error response';
      }
    }

    throw new ApiError(response.statusText, response.status, detail, response.url);
  }

  try {
    return await response.json();
  } catch (error) {
    throw new ApiError(
      'Invalid JSON Response',
      response.status,
      `Response is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
      response.url
    );
  }
}
