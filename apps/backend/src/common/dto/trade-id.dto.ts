import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';

export class TradeIdDto {
  @ApiProperty({ type: String, minLength: 1, pattern: '^TRD-\\d+$' })
  @IsString({ message: 'Enter a valid trade ID.' })
  @MinLength(1, { message: 'Enter a valid trade ID.' })
  @Matches(/^TRD-\d+$/, { message: 'Enter a valid trade ID.' })
  id!: string;
}
