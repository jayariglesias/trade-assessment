import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { TrimUpper } from '../../../../common/decorators/transform.decorators';

export class CreateTradeDto {
  @ApiProperty({ type: String, minLength: 1, maxLength: 10 })
  @TrimUpper()
  @IsString({ message: 'Symbol is required.' })
  @MinLength(1, { message: 'Symbol is required.' })
  @MaxLength(10, { message: 'Symbol must be at most 10 characters.' })
  symbol!: string;

  @ApiProperty({ type: Number, minimum: 1 })
  @IsInt({ message: 'Quantity must be a whole number.' })
  @Min(1, { message: 'Quantity must be at least 1.' })
  quantity!: number;

  @ApiProperty({ type: Number, minimum: 0.01 })
  @IsNumber({}, { message: 'Price must be a number.' })
  @Min(0.01, { message: 'Price must be at least 0.01.' })
  price!: number;

  @ApiProperty({ enum: ['BUY', 'SELL'] })
  @IsIn(['BUY', 'SELL'], { message: 'Side must be BUY or SELL.' })
  side!: 'BUY' | 'SELL';

  @ApiProperty({ type: String, minLength: 1, maxLength: 20 })
  @TrimUpper()
  @IsString({ message: 'Trader is required.' })
  @MinLength(1, { message: 'Trader is required.' })
  @MaxLength(20, { message: 'Trader must be at most 20 characters.' })
  trader!: string;

  @ApiPropertyOptional({ type: String, format: 'date' })
  @IsOptional()
  @IsDateString({}, { message: 'Trade date must be a valid date.' })
  tradeDate?: string;

  @ApiProperty({ type: String, minLength: 1, maxLength: 40 })
  @IsString({ message: 'Book is required.' })
  @MinLength(1, { message: 'Book is required.' })
  @MaxLength(40, { message: 'Book must be at most 40 characters.' })
  book!: string;

  @ApiProperty({ type: String, minLength: 1, maxLength: 60 })
  @IsString({ message: 'Counterparty is required.' })
  @MinLength(1, { message: 'Counterparty is required.' })
  @MaxLength(60, { message: 'Counterparty must be at most 60 characters.' })
  counterparty!: string;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString({}, { message: 'Trade timestamp must be a valid date-time.' })
  tradeTimestamp?: string;
}
