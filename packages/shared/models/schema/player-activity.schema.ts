import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PlayersDocument } from './player.schema';
import { Document, SchemaTypes } from 'mongoose';

export type PlayerActivityDocument = PlayerActivity & Document;

@Schema({ timestamps: true })
export class PlayerActivity {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Players' })
  player: PlayersDocument;

  @Prop()
  message: string;

  @Prop()
  timestamp: number;
}

export const playerActivitySchema =
  SchemaFactory.createForClass(PlayerActivity);
playerActivitySchema.index({ player: 1 });
