import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EquipmentController } from './equipment.controller';
import { EquipmentService } from './equipment.service';
import {
  Equipment,
  EquipmentSchema,
} from '@app/shared/models/schema/equipment.schema';
import { Players, PlayerSchema } from '@app/shared/models/schema/player.schema';
import { PlayersService } from '../players/players.service';
import { Web3Service } from '@app/web3';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Equipment.name, schema: EquipmentSchema },
      { name: Players.name, schema: PlayerSchema },
    ]),
  ],
  controllers: [EquipmentController],
  providers: [EquipmentService, PlayersService, Web3Service],
})
export class EquipmentModule {}
