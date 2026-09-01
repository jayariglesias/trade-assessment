import type { components } from './generated/schema.js';

type Schemas = components['schemas'];

export type TradeDto = Schemas['TradeDto'];
export type CreateTradeDto = Schemas['CreateTradeDto'];
export type UpdateTradeDto = Schemas['UpdateTradeDto'];

export type TradeSide = TradeDto['side'];
export type TradeStatus = TradeDto['status'];

export type { components, paths } from './generated/schema.js';
