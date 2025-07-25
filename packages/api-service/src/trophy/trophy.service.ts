import {
  PlayerTrophyProgress,
  PlayerTrophyProgressDocument,
} from '@app/shared/models/schema/player-trophy.schema';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ProgressTrophyDto } from './dto/progressTrophy.dto';
import { Web3Service } from '@app/web3';
import { PlayersService } from '../players/players.service';
import { Model } from 'mongoose';

@Injectable()
export class TrophyService {
  constructor(
    @InjectModel(PlayerTrophyProgress.name)
    private readonly playerTrophyProgressModel: Model<PlayerTrophyProgressDocument>,
    private readonly web3Service: Web3Service,
    private readonly playerService: PlayersService,
  ) {}

  async claimTaskProgressSuccess(body: ProgressTrophyDto) {
    const { player, taskId, count, time, transactionHash } = body;
    const isSuccess = await this.web3Service.checkTransaction(transactionHash);
    if (!isSuccess) {
      throw new HttpException('Transaction failed', HttpStatus.BAD_REQUEST);
    }
    const playerDoc = await this.playerService.getPlayerInfo(player);
    await this.playerTrophyProgressModel.create({
      player: playerDoc,
      taskId,
      count,
      time,
    });

    return true;
  }
}
