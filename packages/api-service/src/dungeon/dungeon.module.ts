import { Module } from '@nestjs/common';
import { DungeonService } from './dungeon.service';
import { DungeonController } from './dungeon.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Seasons, SeasonSchema } from '@app/shared/models/schema/season.schema';
import { Players, PlayerSchema } from '@app/shared/models/schema/player.schema';
import {
  PlayerProgress,
  PlayerProgressSchema,
} from '@app/shared/models/schema/player-progress.schema';
import { PlayersService } from '../players/players.service';
import { Web3Service } from '@app/web3';
import {
  DropGem,
  DropGemSchema,
} from '@app/shared/models/schema/drop-gem.schema';
import {
  DistributeBossReward,
  DistributeBossRewardSchema,
} from '@app/shared/models/schema/distribute-boss-reward.schema';
import { createClient } from 'redis';
import Redis from 'ioredis';
import configuration from '@app/shared/configuration';
import {
  BossReward,
  BossRewardSchema,
} from '@app/shared/models/schema/boss-reward.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Seasons.name, schema: SeasonSchema },
      { name: Players.name, schema: PlayerSchema },
      { name: PlayerProgress.name, schema: PlayerProgressSchema },
      { name: DropGem.name, schema: DropGemSchema },
      { name: DistributeBossReward.name, schema: DistributeBossRewardSchema },
      { name: BossReward.name, schema: BossRewardSchema },
    ]),
  ],
  providers: [
    DungeonService,
    PlayersService,
    Web3Service,
    {
      provide: 'REDIS_OPTIONS',
      useValue: {
        url: configuration().REDIS.URL,
      },
    },
    {
      inject: ['REDIS_OPTIONS'],
      provide: 'REDIS_CLIENT',
      useFactory: async (options: { url: string }) => {
        const client = new Redis({
          host: configuration().REDIS.HOST,
          port: configuration().REDIS.PORT,
          username: configuration().REDIS.USERNAME,
          password: configuration().REDIS.PASSWORD,
        });
        // await client.connect();
        return client;
      },
    },
  ],
  controllers: [DungeonController],
})
export class DungeonModule {}
