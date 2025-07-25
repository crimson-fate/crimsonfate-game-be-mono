import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Players, PlayerSchema } from '@app/shared/models/schema/player.schema';
import { GemService } from './gem.service';
import { GemController } from './gem.controller';
import { Web3Service } from '@app/web3';
import { PlayersService } from '../players/players.service';
import {
  DropGem,
  DropGemSchema,
} from '@app/shared/models/schema/drop-gem.schema';
import {
  PlayerTrophyProgress,
  PlayerTrophyProgressSchema,
} from '@app/shared/models/schema/player-trophy.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Players.name, schema: PlayerSchema },
      { name: DropGem.name, schema: DropGemSchema },
      { name: PlayerTrophyProgress.name, schema: PlayerTrophyProgressSchema },
    ]),
  ],
  providers: [GemService, Web3Service, PlayersService],
  controllers: [GemController],
})
export class GemModule {}
