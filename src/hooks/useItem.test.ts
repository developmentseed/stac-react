import fetch from 'jest-fetch-mock';
import { renderHook } from '@testing-library/react-hooks';
import useItem from './useItem';
import wrapper from './wrapper';

describe('useItem', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  it('queries item', async () => {
    fetch
      .mockResponseOnce(JSON.stringify({ id: 'abc' }))
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
});
