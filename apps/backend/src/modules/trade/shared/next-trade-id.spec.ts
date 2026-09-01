import { nextTradeIdFromIds } from './next-trade-id';

describe('nextTradeIdFromIds', () => {
  it('starts at TRD-100001 when no trades exist', () => {
    expect(nextTradeIdFromIds([])).toBe('TRD-100001');
  });

  it('increments from the highest numeric id', () => {
    expect(nextTradeIdFromIds(['TRD-100001', 'TRD-100050', 'TRD-100009'])).toBe(
      'TRD-100051',
    );
  });
});
