import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateTradeDto } from './create-trade.dto';

describe('CreateTradeDto', () => {
  it('accepts a valid payload', async () => {
    const dto = plainToInstance(CreateTradeDto, {
      symbol: 'aapl',
      quantity: 100,
      price: 10.5,
      side: 'BUY',
      trader: 'jsmith',
      book: 'EQUITIES_UK',
      counterparty: 'Goldman Sachs',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.symbol).toBe('AAPL');
    expect(dto.trader).toBe('JSMITH');
  });

  it('rejects missing trader', async () => {
    const dto = plainToInstance(CreateTradeDto, {
      symbol: 'AAPL',
      quantity: 100,
      price: 10.5,
      side: 'BUY',
      book: 'EQUITIES_UK',
      counterparty: 'Goldman Sachs',
    });

    const errors = await validate(dto);
    expect(errors.some((error) => error.property === 'trader')).toBe(true);
  });

  it('rejects non-positive quantity', async () => {
    const dto = plainToInstance(CreateTradeDto, {
      symbol: 'AAPL',
      quantity: 0,
      price: 10.5,
      side: 'BUY',
      trader: 'JSMITH',
      book: 'EQUITIES_UK',
      counterparty: 'Goldman Sachs',
    });

    const errors = await validate(dto);
    expect(errors.some((error) => error.property === 'quantity')).toBe(true);
  });

  it('rejects non-positive price', async () => {
    const dto = plainToInstance(CreateTradeDto, {
      symbol: 'AAPL',
      quantity: 100,
      price: 0,
      side: 'BUY',
      trader: 'JSMITH',
      book: 'EQUITIES_UK',
      counterparty: 'Goldman Sachs',
    });

    const errors = await validate(dto);
    expect(errors.some((error) => error.property === 'price')).toBe(true);
  });
});
