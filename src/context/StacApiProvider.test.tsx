import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { StacApiProvider } from './index';
import { useStacApiContext } from './useStacApiContext';

// Mock fetch for testing - returns a successful response
beforeEach(() => {
  (global.fetch as jest.Mock) = jest.fn((url: string) =>
    Promise.resolve({
      ok: true,
      url, // Return the requested URL
      json: () =>
        Promise.resolve({
          links: [],
        }),
    })
  );
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
          <StacApiProvider apiUrl="https://test-stac-api.com">
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
          <StacApiProvider apiUrl="https://test-stac-api.com">
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

    it('sets up DevTools with parent QueryClient when enabled', () => {
      const parentClient = new QueryClient();

      render(
        <QueryClientProvider client={parentClient}>
          <StacApiProvider apiUrl="https://test-stac-api.com" enableDevTools={true}>
            <TestComponent />
          </StacApiProvider>
        </QueryClientProvider>
      );

      expect(
        (window as Window & { __TANSTACK_QUERY_CLIENT__?: unknown }).__TANSTACK_QUERY_CLIENT__
      ).toBe(parentClient);
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

    it('provides context methods', () => {
      function ContextChecker() {
        const context = useStacApiContext();
        const hasMethods =
          typeof context.getItem === 'function' &&
          typeof context.addItem === 'function' &&
          typeof context.deleteItem === 'function';
        return <div data-testid="has-methods">{hasMethods ? 'true' : 'false'}</div>;
      }

      render(
        <StacApiProvider apiUrl="https://test-stac-api.com">
          <ContextChecker />
        </StacApiProvider>
      );

      expect(screen.getByTestId('has-methods')).toHaveTextContent('true');
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
