import createClient from 'openapi-fetch';
import type { paths } from './generated/schema.js';

export type {
  CreateTradeDto,
  TradeDto,
  TradeSide,
  TradeStatus,
  UpdateTradeDto,
  components,
  paths,
} from './types.js';

export function createApiClient(baseUrl: string) {
  return createClient<paths>({ baseUrl });
}
