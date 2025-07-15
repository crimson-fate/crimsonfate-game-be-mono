import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class GetAgentFarmDto {
  @ApiProperty({
    description: 'Progress ID use when user go to dungeon',
    required: true,
  })
  progressId: number;
}
export class CreateAgentFarmDto {
  @ApiProperty({ description: 'Wallet address of the player' })
  @IsString()
  walletAddress: string;

  @ApiProperty({ description: 'Whether the player is currently farming' })
  @IsBoolean()
  isFarming?: boolean;

  @ApiProperty({ description: 'Start time of farming in milliseconds' })
  @IsNumber()
  startTime?: number;

  @ApiProperty({ description: 'Duration of farming in milliseconds' })
  @IsNumber()
  duration?: number;

  @ApiProperty({
    description: 'Item counts by rarity',
    example: { common: 0, great: 0, rare: 0, epic: 0 },
  })
  @IsObject()
  @IsOptional()
  itemCounts?: {
    common: number;
    great: number;
    rare: number;
    epic: number;
  };

  @ApiProperty({ description: 'Amount of gems staked by the player' })
  @IsNumber()
  @IsOptional()
  stakedGem?: number;

  @ApiProperty({
    description: 'Progress ID use when user go to dungeon',
    required: true,
  })
  progressId: number;
}

export class UpdateAgentFarmDto {
  @ApiProperty({ description: 'Whether the player is currently farming' })
  @IsBoolean()
  isFarming: boolean;

  @ApiProperty({ description: 'Start time of farming in milliseconds' })
  @IsNumber()
  startTime: number;

  @ApiProperty({ description: 'Duration of farming in milliseconds' })
  @IsNumber()
  duration: number;

  @ApiProperty({
    description: 'Item counts by rarity',
    example: { common: 0, great: 0, rare: 0, epic: 0 },
  })
  @IsOptional()
  @IsObject()
  itemCounts?: {
    common: number;
    great: number;
    rare: number;
    epic: number;
  };

  @ApiProperty({ description: 'Amount of gems staked by the player' })
  @IsNumber()
  @IsOptional()
  stakedGem?: number;

  @ApiProperty({
    description: 'Progress ID use when user go to dungeon',
    required: true,
  })
  progressId: number;
}

export class BoostAgentDto {
  @ApiProperty({
    description: 'Progress ID use when user go to dungeon',
    required: true,
  })
  progressId: number;

  @ApiProperty({ description: 'Duration of farming in milliseconds' })
  @IsNumber()
  amount: number;
  @IsNumber()
  duration: number;
}
