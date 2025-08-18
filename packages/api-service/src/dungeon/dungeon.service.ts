import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { walletAddressDto } from './dto/WalletAddress.dto';
import { Model, Types } from 'mongoose';
import { Seasons } from '@app/shared/models/schema/season.schema';
import { Players } from '@app/shared/models/schema/player.schema';
import { PlayerProgress } from '@app/shared/models/schema/player-progress.schema';
import { CompleteWaveDto } from './dto/CompleteWave.dto';
import { GetCurrentRankDto, SeasonIdDto } from './dto/SeasonId.dto';
import { v1 as uuidv1 } from 'uuid';
import { PlayersService } from '../players/players.service';
import { PlayerProgressDto } from './dto/PlayerProgress.dto';
import { GameIdDto } from './dto/gameId.dto';
import {
  DropGem,
  DropGemDocument,
} from '@app/shared/models/schema/drop-gem.schema';
import {
  DistributeBossReward,
  DistributeBossRewardDocument,
} from '@app/shared/models/schema/distribute-boss-reward.schema';
import { Redis } from 'ioredis';
import {
  BossReward,
  BossRewardDocument,
} from '@app/shared/models/schema/boss-reward.schema';
import { Web3Service } from '@app/web3';
import {
  PlayerTrophyProgress,
  PlayerTrophyProgressDocument,
} from '@app/shared/models/schema/player-trophy.schema';
import {
  PlayerActivity,
  PlayerActivityDocument,
} from '@app/shared/models/schema/player-activity.schema';

