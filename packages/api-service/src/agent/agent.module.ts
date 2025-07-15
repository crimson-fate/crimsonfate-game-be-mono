import { Module } from '@nestjs/common';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AgentPlayerData,
  AgentPlayerDataSchema,
} from '@app/shared/models/schema/agent-player-data.schema';
import {
  AgentReward,
  AgentRewardSchema,
} from '@app/shared/models/schema/agent-reward.schema';
import { Web3Service } from '@app/web3';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AgentPlayerData.name, schema: AgentPlayerDataSchema },
      { name: AgentReward.name, schema: AgentRewardSchema },
    ]),
  ],
  controllers: [AgentController],
  providers: [AgentService, Web3Service],
})
export class AgentModule {}
