import { ApiPropertyOptional } from '@nestjs/swagger';
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

export class UpdateTradeDto {
  @ApiPropertyOptional({ type: String, minLength: 1, maxLength: 10 })
  @IsOptional()
  @TrimUpper()
  @IsString({ message: 'Symbol must be text.' })
  @MinLength(1, { message: 'Symbol is required.' })
  @MaxLength(10, { message: 'Symbol must be at most 10 characters.' })
  symbol?: string;

  @ApiPropertyOptional({ type: Number, minimum: 1 })
  @IsOptional()
  @IsInt({ message: 'Quantity must be a whole number.' })
  @Min(1, { message: 'Quantity must be at least 1.' })
  quantity?: number;

  @ApiPropertyOptional({ type: Number, minimum: 0.01 })
  @IsOptional()
  @IsNumber({}, { message: 'Price must be a number.' })
  @Min(0.01, { message: 'Price must be at least 0.01.' })
  price?: number;

  @ApiPropertyOptional({ enum: ['BUY', 'SELL'] })
  @IsOptional()
  @IsIn(['BUY', 'SELL'], { message: 'Side must be BUY or SELL.' })
  side?: 'BUY' | 'SELL';

  @ApiPropertyOptional({ type: String, minLength: 1, maxLength: 20 })
  @IsOptional()
  @TrimUpper()
  @IsString({ message: 'Trader must be text.' })
  @MinLength(1, { message: 'Trader is required.' })
  @MaxLength(20, { message: 'Trader must be at most 20 characters.' })
  trader?: string;

  @ApiPropertyOptional({ type: String, format: 'date' })
  @IsOptional()
  @IsDateString({}, { message: 'Trade date must be a valid date.' })
  tradeDate?: string;

  @ApiPropertyOptional({ type: String, minLength: 1, maxLength: 40 })
  @IsOptional()
  @IsString({ message: 'Book must be text.' })
  @MinLength(1, { message: 'Book is required.' })
  @MaxLength(40, { message: 'Book must be at most 40 characters.' })
  book?: string;

  @ApiPropertyOptional({ type: String, minLength: 1, maxLength: 60 })
  @IsOptional()
  @IsString({ message: 'Counterparty must be text.' })
  @MinLength(1, { message: 'Counterparty is required.' })
  @MaxLength(60, { message: 'Counterparty must be at most 60 characters.' })
  counterparty?: string;
}