@Injectable()
export class DungeonService {
  constructor(
    @InjectModel(Seasons.name)
    private readonly seasonModel: Model<Seasons>,
    @InjectModel(Players.name)
    private readonly PlayersModel: Model<Players>,
    @InjectModel(PlayerProgress.name)
    private readonly playerProgressModel: Model<PlayerProgress>,
    @InjectModel(DropGem.name)
    private readonly dropGemModel: Model<DropGemDocument>,
    @InjectModel(DistributeBossReward.name)
    private readonly distributeBossRewardModel: Model<DistributeBossRewardDocument>,
    @InjectModel(BossReward.name)
    private readonly bossRewardModel: Model<BossRewardDocument>,
    @InjectModel(PlayerTrophyProgress.name)
    private readonly playerTrophyProgressModel: Model<PlayerTrophyProgressDocument>,
    @InjectModel(PlayerActivity.name)
    private readonly playerActivityModel: Model<PlayerActivityDocument>,
    private readonly playerService: PlayersService,
    private readonly web3Service: Web3Service,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async getCurrentSeason() {
    const now = Date.now();
    const currentSeason = await this.seasonModel.findOne({
      startDate: { $lte: now },
      endDate: { $gt: now },
    });

    return currentSeason;
  }

  async startNewGame(query: walletAddressDto) {
    const { walletAddress } = query;

    const now = Date.now();
    const currentSeason = await this.seasonModel.findOne({
      startDate: { $lte: now },
      endDate: { $gt: now },
    });

    const player = await this.playerService.getOrCreeatePlayer(walletAddress);
    await this.playerProgressModel.updateMany(
      {
        player: player._id,
        season: currentSeason ? currentSeason._id : null,
        endTime: 0,
      },
      { $set: { endTime: now } },
    );

    const newProgress = new this.playerProgressModel({
      player: player,
      wave: 1,
      gameId: uuidv1(),
      season: currentSeason,
      startTime: now,
      endTime: 0,
      isCompleted: false,
    });

    const progress = await (
      await newProgress.save()
    ).populate(['player', 'season']);

    const amountOfNewGame = await this.playerProgressModel.countDocuments({
      player: player._id,
      gameId: newProgress.gameId.toString(),
      wave: 1,
    });
    let count = 0;
    let taskId = 0;
    let isFound = false;
    const time = Math.floor(Date.now() / 1e3);

    const playerTrophyProgresses = await this.playerTrophyProgressModel.find({
      player: player._id,
      taskId: { $in: [1, 2, 3, 4, 5] },
    });
    if (amountOfNewGame >= 100) {
      if (playerTrophyProgresses.find((i) => i.taskId === '1')) {
        taskId = 1;
        count = 100;
        isFound = true;
      }
    }
    if (amountOfNewGame >= 200 && !isFound) {
      if (playerTrophyProgresses.find((i) => i.taskId === '2')) {
        taskId = 2;
        count = 200;
        isFound = true;
      }
    }

    if (amountOfNewGame >= 400 && !isFound) {
      if (playerTrophyProgresses.find((i) => i.taskId === '3')) {
        taskId = 3;
        count = 400;
        isFound = true;
      }
    }
    if (amountOfNewGame >= 800 && !isFound) {
      if (playerTrophyProgresses.find((i) => i.taskId === '4')) {
        taskId = 4;
        count = 800;
        isFound = true;
      }
    }
    if (amountOfNewGame >= 1500 && !isFound) {
      if (playerTrophyProgresses.find((i) => i.taskId === '5')) {
        taskId = 5;
        count = 1500;
        isFound = true;
      }
    }

    const result: PlayerProgressDto = {
      player: {
        address: progress.player.address,
        username: progress.player.username,
      },
      gameId: progress.gameId.toString(),
      wave: progress.wave,
      season: progress.season
        ? {
            id: progress.season._id,
            name: progress.season.name,
            startDate: progress.season.startDate,
            endDate: progress.season.endDate,
          }
        : null,
      startTime: progress.startTime,
      endTime: progress.endTime,
      isCompleted: progress.isCompleted,
      achievements:
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

    await this.dropGemModel.updateMany(
      {
        player: player._id,
        isClaimed: false,
        isCancelled: false,
      },
      {
        $set: {
          isCancelled: true,
        },
      },
    );

    await this.dropGemModel.create({
      player: player._id,
      gameId: newProgress.gameId.toString(),
      gem: 0,
      saltNonce: Math.floor(Date.now() / 1000),
    });

    await this.playerActivityModel.create({
      player: player._id,
      message: 'has started a new dungeon run',
      timestamp: Date.now(),
    });

    return result;
  }

  async getCurrentGame(query: walletAddressDto) {
    const { walletAddress } = query;

    const player = await this.playerService.getOrCreeatePlayer(walletAddress);

    const now = Date.now();
    const currentSeason = await this.seasonModel.findOne({
      startDate: { $lte: now },
      endDate: { $gt: now },
    });

    const playerProgress = await this.playerProgressModel
      .findOne(
        {
          player: player._id,
          season: currentSeason ? currentSeason._id : null,
          endTime: 0,
        },
        {},
        { sort: { wave: -1, startTime: -1 } },
      )
      .populate(['player', 'season']);

    if (!playerProgress) {
      return null;
    }

    const result: PlayerProgressDto = {
      player: {
        address: playerProgress.player.address,
        username: playerProgress.player.username,
      },
      gameId: playerProgress.gameId.toString(),
      wave: playerProgress.wave,
      season: playerProgress.season
        ? {
            id: playerProgress.season._id,
            name: playerProgress.season.name,
            startDate: playerProgress.season.startDate,
            endDate: playerProgress.season.endDate,
          }
        : null,
      startTime: playerProgress.startTime,
      endTime: playerProgress.endTime,
      isCompleted: playerProgress.isCompleted,
      achievements: null,
    };
    return result;
  }

  async completeWave(query: CompleteWaveDto) {
    const { walletAddress, gameId } = query;

    const player = await this.playerService.getOrCreeatePlayer(walletAddress);

    const now = Date.now();
    const currentSeason = await this.seasonModel.findOne({
      startDate: { $lte: now },
      endDate: { $gt: now },
    });

    const playerProgress = await this.playerProgressModel.findOne(
      {
        gameId,
        player: player._id,
        season: currentSeason ? currentSeason._id : null,
      },
      {},
      { sort: { wave: -1, startTime: -1 } },
    );

    if (!playerProgress) {
      throw new HttpException(
        'Player progress not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (playerProgress.endTime > 0) {
      throw new HttpException(
        'Player progress already ended',
        HttpStatus.BAD_REQUEST,
      );
    }

    playerProgress.isCompleted = true;
    playerProgress.endTime = now;
    await playerProgress.save();
    const timeOfFinish = Math.floor(Date.now() / 1e3);
    if (playerProgress.wave === 50) {
      const playerTrophyProgress = await this.playerTrophyProgressModel.findOne(
        {
          player: player._id,
          taskId: '14',
        },
      );

      return {
        player: {
          address: playerProgress.player.address,
          username: playerProgress.player.username,
        },
        gameId: playerProgress.gameId.toString(),
        wave: playerProgress.wave,
        season: currentSeason
          ? {
              id: playerProgress.season._id,
              name: playerProgress.season.name,
              startDate: playerProgress.season.startDate,
              endDate: playerProgress.season.endDate,
            }
          : null,
        startTime: playerProgress.startTime,
        endTime: playerProgress.endTime,
        isCompleted: playerProgress.isCompleted,
        achievements: !playerTrophyProgress
          ? {
              taskId: '14',
              count: 1,
              time: timeOfFinish,
              keys: await this.web3Service.signTaskProgress(
                player.address,
                '14',
                1,
                timeOfFinish,
              ),
            }
          : null,
      };
    }

    let achievements = null;
    if (
      playerProgress.wave === 20 ||
      playerProgress.wave === 30 ||
      playerProgress.wave === 40
    ) {
      const taskId =
        playerProgress.wave === 20 ? 11 : playerProgress.wave === 30 ? 12 : 13;

      const playerTrophyProgress = await this.playerTrophyProgressModel.findOne(
        {
          player: player._id,
          taskId,
        },
      );
      if (!playerTrophyProgress) {
        achievements = {
          taskId,
          count: 1,
          time: timeOfFinish,
          keys: await this.web3Service.signTaskProgress(
            player.address,
            taskId.toString(),
            1,
            timeOfFinish,
          ),
        };
      }
    }

    const boss =
      playerProgress.wave === 10
        ? 'Margit'
        : playerProgress.wave === 20
          ? 'Vyrath'
          : playerProgress.wave === 30
            ? 'Lysmera'
            : playerProgress.wave === 40
              ? 'Gorathax'
              : playerProgress.wave === 50
                ? 'Maldrakar'
                : null;
    if (boss) {
      await this.playerActivityModel.create({
        player: player._id,
        message: `slay ${boss} Boss`,
        timestamp: Date.now(),
      });
    }

    const newProgress = new this.playerProgressModel({
      player: player,
      wave: playerProgress.wave + 1,
      gameId,
      season: currentSeason,
      startTime: now,
      endTime: 0,
      isCompleted: false,
    });
    const progress = await newProgress.save();
    const result: PlayerProgressDto = {
      player: {
        address: progress.player.address,
        username: progress.player.username,
      },
      gameId: progress.gameId.toString(),
      wave: progress.wave,
      season: currentSeason
        ? {
            id: progress.season._id,
            name: progress.season.name,
            startDate: progress.season.startDate,
            endDate: progress.season.endDate,
          }
        : null,
      startTime: progress.startTime,
      endTime: progress.endTime,
      isCompleted: progress.isCompleted,
      achievements,
    };
    return result;
  }

  async endWave(query: CompleteWaveDto) {
    const { walletAddress, gameId } = query;

    const player = await this.playerService.getOrCreeatePlayer(walletAddress);
    const now = Date.now();
    const currentSeason = await this.seasonModel.findOne({
      startDate: { $lte: now },
      endDate: { $gt: now },
    });

    const playerProgress = await this.playerProgressModel.findOne(
      {
        gameId,
        player: player._id,
        season: currentSeason ? currentSeason._id : null,
      },
      {},
      { sort: { wave: -1 } },
    );

    if (!playerProgress) {
      throw new HttpException(
        'Player progress not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (playerProgress.endTime > 0) {
      throw new HttpException(
        'Player progress already ended',
        HttpStatus.BAD_REQUEST,
      );
    }

    playerProgress.endTime = now;
    const progress = await (
      await playerProgress.save()
    ).populate(['player', 'season']);

    await this.playerActivityModel.create({
      player: player._id,
      message: `died at wave ${playerProgress.wave}`,
      timestamp: Date.now(),
    });

    const result: PlayerProgressDto = {
      player: {
        address: progress.player.address,
        username: progress.player.username,
      },
      gameId: progress.gameId.toString(),
      wave: progress.wave,
      season: currentSeason
        ? {
            id: progress.season._id,
            name: progress.season.name,
            startDate: progress.season.startDate,
            endDate: progress.season.endDate,
          }
        : null,
      startTime: progress.startTime,
      endTime: progress.endTime,
      isCompleted: progress.isCompleted,
      achievements: null,
    };
    return result;
  }

  async getLeaderboard(query: SeasonIdDto) {
    const { seasonId } = query;

    const seasonDocument = await this.seasonModel.findOne({ _id: seasonId });
    if (!seasonDocument) {
      throw new HttpException('Season not found', HttpStatus.NOT_FOUND);
    }

    const leaderboard = await this.playerProgressModel.aggregate([
      {
        $match: {
          season: seasonDocument._id,
          isCompleted: true,
        },
      },
      {
        $group: {
          _id: {
            player: '$player',
            gameId: '$gameId',
          },
          totalWave: { $sum: 1 },
          startTime: { $first: '$startTime' },
          endTime: { $last: '$endTime' },
        },
      },
      {
        $addFields: { duration: { $subtract: ['$endTime', '$startTime'] } },
      },
      {
        $group: {
          _id: '$_id.player',
          game: {
            $top: {
              sortBy: { totalWave: -1, duration: 1 },
              output: {
                gameId: '$_id.gameId',
                totalWave: '$totalWave',
                startTime: '$startTime',
                endTime: '$endTime',
                duration: '$duration',
              },
            },
          },
        },
      },
      {
        $sort: {
          'game.totalWave': -1,
          'game.duration': 1,
        },
      },
      {
        $limit: 50,
      },
      {
        $lookup: {
          from: 'players',
          localField: '_id',
          foreignField: '_id',
          as: 'player',
        },
      },
      {
        $unwind: '$player',
      },
      {
        $project: {
          _id: 0,
          player: {
            address: '$player.address',
            username: '$player.username',
          },
          gameId: '$game.gameId',
          totalWave: '$game.totalWave',
          startTime: '$game.startTime',
          endTime: '$game.endTime',
          duration: '$game.duration',
        },
      },
    ]);

    return leaderboard;
  }

  async getCurrentRankByWalletAddress(query: GetCurrentRankDto) {
    const { seasonId, walletAddress } = query;

    const seasonObjectId = new Types.ObjectId(seasonId);
    const seasonDocument = await this.seasonModel.findById(seasonObjectId);
    if (!seasonDocument) {
      throw new HttpException('Season not found', HttpStatus.NOT_FOUND);
    }

    const player = await this.playerService.getOrCreeatePlayer(walletAddress);

    const playerId = player._id;

    const leaderboard = await this.playerProgressModel.aggregate([
      {
        $match: {
          season: seasonObjectId,
          isCompleted: true,
        },
      },
      {
        $group: {
          _id: {
            player: '$player',
            gameId: '$gameId',
          },
          totalWave: { $sum: 1 },
          startTime: { $first: '$startTime' },
          endTime: { $last: '$endTime' },
        },
      },
      {
        $addFields: {
          duration: { $subtract: ['$endTime', '$startTime'] },
        },
      },
      {
        $sort: {
          '_id.player': 1,
          totalWave: -1,
          duration: 1,
        },
      },
      {
        $group: {
          _id: '$_id.player',
          bestGame: { $first: '$$ROOT' },
        },
      },
      {
        $sort: {
          'bestGame.totalWave': -1,
          'bestGame.duration': 1,
        },
      },
      {
        $sort: {
          'bestGame.totalWave': -1,
          'bestGame.duration': 1,
        },
      },
      // Then assign ranks using only one field (e.g., totalWave)
      {
        $setWindowFields: {
          sortBy: { 'bestGame.totalWave': -1 }, // Only one field allowed here
          output: {
            rank: { $documentNumber: {} },
          },
        },
      },
      {
        $match: {
          _id: playerId,
        },
      },
      {
        $lookup: {
          from: 'players',
          localField: '_id',
          foreignField: '_id',
          as: 'playerInfo',
        },
      },
      {
        $unwind: '$playerInfo',
      },
      {
        $project: {
          _id: 0,
          rank: 1,
          player: {
            address: '$playerInfo.address',
            username: '$playerInfo.username',
          },
          gameId: '$bestGame._id.gameId',
          totalWave: '$bestGame.totalWave',
          startTime: '$bestGame.startTime',
          endTime: '$bestGame.endTime',
          duration: '$bestGame.duration',
        },
      },
    ]);

    if (leaderboard.length === 0) {
      return {
        rank: null,
        player: {
          address: player.address,
          username: player.username,
        },
        message:
          'Player is not ranked for this season (no completed games or did not meet criteria).',
      };
    }

    return leaderboard[0];
  }

  async dropGem(
    query: GameIdDto,
    player: string,
  ): Promise<{ totalGems: number; dropAmount: number }> {
    const playerDocument = await this.playerService.getPlayerInfo(player);

    const { gameId } = query;
    const playerProgress = await this.playerProgressModel.findOne(
      {
        gameId,
        player: playerDocument._id,
      },
      {},
      { sort: { wave: -1, startTime: -1 } },
    );

    if (
      !playerProgress ||
      playerProgress.endTime > 0 ||
      playerProgress.isCompleted
    ) {
      throw new HttpException(
        'Player progress not found or ended',
        HttpStatus.NOT_FOUND,
      );
    }

    const dropGemDocument = await this.dropGemModel.findOneAndUpdate(
      {
        player: playerDocument._id,
        gameId,
      },
      {
        $inc: {
          gems: 15000,
        },
      },
      { upsert: true, new: true },
    );

    return { totalGems: dropGemDocument.gems, dropAmount: 15000 };
  }

  async finishBoss(
    query: GameIdDto,
    player: string,
  ): Promise<{ totalGems: number; dropAmount: number }> {
    const playerDocument = await this.playerService.getPlayerInfo(player);
    const { gameId } = query;

    const playerProgress = await this.playerProgressModel.findOne(
      {
        gameId,
        player: playerDocument._id,
      },
      {},
      { sort: { wave: -1, startTime: -1 } },
    );

    if (
      !playerProgress ||
      playerProgress.endTime > 0 ||
      playerProgress.isCompleted
    ) {
      throw new HttpException(
        'Player progress not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const exists = await this.bossRewardModel.findOne({
      player: playerDocument._id,
      wave: playerProgress.wave,
    });
    if (exists) {
      const dropGemDocument = await this.dropGemModel.findOne({
        player: playerDocument._id,
        gameId,
      });

      return {
        totalGems: dropGemDocument ? dropGemDocument.gems : 0,
        dropAmount: 0,
      };
    }

    const distributeRewardDoc = await this.distributeBossRewardModel.findOne(
      {
        wave: playerProgress.wave,
      },
      {},
      { sort: { wave: -1, startTime: -1 } },
    );

    if (!distributeRewardDoc) {
      throw new HttpException(
        'Distribute reward not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const redisKey = `boss_wave_${playerProgress.wave}`;
    const score = Date.now();

    if (distributeRewardDoc.remainingGems > 0) {
      // 2. Push to Redis with timestamp
      await this.redis.zadd(redisKey, score, player);
    }

    let dropAmount = 0;
    const rank = await this.redis.zrank(redisKey, player);

    if (rank >= 0 && rank < distributeRewardDoc.maxWinner) {
      dropAmount = this.calculateGemReward(
        rank,
        distributeRewardDoc.maxWinner,
        distributeRewardDoc.totalGems,
        distributeRewardDoc.decayRate,
      );

      await this.bossRewardModel.create({
        player: playerDocument._id,
        wave: playerProgress.wave,
        rank: rank + 1,
        gems: dropAmount,
        rewardedAt: score,
      });

      distributeRewardDoc.remainingGems -= dropAmount;
      await distributeRewardDoc.save();
    }

    const dropGemDocument = await this.dropGemModel.findOneAndUpdate(
      {
        player: playerDocument._id,
        gameId,
      },
      {
        $inc: {
          gems: dropAmount,
        },
      },
      { upsert: true, new: true },
    );

    return { totalGems: dropGemDocument.gems, dropAmount };
  }

  private calculateGemReward(
    rank: number,
    maxWinners: number,
    totalGems: number,
    decayRate: number,
  ): number {
    const weights = [];

    // Step 1: Calculate weights using exponential decay
    for (let i = 0; i < maxWinners; i++) {
      const weight = Math.exp(-decayRate * i);
      weights.push(weight);
    }

    // Step 2: Normalize weights so their sum equals totalGems
    const weightSum = weights.reduce((sum, w) => sum + w, 0);
    const normalizedRewards = weights.map((w) =>
      Math.floor((w / weightSum) * totalGems),
    );

    // Step 3: Adjust for rounding error (if any gold remains due to flooring)
    const distributed = normalizedRewards.reduce((sum, g) => sum + g, 0);
    let remainder = totalGems - distributed;

    for (let i = 0; remainder > 0 && i < maxWinners; i++, remainder--) {
      normalizedRewards[i] += 1;
    }

    return normalizedRewards[rank];
  }
}
