import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsNumber,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class TradeDto {
  @ApiProperty({ type: String })
  id!: string;

  @ApiProperty({ type: String, minLength: 1, maxLength: 10 })
  symbol!: string;

  @ApiProperty({ type: Number, minimum: 1 })
  quantity!: number;

  @ApiProperty({ type: Number, minimum: 0.01 })
  price!: number;

  @ApiProperty({ enum: ['BUY', 'SELL'] })
  side!: 'BUY' | 'SELL';

  @ApiProperty({ type: String, minLength: 1, maxLength: 20 })
  trader!: string;

  @ApiProperty({ type: String, format: 'date' })
  tradeDate!: string;

  @ApiProperty({ enum: ['ACTIVE', 'CANCELLED'] })
  status!: 'ACTIVE' | 'CANCELLED';

  @ApiProperty({ type: String, minLength: 1, maxLength: 40 })
  book!: string;

  @ApiProperty({ type: String, minLength: 1, maxLength: 60 })
  counterparty!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  tradeTimestamp!: string;
}
