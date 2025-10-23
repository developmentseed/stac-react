# QueryClient Best Practice

stac-react relies on [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/overview) for data fetching and caching. To avoid duplicate React Query clients and potential version conflicts, stac-react lists `@tanstack/react-query` as a **peer dependency**.

## Why peer dependency?

- Prevents multiple versions of React Query in your app.
- Ensures your app and stac-react share the same QueryClient instance.
- Follows best practices for React libraries that integrate with popular frameworks.

stac-react manages the QueryClient for you by default, but you can provide your own for advanced use cases.

**Important:** If your app uses multiple providers that require a TanStack QueryClient (such as `QueryClientProvider` and `StacApiProvider`), always use the same single QueryClient instance for all providers. This ensures that queries, mutations, and cache are shared across your app and prevents cache fragmentation or duplicate network requests.

**Example:**

```jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StacApiProvider } from 'stac-react';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StacApiProvider apiUrl="https://my-stac-api.com" queryClient={queryClient}>
        {/* ...your app... */}
      </StacApiProvider>
    </QueryClientProvider>
  );
}
```

If you do not pass the same QueryClient instance, each provider will maintain its own cache, which can lead to unexpected behavior.
