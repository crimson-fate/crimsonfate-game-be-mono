import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { PlayersService } from './players.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AddressDto } from './dto/address.dto';
import { BaseResult } from '@app/shared/utils/types';
import { TypedData } from 'starknet';
import { VerifySignatureDto } from './dto/verifySignature.dto';
import { iInfoToken, JWT, User } from '@app/shared/jwt';
import { PlayersDocument } from '@app/shared/models/schema/player.schema';

@Controller('player')
@ApiTags('Player')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get('auth/get-message')
  @ApiOperation({ summary: 'Get message for authentication' })
  @ApiResponse({
    status: 200,
    description: 'Return message with new nonce for authentication',
  })
  async getAuthMessage(
    @Query() query: AddressDto,
  ): Promise<BaseResult<TypedData>> {
    const message = await this.playersService.getAuthMessage(query.address);
    return new BaseResult(message);
  }

  @Post('auth/verify-signature')
  @ApiOperation({ summary: 'Verify signature for authentication' })
  @ApiResponse({
    status: 200,
    description: 'Return access token if signature is valid or error message',
  })
  async verifySignature(
    @Body() query: VerifySignatureDto,
  ): Promise<BaseResult<string>> {
    const result = await this.playersService.verifySignature(query);
    return new BaseResult(result);
  }

  @Get('info')
  @JWT()
  @ApiOperation({ summary: 'Get user info' })
  @ApiResponse({
    status: 200,
    description: 'Return user info',
  })
  async getUserInfo(
    @User() user: iInfoToken,
  ): Promise<BaseResult<PlayersDocument>> {
    const player = await this.playersService.getPlayerInfo(user.address);
    return new BaseResult(player);
  }
}
