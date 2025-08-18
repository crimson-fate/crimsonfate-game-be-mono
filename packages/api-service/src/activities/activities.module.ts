import { Module } from '@nestjs/common';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PlayerActivity,
  playerActivitySchema,
} from '@app/shared/models/schema/player-activity.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PlayerActivity.name, schema: playerActivitySchema },
    ]),
  ],
  providers: [ActivitiesService],
  controllers: [ActivitiesController],
})
export class ActivitiesModule {}
