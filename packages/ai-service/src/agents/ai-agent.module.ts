import { Module } from '@nestjs/common';
import { MongooseModule, Schema } from '@nestjs/mongoose';
import { AiAgentController } from './ai-agent.controller';
import { AiAgentService } from './ai-agent.service';
import {
  ChatHistory,
  ChatHistorySchema,
} from '@app/shared/models/schema/chat-history.schema';
import { ChatHistoryService } from './services/chat-history.service';
import {
  AgentPlayerData,
  AgentPlayerDataSchema,
} from '@app/shared/models/schema/agent-player-data.schema';
import { AiDealerAgentService } from './services/ai-dealer-agent.service';
import {
  UserFeedbackData,
  UserFeedbackDataSchema,
} from '@app/shared/models/schema/user-feedback.schema';
import { FeedbackService } from './services/feedback.service';
import {
  PlayerResource,
  PlayerResourceSchema,
} from '@app/shared/models/schema/player-resource.schema';
import {
  PlayerProgress,
  PlayerProgressSchema,
} from '@app/shared/models/schema/player-progress.schema';
import { DungeonService } from 'api-service/src/dungeon/dungeon.service';

import { Players, PlayerSchema } from '@app/shared/models/schema/player.schema';
import { PlayersService } from 'api-service/src/players/players.service';
import {
  DropGem,
  DropGemSchema,
} from '@app/shared/models/schema/drop-gem.schema';
import {
  DistributeBossReward,
  DistributeBossRewardSchema,
} from '@app/shared/models/schema/distribute-boss-reward.schema';
import {
  BossReward,
  BossRewardSchema,
} from '@app/shared/models/schema/boss-reward.schema';
import Redis from 'ioredis';
import configuration from '@app/shared/configuration';
import { Web3Service } from '@app/web3';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatHistory.name, schema: ChatHistorySchema },
      { name: AgentPlayerData.name, schema: AgentPlayerDataSchema },
      { name: UserFeedbackData.name, schema: UserFeedbackDataSchema },
      { name: PlayerResource.name, schema: PlayerResourceSchema },
      { name: PlayerProgress.name, schema: PlayerProgressSchema },

      { name: Players.name, schema: PlayerSchema },
      { name: DropGem.name, schema: DropGemSchema },
      { name: DistributeBossReward.name, schema: DistributeBossRewardSchema },
      { name: BossReward.name, schema: BossRewardSchema },
    ]),
  ],
  controllers: [AiAgentController],
  providers: [
    AiAgentService,
    AiDealerAgentService,
    ChatHistoryService,
    FeedbackService,
    DungeonService,
    PlayersService,
    Web3Service,
    JwtService,
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
  exports: [AiAgentService, AiDealerAgentService, FeedbackService],
})
export class AiAgentModule {}
