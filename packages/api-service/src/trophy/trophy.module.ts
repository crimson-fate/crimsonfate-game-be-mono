import { Module } from '@nestjs/common';
import { TrophyController } from './trophy.controller';
import { TrophyService } from './trophy.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PlayerTrophyProgress,
  PlayerTrophyProgressSchema,
} from '@app/shared/models/schema/player-trophy.schema';
import { Players, PlayerSchema } from '@app/shared/models/schema/player.schema';
import { Web3Service } from '@app/web3';
import { PlayersService } from '../players/players.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PlayerTrophyProgress.name, schema: PlayerTrophyProgressSchema },
      { name: Players.name, schema: PlayerSchema },
    ]),
  ],
  controllers: [TrophyController],
  providers: [TrophyService, Web3Service, PlayersService],
})
export class TrophyModule {}
