# Migration Guide: stac-react v1.0.0 (TanStack Query)

This guide helps you migrate your code from the previous version of stac-react (using custom fetch logic) to the new version that uses **TanStack Query** for data fetching and caching.

## Overview of Changes

The migration introduces three major improvements:

1. **TanStack Query Integration**: Automatic caching, request deduplication, and background updates
2. **Simplified API**: Cleaner return types using `isLoading`/`isFetching` instead of custom state management
3. **Better Error Handling**: Centralized error objects with proper TypeScript types

---

## Breaking Changes

### 1. Hook Return Type: `state` → `isLoading` + `isFetching`

**Before:**

```typescript
const { state, error, results } = useStacSearch();

if (state === 'LOADING') {
  // Show loading UI
}

type LoadingState = 'IDLE' | 'LOADING';
```

**After:**

```typescript
const { isLoading, isFetching, error, results } = useStacSearch();

if (isLoading) {
  // Initial load
}

if (isFetching) {
  // Any fetch (background updates, pagination)
}

// isLoading: boolean (true during initial fetch)
// isFetching: boolean (true during any fetch, including background updates)
```

**Why the change?**

TanStack Query distinguishes between:

- **`isLoading`**: Initial data fetch in progress (no cached data)
- **`isFetching`**: Any fetch in progress (including cache updates)

This gives you more fine-grained control over UX—you can show a skeleton loader for `isLoading` and a subtle refresh indicator for `isFetching`.

**Migration checklist:**

- [ ] Replace `state === 'LOADING'` with `isLoading`
- [ ] Replace `state === 'IDLE'` with `!isLoading`
- [ ] Use `isFetching` for background update indicators
- [ ] Update any error handling that checked `state`

---

### 2. Method Rename: `reload` → `refetch`

All hooks now use `refetch` to align with TanStack Query terminology.

**Before:**

```typescript
const { collection, reload } = useCollection('my-collection');

const handleRefresh = () => {
  reload(); // Custom method
};
```

**After:**

```typescript
const { collection, refetch } = useCollection('my-collection');

const handleRefresh = async () => {
  await refetch(); // TanStack Query standard
};
```

**What's different?**

The new `refetch` function:

- Returns a Promise with the query result
- Is async (awaitable)
- Can be cancelled
- Respects retry configuration

**Migration checklist:**

- [ ] Rename all `reload()` calls to `refetch()`
- [ ] Make callers async if needed
- [ ] Consider handling the returned promise

---

### 3. Removed: `collections` and `items` from Context

**Before:**

```typescript
const { collections, items } = useStacApiContext();

// You could access cached data directly
const allItems = items;
```

**After:**

```typescript
// Use individual hooks instead
const { collections } = useCollections();
const { item } = useItem(itemUrl);

// Or useStacSearch for items
const { results: itemsResponse } = useStacSearch();
```

**Why?**

- Storing all data in context creates memory bloat
- TanStack Query manages caching automatically
- Individual hooks are more composable and efficient

**Migration checklist:**

- [ ] Replace `useStacApiContext()` for data access with individual hooks
- [ ] Use `useCollections()` instead of context for collections
- [ ] Use `useItem()` or `useStacSearch()` for items
- [ ] Update any components that relied on global data

---

### 4. Error Handling: Unified `ApiError` Object

**Before:**

```typescript
const { error } = useCollection('my-collection');

// Errors were generic Error objects with Object.assign pattern
if (error && error.status === 404) {
  // Collection not found
}
```

**After:**

```typescript
import type { ApiErrorType } from 'stac-react';

const { error } = useCollection('my-collection');

if (error?.status === 404) {
  // Collection not found
}

// Error has proper TypeScript types
// error: {
//   status: number;
//   statusText: string;
//   detail?: GenericObject | string;
// }
```

**What's different?**

- Errors are now proper class instances with `ApiError`
- Better TypeScript support with `ApiErrorType`
- Includes HTTP status codes and response details
- Consistent across all hooks

**Migration checklist:**

- [ ] Import `ApiErrorType` from 'stac-react'
- [ ] Update error checks to use typed properties
- [ ] Test error scenarios (404, 500, network failures)

---

## API Changes by Hook

### `useStacSearch()`

The most significant changes are in `useStacSearch`:

#### Before: Manual State Management

```typescript
function MySearch() {
  const {
    state,
    error,
    results,
    setCollections,
    setBbox,
    submit,
  } = useStacSearch();

  const handleSearch = () => {
    setCollections(['landsat-8']);
    setBbox([-180, -90, 180, 90]);
    submit(); // Must call submit manually
  };

  if (state === 'LOADING') return <div>Loading...</div>;

  return (
    <div>
      <button onClick={handleSearch}>Search</button>
      {results && <p>{results.features.length} items found</p>}
    </div>
  );
}
```

