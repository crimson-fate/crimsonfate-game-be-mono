import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { iInfoToken, JWT, User } from '@app/shared/jwt';
import { BaseResult } from '@app/shared/utils/types';
import { GemService } from './gem.service';
import { GameIdDto } from '../dungeon/dto/gameId.dto';

@Controller('gem')
@ApiTags('Gem')
export class GemController {
  constructor(private readonly gemService: GemService) {}

  @JWT()
  @Get('claim-initial-gem')
  @ApiOperation({ summary: 'Claim initial gem' })
  @ApiResponse({
    status: 200,
    description: 'Return keys to claim gem',
  })
  async claimInitialGem(
    @User() user: iInfoToken,
  ): Promise<
    BaseResult<{ amount: number; saltNonce: number; keys: string[] }>
  > {
    const result = await this.gemService.claimInitialGem(user.address);
    return new BaseResult({ amount: 50, ...result });
  }

  @JWT()
  @Post('claim-dungeon-gem')
  @ApiOperation({ summary: 'Claim dungeon gem' })
  @ApiResponse({
    status: 200,
    description: 'Return keys to claim gem',
  })
  async claimDungeonGem(
    @Body() query: GameIdDto,
    @User() user: iInfoToken,
  ): Promise<
    BaseResult<{ amount: number; saltNonce: number; keys: string[] }>
  > {
    const result = await this.gemService.claimDungeonGem(query, user.address);
    return new BaseResult(result);
  }
}
