import type { QueryObserverResult } from '@tanstack/react-query';

export type GenericObject = {
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

export type ApiErrorType = {
  detail?: GenericObject | string;
  status: number;
  statusText: string;
  url?: string;
};

/**
 * Base interface for all STAC hooks providing common loading state and error handling.
 * All data-fetching hooks (useCollection, useCollections, useItem, useStacSearch)
 * extend this interface with their specific data and refetch signatures.
 */
export interface StacHook {
  /** True during initial data fetch (no cached data available) */
  isLoading: boolean;
  /** True during any fetch operation (including background refetches) */
  isFetching: boolean;
  /** Error information if the last request was unsuccessful */
  error?: ApiErrorType;
}

/**
 * Generic refetch function type for STAC hooks.
 * Returns a Promise with the query result including data and error information.
 */
export type StacRefetchFn<T> = () => Promise<QueryObserverResult<T, ApiErrorType>>;
