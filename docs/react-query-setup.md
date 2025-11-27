# QueryClient Best Practice

stac-react relies on [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/overview) for data fetching and caching. To avoid duplicate React Query clients and potential version conflicts, stac-react lists `@tanstack/react-query` as a **peer dependency**.

## Why peer dependency?

- Prevents multiple versions of React Query in your app.
- Ensures your app and stac-react share the same QueryClient instance.
- Follows best practices for React libraries that integrate with popular frameworks.

## QueryClient Management

By default, `StacApiProvider` automatically creates and manages a QueryClient for you if one doesn't already exist in the component tree. This means you can use stac-react without any additional setup:

```jsx
import { StacApiProvider } from 'stac-react';

function App() {
  return <StacApiProvider apiUrl="https://my-stac-api.com">{/* ...your app... */}</StacApiProvider>;
}
```

### Custom QueryClient Configuration

If you need custom QueryClient configuration (e.g., custom caching behavior, retry logic, or global settings), wrap `StacApiProvider` with your own `QueryClientProvider`:

```jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StacApiProvider } from 'stac-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StacApiProvider apiUrl="https://my-stac-api.com">{/* ...your app... */}</StacApiProvider>
    </QueryClientProvider>
  );
}
```

`StacApiProvider` will automatically detect the parent QueryClient and use it instead of creating a new one.

## TanStack Query DevTools Integration

stac-react automatically connects your QueryClient to the [TanStack Query DevTools browser extension](https://tanstack.com/query/latest/docs/framework/react/devtools) when running in development mode. This allows you to inspect queries, mutations, and cache directly in your browser without adding extra dependencies to your project.

**How it works:**

- In development (`process.env.NODE_ENV === 'development'`), stac-react exposes the QueryClient on `window.__TANSTACK_QUERY_CLIENT__`.
- The browser extension detects this and connects automatically.
- No code changes or additional dependencies are required.

> By default, React Query Devtools are only included in bundles when process.env.NODE_ENV === 'development', so you don't need to worry about excluding them during a production build.

**Alternative:**

- If you prefer an embedded/floating devtools panel, you can install and use the [TanStack Query Devtools React component](https://tanstack.com/query/latest/docs/framework/react/devtools#floating-devtools) in your app. This adds a UI panel directly to your app, but increases bundle size and dependencies.

For more details, see the [TanStack Query DevTools documentation](https://tanstack.com/query/latest/docs/framework/react/devtools).
