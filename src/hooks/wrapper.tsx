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