#### After: TanStack Query Integration

```typescript
function MySearch() {
  const {
    isLoading,
    isFetching,
    error,
    results,
    setCollections,
    setBbox,
    submit,
    limit,
    setLimit,
  } = useStacSearch();

  const handleSearch = () => {
    setCollections(['landsat-8']);
    setBbox([-180, -90, 180, 90]);
    submit(); // Still must call submit
  };

  if (isLoading) return <div>Loading...</div>;
  if (isFetching && !results) return <div>Fetching...</div>;
  if (error) return <div>Error: {error.statusText}</div>;

  return (
    <div>
      <button onClick={handleSearch} disabled={isLoading}>
        {isFetching ? 'Searching...' : 'Search'}
      </button>
      {results && (
        <div>
          <p>{results.features.length} items found</p>
          <label>
            Limit:
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            />
          </label>
        </div>
      )}
    </div>
  );
}
```

**Key differences:**

- `state` split into `isLoading` and `isFetching`
- `limit` is now part of return object (not just parameter)
- Error handling is more explicit
- No functional changes to `submit()` flow

**Migration checklist:**

- [ ] Update loading state logic
- [ ] Add error boundary
- [ ] Test pagination (if used)
- [ ] Update TypeScript types for new return object

---

### `useCollections()`, `useCollection()`, `useItem()`

These hooks have minimal API changes:

#### Before

```typescript
const { collections, isLoading, error, reload } = useCollections();
```

#### After

```typescript
const { collections, isLoading, isFetching, error, refetch } = useCollections();
```

**Changes:**

- `reload` → `refetch`
- Added `isFetching`
- New ability to pass `refetch` directly to buttons/callbacks

**Migration checklist:**

- [ ] Rename `reload` to `refetch`
- [ ] Use `isFetching` for background update indicators
- [ ] Everything else stays the same

---

### `useStacApi()`

This hook is mostly internal but had a refactor:

**Before:**

```typescript
const { stacApi, isLoading, error, reload } = useStacApi(apiUrl);
```

**After:**

```typescript
const { stacApi, isLoading, isFetching, error, refetch } = useStacApi(apiUrl);
```

Same pattern as other hooks. Usually you don't use this directly—it's used internally by `StacApiProvider`.

---

## Setup Changes

### QueryClient Configuration

You now must configure TanStack Query. The library doesn't do this for you (to avoid forcing opinions).

#### Before

```jsx
import { StacApiProvider } from 'stac-react';

function App() {
  return <StacApiProvider apiUrl="https://my-stac-api.com">{/* Your app */}</StacApiProvider>;
}
```

#### After

```jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StacApiProvider } from 'stac-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (garbage collection time)
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StacApiProvider apiUrl="https://my-stac-api.com" queryClient={queryClient}>
        {/* Your app */}
      </StacApiProvider>
    </QueryClientProvider>
  );
}
```

**New configuration options:**

| Option                 | Default | Description                                      |
| ---------------------- | ------- | ------------------------------------------------ |
| `staleTime`            | 0       | How long data is considered fresh (milliseconds) |
| `gcTime`               | 5 min   | How long unused queries stay in memory           |
| `retry`                | 3       | Number of retries on failure                     |
| `refetchOnWindowFocus` | true    | Refetch when window regains focus                |
| `refetchOnMount`       | true    | Refetch when hook mounts                         |

See [TanStack Query documentation](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults) for all options.

**Migration checklist:**

- [ ] Import `QueryClient` and `QueryClientProvider`
- [ ] Create `QueryClient` instance with desired config
- [ ] Wrap `StacApiProvider` with `QueryClientProvider`
- [ ] Pass `queryClient` to `StacApiProvider`
- [ ] Review caching strategy for your use case
- [ ] See [react-query-setup.md](./react-query-setup.md) for more details

---

## Performance Improvements

With TanStack Query, you get automatic caching and request deduplication. Here's what happens:

### Automatic Caching

```typescript
// First call - makes network request
const { collection: col1 } = useCollection('landsat-8');

// Later, another component
const { collection: col2 } = useCollection('landsat-8');
// ^ Uses cached data! No network request!

// After 5 minutes of no use, data is considered "stale"
// Next call will refetch in background while returning cached data first

// After 10 minutes, data is garbage collected from memory
```

### Request Deduplication

```typescript
// Multiple components request same collection
// Only ONE network request is made, even if 5 components use the hook

<CollectionCard id="landsat-8" />
<CollectionCard id="landsat-8" />
<CollectionCard id="landsat-8" />
// Only 1 fetch! Shared among all three
```

### Invalidation on API Change

```typescript
// If API URL changes, all queries are automatically invalidated
<StacApiProvider apiUrl="https://old-api.com" />
// Switch to new API:
<StacApiProvider apiUrl="https://new-api.com" />
// All cached data is cleared, fresh requests made
```

