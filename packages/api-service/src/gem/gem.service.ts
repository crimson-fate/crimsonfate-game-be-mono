import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PlayersService } from '../players/players.service';
import { shortString, stark, typedData, TypedData, uint256 } from 'starknet';
import { Web3Service } from '@app/web3';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  DropGem,
  DropGemDocument,
} from '@app/shared/models/schema/drop-gem.schema';
import { GameIdDto } from '../dungeon/dto/gameId.dto';
import { TransactionDto } from './dto/transaction.dto';
import { ClaimDungeonGemDto } from './dto/claimDungeonGem.dto';
import {
  PlayerTrophyProgress,
  PlayerTrophyProgressDocument,
} from '@app/shared/models/schema/player-trophy.schema';
import { parseUnits } from 'ethers';

@Injectable()
export class GemService {
  constructor(
    @InjectModel(DropGem.name)
    private readonly dropGemModel: Model<DropGemDocument>,
    @InjectModel(PlayerTrophyProgress.name)
    private readonly playerTrophyProgressModel: Model<PlayerTrophyProgressDocument>,
    private readonly playerService: PlayersService,
    private readonly web3Service: Web3Service,
  ) {}

  async claimInitialGem(
    address: string,
  ): Promise<{ saltNonce: number; keys: string[] }> {
    const player = await this.playerService.getPlayerInfo(address);
    if (player.isClaimInitialGem) {
      throw new HttpException('Player already claimed', HttpStatus.BAD_REQUEST);
    }

    const message = this.getClaimGemMessage(address, 50, player.initlaGemNonce);
    const valAccount = this.web3Service.getValidatorAccount();
    const signature = await valAccount.signMessage(message);
    const formattedKeys = stark.formatSignature(signature);

    return { saltNonce: player.initlaGemNonce, keys: formattedKeys };
  }

  getClaimGemMessage(
    address: string,
    amount: number,
    nonce: number,
  ): TypedData {
    const message: TypedData = {
      types: {
        StarkNetDomain: [
          {
            name: 'name',
            type: 'felt',
          },
          {
            name: 'version',
            type: 'felt',
          },
          {
            name: 'chainId',
            type: 'felt',
          },
        ],
        ClaimGemParams: [
          {
            name: 'player',
            type: 'felt',
          },
          {
            name: 'amount',
            type: 'u256',
          },
          {
            name: 'salt_nonce',
            type: 'felt',
          },
        ],
        u256: [
          {
            name: 'low',
            type: 'felt',
          },
          {
            name: 'high',
            type: 'felt',
          },
        ],
      },
      primaryType: 'ClaimGemParams',
      domain: {
        name: 'crimson-fate',
        version: '1',
        chainId: shortString.encodeShortString('SN_MAIN'),
      },
      message: {
        player: address,
        amount: uint256.bnToUint256(parseUnits(amount.toString(), 18)),
        salt_nonce: nonce,
      },
    };

    return message;
  }

  async claimDungeonGem(
    query: GameIdDto,
    address: string,
  ): Promise<{
    amount: number;
    saltNonce: number;
    keys: string[];
    achievement: {
      taskId: string;
      count: number;
      time: number;
      keys: string[];
    } | null;
  }> {
    const player = await this.playerService.getPlayerInfo(address);
    const { gameId } = query;
    const dropGemDocument = await this.dropGemModel.findOne({
      player: player._id,
      gameId,
    });

    if (
      !dropGemDocument ||
      dropGemDocument.isClaimed ||
      dropGemDocument.isCancelled
    ) {
      throw new HttpException(
        'Can not claim gem for this game',
        HttpStatus.BAD_REQUEST,
      );
    }

    const message = this.getClaimGemMessage(
      address,
      dropGemDocument.gems,
      dropGemDocument.saltNonce,
    );
    const valAccount = this.web3Service.getValidatorAccount();
    const signature = await valAccount.signMessage(message);
    const formattedKeys = stark.formatSignature(signature);

    const amountOfClaimedGem = await this.dropGemModel.aggregate([
      {
        $match: {
          player: player._id,
          isClaimed: true,
        },
      },
      {
        $group: {
          _id: null,
          amount: { $sum: '$gems' },
        },
      },
    ]);
    const totalGems = amountOfClaimedGem[0]
      ? amountOfClaimedGem[0].amount + dropGemDocument.gems
      : dropGemDocument.gems;

    let taskId = 0;
    let count = 0;
    let isFound = false;
    const playerTrophyProgresses = await this.playerTrophyProgressModel.find({
      player: player._id,
      taskId: { $in: [6, 7, 8, 9, 10] },
    });
    if (
      totalGems >= 1000 &&
      playerTrophyProgresses.find((i) => i.taskId === '6')
    ) {
      taskId = 6;
      count = 1000;
      isFound = true;
    }
    if (
      totalGems >= 3000 &&
      !isFound &&
      playerTrophyProgresses.find((i) => i.taskId === '7')
    ) {
      taskId = 7;
      count = 3000;
      isFound = true;
    }
    if (
      totalGems >= 10000 &&
      !isFound &&
      playerTrophyProgresses.find((i) => i.taskId === '8')
    ) {
      taskId = 8;
      count = 10000;
      isFound = true;
    }
    if (
      totalGems >= 20000 &&
      !isFound &&
      playerTrophyProgresses.find((i) => i.taskId === '9')
    ) {
      taskId = 9;
      count = 20000;
      isFound = true;
    }
    if (
      totalGems >= 50000 &&
      !isFound &&
      playerTrophyProgresses.find((i) => i.taskId === '10')
    ) {
      taskId = 10;
      count = 50000;
      isFound = true;
    }
    const time = Math.floor(Date.now() / 1e3);

    return {
      amount: dropGemDocument.gems,
      saltNonce: dropGemDocument.saltNonce,
      keys: formattedKeys,
      achievement:
        taskId > 0 && count > 0
          ? {
              taskId: taskId.toString(),
              count,
              time,
              keys: await this.web3Service.signTaskProgress(
                player.address,
                taskId.toString(),
                count,
                time,
              ),
            }
          : null,
    };
  }

  async claimDungeonGemSuccess(
    query: ClaimDungeonGemDto,
    address: string,
  ): Promise<boolean> {
    const { transactionHash, gameId } = query;
    const player = await this.playerService.getPlayerInfo(address);
    const isSuccess = await this.web3Service.checkTransaction(transactionHash);
    if (!isSuccess) {
      throw new HttpException('Transaction failed', HttpStatus.BAD_REQUEST);
    }

    const dropGemDocument = await this.dropGemModel.findOne({
      player: player._id,
      gameId,
    });

    dropGemDocument.isClaimed = true;
    await dropGemDocument.save();

    return true;
  }

  async claimInitialGemSuccess(
    query: TransactionDto,
    address: string,
  ): Promise<boolean> {
    const { transactionHash } = query;
    const player = await this.playerService.getPlayerInfo(address);
    const isSuccess = await this.web3Service.checkTransaction(transactionHash);
    if (!isSuccess) {
      throw new HttpException('Transaction failed', HttpStatus.BAD_REQUEST);
    }

    player.isClaimInitialGem = true;
    await player.save();

    return true;
  }
}
