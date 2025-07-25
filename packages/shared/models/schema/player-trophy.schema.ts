import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema } from './base.schema';
import { Document, SchemaTypes } from 'mongoose';
import { PlayersDocument } from './player.schema';

export type PlayerTrophyProgressDocument = PlayerTrophyProgress & Document;

@Schema({ timestamps: true })
export class PlayerTrophyProgress extends BaseSchema {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Players' })
  player: PlayersDocument;

  @Prop()
  taskId: string;

  @Prop()
  count: number;

  @Prop()
  time: number;
}

export const PlayerTrophyProgressSchema =
  SchemaFactory.createForClass(PlayerTrophyProgress);
PlayerTrophyProgressSchema.index({ player: 1, taskId: 1 });
