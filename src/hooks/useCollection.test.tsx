import fetch from 'jest-fetch-mock';
import { renderHook, act } from '@testing-library/react-hooks';
import useCollection from './useCollection';
import wrapper from './wrapper';

describe('useCollection', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  it('queries collection', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [] }), {
        url: 'https://fake-stac-api.net'
      })
      .mockResponseOnce(
        JSON.stringify({
          id: 'abc',
          title: 'Collection A'
        })
      );

    const { result, waitForNextUpdate } = renderHook(
      () => useCollection('abc'),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.collection).toEqual({
      id: 'abc',
      title: 'Collection A'
    });
    expect(result.current.state).toEqual('IDLE');
  });

  it('returns error if collection does not exist', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [] }), {
        url: 'https://fake-stac-api.net'
      })
      .mockResponseOnce(
        JSON.stringify({
          code: 'NotFoundError',
          description: 'Collection asdasd does not exist.'
        }),
        {
          status: 404,
          statusText: 'Not found'
        }
      );

    const { result, waitForNextUpdate } = renderHook(
      () => useCollection('ghi'),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.error).toEqual({
      status: 404,
      statusText: 'Not found',
      detail: {
        code: 'NotFoundError',
        description: 'Collection asdasd does not exist.'
      }
    });
  });

  it('handles error with JSON response', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [] }), {
        url: 'https://fake-stac-api.net'
      })
      .mockResponseOnce(JSON.stringify({ error: 'Wrong query' }), {
        status: 400,
        statusText: 'Bad Request'
      });

    const { result, waitForNextUpdate } = renderHook(
      () => useCollection('abc'),
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
      .mockResponseOnce(JSON.stringify({ links: [] }), {
        url: 'https://fake-stac-api.net'
      })
      .mockResponseOnce('Wrong query', {
        status: 400,
        statusText: 'Bad Request'
      });

    const { result, waitForNextUpdate } = renderHook(
      () => useCollection('abc'),
      { wrapper }
    );
    await waitForNextUpdate();

    expect(result.current.error).toEqual({
      status: 400,
      statusText: 'Bad Request',
      detail: 'Wrong query'
    });
  });

  it('reloads collection', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ links: [] }), {
        url: 'https://fake-stac-api.net'
      })
      .mockResponseOnce(
        JSON.stringify({
          id: 'abc',
          title: 'Collection A'
        })
      )
      .mockResponseOnce(
        JSON.stringify({ id: 'abc', title: 'Collection A - Updated' })
      );

    const { result, waitForNextUpdate } = renderHook(
      () => useCollection('abc'),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.collection).toEqual({
      id: 'abc',
      title: 'Collection A'
    });

    act(() => result.current.reload());

    await waitForNextUpdate();
    expect(result.current.collection).toEqual({
      id: 'abc',
      title: 'Collection A - Updated'
    });
  });
});
