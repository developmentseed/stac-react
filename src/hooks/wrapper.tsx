import React from 'react';
import { StacApiProvider } from '../context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

type WrapperType = {
  children: React.ReactNode;
};

const Wrapper = ({ children }: WrapperType) => {
  const testQueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // gcTime (previously cacheTime in v4) controls how long unused/inactive queries
        // remain in memory. Set to 0 in tests to prevent caching between test runs.
        gcTime: 0,
        staleTime: 0,
        retry: false,
      },
    },
  });
  return (
    <QueryClientProvider client={testQueryClient}>
      <StacApiProvider apiUrl="https://fake-stac-api.net">{children}</StacApiProvider>
    </QueryClientProvider>
  );
};
export default Wrapper;
