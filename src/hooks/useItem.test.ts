import fetch from 'jest-fetch-mock';
import { renderHook, act } from '@testing-library/react-hooks';
import useItem from './useItem';
import wrapper from './wrapper';

describe('useItem', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  it('queries item', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ id: 'abc', links: [] }))
      .mockResponseOnce(JSON.stringify({ id: 'abc' }));

    const { result, waitForNextUpdate } = renderHook(
      () => useItem('https://fake-stac-api.net/items/abc'),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.item).toEqual({ id: 'abc' });
    expect(result.current.state).toEqual('IDLE');
  });

  it('handles error with JSON response', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ id: 'abc', links: [] }))
      .mockResponseOnce(JSON.stringify({ error: 'Wrong query' }), {
        status: 400,
        statusText: 'Bad Request'
      });

    const { result, waitForNextUpdate } = renderHook(
      () => useItem('https://fake-stac-api.net/items/abc'),
      { wrapper }
    );
    await waitForNextUpdate();

    expect(result.current.error).toEqual({
      status: 400,
      statusText: 'Bad Request',
      detail: { error: 'Wrong query' }
    });
  });

  it('handles error with non-JSON response', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ id: 'abc', links: [] }))
      .mockResponseOnce('Wrong query', {
        status: 400,
        statusText: 'Bad Request'
      });

    const { result, waitForNextUpdate } = renderHook(
      () => useItem('https://fake-stac-api.net/items/abc'),
      { wrapper }
    );
    await waitForNextUpdate();

    expect(result.current.error).toEqual({
      status: 400,
      statusText: 'Bad Request',
      detail: 'Wrong query'
    });
  });

  it('reloads item', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ id: 'abc', links: [] }))
      .mockResponseOnce(JSON.stringify({ id: 'abc' }))
      .mockResponseOnce(JSON.stringify({ id: 'abc', description: 'Updated' }));

    const { result, waitForNextUpdate } = renderHook(
      () => useItem('https://fake-stac-api.net/items/abc'),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.item).toEqual({ id: 'abc' });

    act(() => result.current.reload());

    await waitForNextUpdate();
    expect(result.current.item).toEqual({ id: 'abc', description: 'Updated' });
  });
});
