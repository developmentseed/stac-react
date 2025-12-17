import { StacApiProvider } from 'stac-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from './layout/Header';
import Main from './pages/Main';

// Create a QueryClient with custom cache configuration
// IMPORTANT: Must be created outside the component to maintain cache across renders
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // STAC data doesn't change frequently, so we can cache it for 5 minutes
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      // Disable automatic refetching since STAC data is static
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  },
});

function App() {
  const apiUrl = process.env.REACT_APP_STAC_API;
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Debug: Verify QueryClient configuration
  if (isDevelopment && typeof window !== 'undefined') {
    // eslint-disable-next-line no-console
    console.log('[App] QueryClient defaults:', queryClient.getDefaultOptions());
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StacApiProvider apiUrl={apiUrl} enableDevTools={isDevelopment} queryClient={queryClient}>
        <div className="App grid grid-rows-[min-content_1fr]">
          <Header />
          <main className="flex items-stretch">
            <Main />
          </main>
        </div>
      </StacApiProvider>
    </QueryClientProvider>
  );
}

export default App;