---

## Testing Updates

Your tests need to be updated for TanStack Query:

### Before

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useCollections } from 'stac-react';

test('loads collections', async () => {
  const { result } = renderHook(() => useCollections());

  await waitFor(() => {
    expect(result.current.collections).toBeDefined();
  });
});
```

### After

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCollections } from 'stac-react';

test('loads collections', async () => {
  // IMPORTANT: Disable caching in tests to avoid pollution
  const testClient = new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 0,      // Don't cache between tests
        staleTime: 0,   // Always consider data stale
        retry: false,   // Don't retry in tests
      },
    },
  });

  const wrapper = ({ children }) => (
    <QueryClientProvider client={testClient}>
      {children}
    </QueryClientProvider>
  );

  const { result } = renderHook(() => useCollections(), { wrapper });

  await waitFor(() => {
    expect(result.current.collections).toBeDefined();
  });
});
```

**Testing best practices:**

1. **Disable caching in tests**: Use `gcTime: 0` to prevent state leaking between tests
2. **Mock fetch**: Use `jest-fetch-mock` or `msw` to intercept requests
3. **Test error scenarios**: Now that error types are structured, test them!
4. **Test refetch**: Verify `refetch()` works and returns data
5. **Avoid testing implementation details**: Don't test `isLoading` state directly

---

---

## TypeScript Updates

If you're using TypeScript, new types are available:

```typescript
import type {
  ApiErrorType, // Error response
  FetchRequest, // Request types for useStacSearch
  SearchRequestPayload, // Search parameters
} from 'stac-react';

// Your hook usage
const { error }: { error?: ApiErrorType } = useCollection('id');

if (error) {
  console.log(error.status); // number
  console.log(error.statusText); // string
  console.log(error.detail); // unknown
}
```

---

## Common Migration Patterns

### Pattern 1: Conditional Rendering

**Before:**

```typescript
{state === 'LOADING' && <Skeleton />}
{state === 'IDLE' && results && <Results items={results.features} />}
{error && <Error message={error.message} />}
```

**After:**

```typescript
{isLoading && <Skeleton />}
{!isLoading && results && <Results items={results.features} />}
{error && <Error message={error.statusText} />}
```

### Pattern 2: Disable UI During Fetch

**Before:**

```typescript
<button onClick={search} disabled={state === 'LOADING'}>
  Search
</button>
```

**After:**

```typescript
<button onClick={search} disabled={isLoading || isFetching}>
  {isFetching ? 'Searching...' : 'Search'}
</button>
```

### Pattern 3: Refetch on Mount

**Before:**

```typescript
useEffect(() => {
  reload();
}, []);
```

**After:**

```typescript
// Automatic! But if you need manual control:
useEffect(() => {
  refetch();
}, [refetch]); // refetch is stable reference
```

---

---

## Troubleshooting

### Q: "No STAC API configured" error

**Cause:** `StacApiProvider` not wrapping your component

**Fix:**

```tsx
// ❌ This won't work
<MyComponent /> // Tries to use useStacApiContext() outside provider

// ✅ This works
<StacApiProvider apiUrl="...">
  <MyComponent />
</StacApiProvider>
```

### Q: Data not updating after API URL changes

**Cause:** Not sharing same QueryClient instance

**Fix:**

```tsx
const queryClient = new QueryClient();

<QueryClientProvider client={queryClient}>
  <StacApiProvider apiUrl="..." queryClient={queryClient}>
    {/* ... */}
  </StacApiProvider>
</QueryClientProvider>;
```

### Q: Cache is too aggressive - old data showing

**Cause:** `staleTime` is too long

**Fix:**

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds instead of 5 minutes
    },
  },
});
```

### Q: Tests are flaky/interdependent

**Cause:** TanStack Query caching between tests

**Fix:** Use test QueryClient with `gcTime: 0`:

```typescript
const testClient = new QueryClient({
  defaultOptions: {
    queries: { gcTime: 0, staleTime: 0, retry: false },
  },
});
```

---

## Need Help?

- **TanStack Query docs**: [TanStack Query Documentation](https://tanstack.com/query/latest)
- **Issue/Discussion**: Open a GitHub issue for migration questions
- **Examples**: Check `/example` directory for working code

---

## Summary Checklist

- [ ] Update dependencies (install `@tanstack/react-query`)
- [ ] Wrap app with `StacApiProvider`
- [ ] Provide queryClient prop if already using React Query
- [ ] Replace `state` with `isLoading`/`isFetching` in all components
- [ ] Rename `reload` to `refetch` in all components
- [ ] Replace context data access with individual hooks
- [ ] Update error handling to use typed `ApiErrorType`
- [ ] Update tests to use test QueryClient
- [ ] Remove context data subscriptions
- [ ] Review caching strategy for your app
- [ ] Test in development and production
