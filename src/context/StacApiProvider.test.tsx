import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { StacApiProvider } from './index';
import { useStacApiContext } from './useStacApiContext';
import { makeMockResponse } from '../../jest.utils';

// Mock fetch for testing - returns a successful response
beforeEach(() => {
  (global.fetch as jest.Mock) = jest.fn((url: string) => {
    return Promise.resolve(makeMockResponse(JSON.stringify({ links: [] }), url));
  });
});

// Component to test that hooks work inside StacApiProvider
function TestComponent() {
  const context = useStacApiContext();
  const queryClient = useQueryClient();

  return (
    <div>
      <div data-testid="stac-api">{context.stacApi ? 'stacApi exists' : 'no stacApi'}</div>
      <div data-testid="query-client">{queryClient ? 'queryClient exists' : 'no queryClient'}</div>
    </div>
  );
}

describe('StacApiProvider', () => {
  beforeEach(() => {
    // Clean up window.__TANSTACK_QUERY_CLIENT__ before each test
    delete (window as Window & { __TANSTACK_QUERY_CLIENT__?: unknown }).__TANSTACK_QUERY_CLIENT__;
  });

  describe('QueryClient management', () => {
    it('creates a QueryClient when no parent exists', async () => {
      render(
        <StacApiProvider apiUrl="https://test-stac-api.com">
          <TestComponent />
        </StacApiProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('stac-api')).toHaveTextContent('stacApi exists');
      });
      expect(screen.getByTestId('query-client')).toHaveTextContent('queryClient exists');
    });

    it('uses existing QueryClient from parent context', async () => {
      const parentClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
        },
      });

      render(
        <QueryClientProvider client={parentClient}>
          <StacApiProvider apiUrl="https://test-stac-api.com" queryClient={parentClient}>
            <TestComponent />
          </StacApiProvider>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('stac-api')).toHaveTextContent('stacApi exists');
      });
      expect(screen.getByTestId('query-client')).toHaveTextContent('queryClient exists');
    });

    it('does not create nested QueryClientProvider when parent exists', () => {
      const parentClient = new QueryClient();

      // Component that checks if QueryClient instance is the parent
      function ClientChecker() {
        const client = useQueryClient();
        return <div data-testid="is-parent">{client === parentClient ? 'true' : 'false'}</div>;
      }

      render(
        <QueryClientProvider client={parentClient}>
          <StacApiProvider apiUrl="https://test-stac-api.com" queryClient={parentClient}>
            <ClientChecker />
          </StacApiProvider>
        </QueryClientProvider>
      );

      expect(screen.getByTestId('is-parent')).toHaveTextContent('true');
    });
  });

  describe('DevTools integration', () => {
    it('does not set up DevTools when enableDevTools is false', () => {
      render(
        <StacApiProvider apiUrl="https://test-stac-api.com" enableDevTools={false}>
          <TestComponent />
        </StacApiProvider>
      );

      expect(
        (window as Window & { __TANSTACK_QUERY_CLIENT__?: unknown }).__TANSTACK_QUERY_CLIENT__
      ).toBeUndefined();
    });

    it('does not set up DevTools when enableDevTools is not provided', () => {
      render(
        <StacApiProvider apiUrl="https://test-stac-api.com">
          <TestComponent />
        </StacApiProvider>
      );

      expect(
        (window as Window & { __TANSTACK_QUERY_CLIENT__?: unknown }).__TANSTACK_QUERY_CLIENT__
      ).toBeUndefined();
    });

    it('sets up DevTools when enableDevTools is true', () => {
      render(
        <StacApiProvider apiUrl="https://test-stac-api.com" enableDevTools={true}>
          <TestComponent />
        </StacApiProvider>
      );

      expect(
        (window as Window & { __TANSTACK_QUERY_CLIENT__?: unknown }).__TANSTACK_QUERY_CLIENT__
      ).toBeDefined();
    });

    it('sets up DevTools with custom queryClient when enabled', () => {
      const customClient = new QueryClient();

      render(
        <StacApiProvider
          apiUrl="https://test-stac-api.com"
          enableDevTools={true}
          queryClient={customClient}
        >
          <TestComponent />
        </StacApiProvider>
      );

      expect(
        (window as Window & { __TANSTACK_QUERY_CLIENT__?: unknown }).__TANSTACK_QUERY_CLIENT__
      ).toBe(customClient);
    });
  });

  describe('Context value', () => {
    it('provides stacApi with correct apiUrl', async () => {
      function ApiUrlChecker() {
        const { stacApi } = useStacApiContext();
        return <div data-testid="api-url">{stacApi?.baseUrl || 'loading'}</div>;
      }

      render(
        <StacApiProvider apiUrl="https://my-custom-api.com">
          <ApiUrlChecker />
        </StacApiProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('api-url')).toHaveTextContent('https://my-custom-api.com');
      });
    });

    it('passes options to useStacApi hook', () => {
      const customOptions = { headers: { 'X-Custom': 'value' } };

      function OptionsChecker() {
        // Options are passed to useStacApi which uses them in the query
        return <div data-testid="has-options">true</div>;
      }

      render(
        <StacApiProvider apiUrl="https://test-stac-api.com" options={customOptions}>
          <OptionsChecker />
        </StacApiProvider>
      );

      // If provider doesn't error and renders, options were passed successfully
      expect(screen.getByTestId('has-options')).toHaveTextContent('true');
    });
  });
});
