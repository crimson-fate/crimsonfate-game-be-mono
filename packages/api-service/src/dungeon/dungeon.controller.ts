import { Controller, Get, Post, Body, Query, UsePipes } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { DungeonService } from './dungeon.service';
import { walletAddressDto } from './dto/WalletAddress.dto';
import { CompleteWaveDto } from './dto/CompleteWave.dto';
import { GetCurrentRankDto, SeasonIdDto } from './dto/SeasonId.dto';
import { BaseResult } from '@app/shared/utils/types';
import { iInfoToken, JWT, User } from '@app/shared/jwt';
import { GameIdDto } from './dto/gameId.dto';

@Controller('dungeon')
@ApiTags('Dungeon')
export class DungeonController {
  constructor(private readonly dungeonService: DungeonService) {}

  @Get('current-season')
  @ApiOperation({ summary: 'Get current season' })
  @ApiResponse({
    status: 200,
    description: 'Current season fetched successfully',
  })
  async getCurrentSeason() {
    const result = await this.dungeonService.getCurrentSeason();
    return new BaseResult(result);
  }

  @Post('start-new-game')
  @ApiOperation({ summary: 'Start new game' })
  @ApiResponse({ status: 200, description: 'New game started successfully' })
  async startNewGame(@Body() dto: walletAddressDto) {
    const result = await this.dungeonService.startNewGame(dto);
    return new BaseResult(result);
  }

  @Get('current-game')
  @ApiOperation({ summary: 'Get current game' })
  @ApiResponse({
    status: 200,
    description: 'Current game fetched successfully',
  })
  async getCurrentGame(@Query() query: walletAddressDto) {
    const result = await this.dungeonService.getCurrentGame(query);
    return new BaseResult(result);
  }

  @Post('complete-wave')
  @ApiOperation({ summary: 'Complete wave' })
  @ApiResponse({ status: 200, description: 'Wave completed successfully' })
  async completeWave(@Body() dto: CompleteWaveDto) {
    const result = await this.dungeonService.completeWave(dto);
    return new BaseResult(result);
  }

  @Post('end-wave')
  @ApiOperation({ summary: 'End wave' })
  @ApiResponse({ status: 200, description: 'Wave ended successfully' })
  async endWave(@Body() dto: CompleteWaveDto) {
    const result = await this.dungeonService.endWave(dto);
    return new BaseResult(result);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get leaderboard' })
  @ApiResponse({ status: 200, description: 'Leaderboard fetched successfully' })
  async getLeaderboard(@Query() query: SeasonIdDto) {
    const result = await this.dungeonService.getLeaderboard(query);
    return new BaseResult(result);
  }

  @Get('current-rank') // New endpoint
  @ApiOperation({
    summary: 'Get current rank of a player by wallet address for a season',
  })
  @ApiQuery({
    name: 'seasonId',
    required: true,
    type: String,
    description: 'The ID of the season',
  })
  @ApiQuery({
    name: 'walletAddress',
    required: true,
    type: String,
    description: 'The wallet address of the player',
  })
  @ApiResponse({
    status: 200,
    description: 'Player rank fetched successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Season or Player not found, or Player not ranked.',
  })
  async getCurrentRankByWalletAddress(@Query() query: GetCurrentRankDto) {
    return this.dungeonService.getCurrentRankByWalletAddress(query);
  }

  @JWT()
  @Post('drop-gem')
  @ApiOperation({ summary: 'Drop gem during play dungeon' })
  @ApiResponse({ status: 200, description: 'Gem dropped successfully' })
  async dropGem(@Body() body: GameIdDto, @User() user: iInfoToken) {
    const result = await this.dungeonService.dropGem(body, user.address);
    return new BaseResult(result);
  }

  @JWT()
  @Post('finish-boss')
  @ApiOperation({ summary: 'Get reward for killing boss' })
  @ApiResponse({ status: 200, description: 'Reward fetched successfully' })
  async finishBoss(@Body() body: GameIdDto, @User() user: iInfoToken) {
    const result = await this.dungeonService.finishBoss(body, user.address);
    return new BaseResult(result);
  }
}
