import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBodyDto,
  ApiOk,
  ApiParamDto,
  ApiTags,
} from '../../common/decorators/api.decorators';
import { TradeIdDto } from '../../common/dto/trade-id.dto';
import { CancelTradeUseCase } from './use-cases/cancel-trade/cancel-trade.use-case';
import { CreateTradeDto } from './use-cases/create-trade/create-trade.dto';
import { CreateTradeUseCase } from './use-cases/create-trade/create-trade.use-case';
import { GetTradeUseCase } from './use-cases/get-trade/get-trade.use-case';
import { TradeDto } from './use-cases/list-trades/list-trades.dto';
import { ListTradesUseCase } from './use-cases/list-trades/list-trades.use-case';
import { UpdateTradeDto } from './use-cases/update-trade/update-trade.dto';
import { UpdateTradeUseCase } from './use-cases/update-trade/update-trade.use-case';

@ApiTags('trades')
@Controller('trades')
export class TradeController {
  constructor(
    private readonly listTradesUseCase: ListTradesUseCase,
    private readonly getTradeUseCase: GetTradeUseCase,
    private readonly createTradeUseCase: CreateTradeUseCase,
    private readonly updateTradeUseCase: UpdateTradeUseCase,
    private readonly cancelTradeUseCase: CancelTradeUseCase,
  ) {}

  @Get()
  @ApiOk([TradeDto], 'List all trades')
  list() {
    return this.listTradesUseCase.execute();
  }

  @Get(':id')
  @ApiOk(TradeDto, 'Get a trade by ID')
  get(@ApiParamDto(TradeIdDto) params: TradeIdDto) {
    return this.getTradeUseCase.execute(params);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOk(TradeDto, 'Create a trade', { status: 201 })
  create(@ApiBodyDto(CreateTradeDto) body: CreateTradeDto) {
    return this.createTradeUseCase.execute(body);
  }

  @Put(':id')
  @ApiOk(TradeDto, 'Update a trade')
  update(
    @ApiParamDto(TradeIdDto) params: TradeIdDto,
    @ApiBodyDto(UpdateTradeDto) body: UpdateTradeDto,
  ) {
    return this.updateTradeUseCase.execute({ id: params.id, ...body });
  }

  @Patch(':id/cancel')
  @ApiOk(TradeDto, 'Cancel a trade')
  cancel(@ApiParamDto(TradeIdDto) params: TradeIdDto) {
    return this.cancelTradeUseCase.execute(params);
  }
}
