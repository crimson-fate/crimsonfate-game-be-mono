import { Module } from '@nestjs/common';
import { PlayersService } from './players.service';
import { PlayersController } from './players.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Players, PlayerSchema } from '@app/shared/models/schema/player.schema';
import { Web3Service } from '@app/web3';
import { JwtStrategy } from '@app/shared/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Players.name, schema: PlayerSchema }]),
  ],
  controllers: [PlayersController],
  providers: [PlayersService, Web3Service, JwtStrategy],
})
export class PlayersModule {}
