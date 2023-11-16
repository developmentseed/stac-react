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
});
