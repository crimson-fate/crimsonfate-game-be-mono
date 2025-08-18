import {
  PlayerActivity,
  PlayerActivityDocument,
} from '@app/shared/models/schema/player-activity.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectModel(PlayerActivity.name)
    private readonly playerActivityModel: Model<PlayerActivityDocument>,
  ) {}

  async getActivities() {
    const activities = await this.playerActivityModel
      .find({}, {}, { sort: { timestamp: -1 }, limit: 50 })
      .populate([{ path: 'player', select: ['address', 'username'] }]);

    return activities;
  }
}
