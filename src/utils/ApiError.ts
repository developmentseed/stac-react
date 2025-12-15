import type { GenericObject } from '../types';

/**
 * Custom error class for STAC API errors.
 * Extends the native Error class with HTTP response details.
 */
export class ApiError extends Error {
  status: number;
  statusText: string;
  detail?: GenericObject | string;
  url?: string;

  constructor(statusText: string, status: number, detail?: GenericObject | string, url?: string) {
    super(statusText);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.detail = detail;
    this.url = url;

    // Maintains proper stack trace for where our error was thrown
    // Note: Error.captureStackTrace is a V8-only feature (Node.js, Chrome)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}
