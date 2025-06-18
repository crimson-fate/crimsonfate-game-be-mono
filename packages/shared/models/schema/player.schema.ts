import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

export type PlayersDocument = Players & Document;
@Schema()
export class Players extends Document {
  _id: string;

  @Prop()
  address: string;

  @Prop()
  username: string;

  @Prop({ type: SchemaTypes.UUID })
  nonce: string;

  @Prop({ type: SchemaTypes.Boolean, default: false })
  isClaimInitialGem?: boolean;

  @Prop()
  initlaGemNonce: number;
}

export const PlayerSchema = SchemaFactory.createForClass(Players);
PlayerSchema.index({ player: 1 });
