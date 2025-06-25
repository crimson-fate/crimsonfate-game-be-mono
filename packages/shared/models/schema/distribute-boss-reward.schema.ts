import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema } from './base.schema';
import { Document } from 'mongoose';

export type DistributeBossRewardDocument = DistributeBossReward & Document;

@Schema({ timestamps: true })
export class DistributeBossReward extends BaseSchema {
  @Prop()
  wave: number;

  @Prop()
  totalGems: number;

  @Prop()
  remainingGems: number;

  @Prop()
  maxWinner: number;

  @Prop()
  decayRate: number;
}

export const DistributeBossRewardSchema =
  SchemaFactory.createForClass(DistributeBossReward);
DistributeBossRewardSchema.index({ wave: 1 });
