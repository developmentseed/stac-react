import fetch from 'jest-fetch-mock';
import { renderHook } from '@testing-library/react-hooks';
import useCollection from './useCollection';
import wrapper from './wrapper';

describe('useCollection' ,() => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  it('queries collection', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [] }), { url: 'https://fake-stac-api.net' })
      .mockResponseOnce(JSON.stringify({
        collections: [
          {id: 'abc', title: 'Collection A'},
          {id: 'def', title: 'Collection B'}
        ]
      }));

    const { result, waitForNextUpdate } = renderHook(
      () => useCollection('abc'),
      { wrapper }
    );
    await waitForNextUpdate();
    await waitForNextUpdate();
    expect(result.current.collection).toEqual({id: 'abc', title: 'Collection A'});
    expect(result.current.state).toEqual('IDLE');
  });

  it('returns error if collection does not exist', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [] }), { url: 'https://fake-stac-api.net' })
      .mockResponseOnce(JSON.stringify({
        collections: [
          {id: 'abc', title: 'Collection A'},
          {id: 'def', title: 'Collection B'}
        ]
      }));

    const { result, waitForNextUpdate } = renderHook(
      () => useCollection('ghi'),
      { wrapper }
    );
    await waitForNextUpdate();
    await waitForNextUpdate();
    expect(result.current.error).toEqual({
      status: 404,
      statusText: 'Not found',
      detail: 'Collection does not exist'
    });
  });

  it('handles error with JSON response', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [] }), { url: 'https://fake-stac-api.net' })
      .mockResponseOnce(JSON.stringify({ error: 'Wrong query' }), { status: 400, statusText: 'Bad Request' });

    const { result, waitForNextUpdate } = renderHook(
      () => useCollection('abc'),
      { wrapper }
    );
    await waitForNextUpdate();
    await waitForNextUpdate();

    expect(result.current.error).toEqual({
      status: 400,
      statusText: 'Bad Request',
      detail: { error: 'Wrong query' }
    });
  });

  it('handles error with non-JSON response', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [] }), { url: 'https://fake-stac-api.net' })
      .mockResponseOnce('Wrong query', { status: 400, statusText: 'Bad Request' });

    const { result, waitForNextUpdate } = renderHook(
      () => useCollection('abc'),
      { wrapper }
    );
    await waitForNextUpdate();
    await waitForNextUpdate();

    expect(result.current.error).toEqual({
      status: 400,
      statusText: 'Bad Request',
      detail: 'Wrong query'
    });
  });
});
