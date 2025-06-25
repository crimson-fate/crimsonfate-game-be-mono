import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema } from './base.schema';
import { PlayersDocument } from './player.schema';
import { Document, SchemaTypes } from 'mongoose';

export type BossRewardDocument = BossReward & Document;

@Schema({ timestamps: true })
export class BossReward extends BaseSchema {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Players' })
  player: PlayersDocument;

  @Prop()
  wave: number;

  @Prop()
  rank: number;

  @Prop()
  gems: number;

  @Prop()
  rewardedAt: number;
}

export const BossRewardSchema = SchemaFactory.createForClass(BossReward);
BossRewardSchema.index({ player: 1, wave: 1 });
