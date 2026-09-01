import { Injectable } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { TradeDto } from '@shared/api-contracts';
import type { Server } from 'socket.io';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH'],
  },
})
export class TradesGateway {
  @WebSocketServer()
  server!: Server;

  emitTradeCreated(trade: TradeDto) {
    this.server.emit('trade_created', trade);
  }

  emitTradeUpdated(trade: TradeDto) {
    this.server.emit('trade_updated', trade);
  }
}
