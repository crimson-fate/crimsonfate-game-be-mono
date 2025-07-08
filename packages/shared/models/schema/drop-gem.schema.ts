import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema } from './base.schema';
import { Players } from './player.schema';
import { Document, SchemaTypes } from 'mongoose';

export type DropGemDocument = DropGem & Document;

@Schema({ timestamps: true })
export class DropGem extends BaseSchema {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Players' })
  player: Players;

  @Prop({ type: SchemaTypes.UUID })
  gameId: string;

  @Prop()
  gems: number;

  @Prop({ default: Math.floor(Date.now() / 1000) })
  saltNonce?: number;

  @Prop({ type: Boolean, default: false })
  isClaimed?: boolean;

  @Prop({ type: Boolean, default: false })
  isCancelled?: boolean;
}

export const DropGemSchema = SchemaFactory.createForClass(DropGem);
DropGemSchema.index({ player: 1, gameId: 1 }, { unique: true });
DropGemSchema.index({ player: 1, isClaimed: 1 });
DropGemSchema.index({ player: 1, isCancelled: 1 });
