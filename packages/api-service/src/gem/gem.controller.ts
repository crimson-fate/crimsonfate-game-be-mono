import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { iInfoToken, JWT, User } from '@app/shared/jwt';
import { BaseResult } from '@app/shared/utils/types';
import { GemService } from './gem.service';
import { GameIdDto } from '../dungeon/dto/gameId.dto';
import { TransactionDto } from './dto/transaction.dto';
import { ClaimDungeonGemDto } from './dto/claimDungeonGem.dto';

@Controller('gem')
@ApiTags('Gem')
export class GemController {
  constructor(private readonly gemService: GemService) {}

  @JWT()
  @Get('claim-initial-gem')
  @ApiOperation({ summary: 'Get claim initial gem params' })
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
  @Post('claim-initial-gem-success')
  @ApiOperation({ summary: 'Claim initial gem success' })
  @ApiResponse({
    status: 200,
    description: 'Update status of claim initial gem',
  })
  async claimInitialGemSuccess(
    @Body() query: TransactionDto,
    @User() user: iInfoToken,
  ): Promise<BaseResult<boolean>> {
    const result = await this.gemService.claimInitialGemSuccess(
      query,
      user.address,
    );
    return new BaseResult(result);
  }

  @JWT()
  @Get('claim-dungeon-gem')
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

  @JWT()
  @Post('claim-dungeon-gem-success')
  @ApiOperation({ summary: 'Claim dungeon gem success' })
  @ApiResponse({
    status: 200,
    description: 'Update status of claim dungeon gem',
  })
  async claimDungeonGemSuccess(
    @Body() query: ClaimDungeonGemDto,
    @User() user: iInfoToken,
  ): Promise<BaseResult<boolean>> {
    const result = await this.gemService.claimDungeonGemSuccess(
      query,
      user.address,
    );
    return new BaseResult(result);
  }
}
